import { prisma } from '@/lib/prisma';
import axios, { AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { DateTime } from 'luxon';
import { NextApiRequest, NextApiResponse } from 'next';

interface AffiliateEntry {
    id?: string;
    username: string;
    wagered: number | string;
}

interface LeaderboardEntry {
    username: string;
    wagered: number;
    reward: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow GET requests with proper authentication
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify the request is from Vercel Cron
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔄 Starting Luxdrop cache update...');

    try {
        // Get API configuration
        const API_KEY = process.env.LUXDROP_API_KEY;
        if (!API_KEY) {
            throw new Error('Missing Luxdrop API key');
        }

        // Get proxy configuration
        const proxyHost = process.env.PROXY_HOST;
        const proxyPortString = process.env.PROXY_PORT;
        const proxyUsername = process.env.PROXY_USERNAME;
        const proxyPassword = process.env.PROXY_PASSWORD;

        let proxyAgent: any = null;
        if (proxyHost && proxyPortString && proxyUsername && proxyPassword) {
            const proxyPort = parseInt(proxyPortString, 10);
            if (!isNaN(proxyPort)) {
                const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
                proxyAgent = new HttpsProxyAgent(proxyUrl);
            }
        }

        // Define the period: Current month
        const now = DateTime.utc();
        const startDate = now.startOf('month');
        const endDate = now.endOf('month');
        const periodLabel = `${now.toFormat('dd')}-${endDate.toFormat('dd')}${now.toFormat('MMM')} ${now.year}`;
        const startDateISO = startDate.toFormat('yyyy-MM-dd');
        const endDateISO = endDate.toFormat('yyyy-MM-dd');

        console.log(`📅 Fetching data for period: ${periodLabel} (${startDateISO} to ${endDateISO})`);

        // Make API request to Luxdrop affiliates endpoint
        const params = {
            codes: "sweetflips", // Required parameter
            startDate: startDateISO, // Optional: 2025-10-16
            endDate: endDateISO, // Optional: 2025-10-31
        };

        const config: AxiosRequestConfig = {
            method: "get",
            url: "https://api.luxdrop.com/external/affiliates",
            params: params,
            timeout: 30000,
            headers: {
                "x-api-key": API_KEY, // Required authorization header
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json",
            },
        };

        if (proxyAgent) {
            config.httpsAgent = proxyAgent;
            config.httpAgent = proxyAgent;
        }

        const response = await axios(config);
        const monthlyData: AffiliateEntry[] = response.data;

        if (!Array.isArray(monthlyData)) {
            throw new Error("API response is not an array");
        }

        console.log(`✅ Received ${monthlyData.length} entries from Luxdrop API`);

        // Filter only users with wagers > 0
        const activeWagerers = monthlyData.filter((entry: AffiliateEntry) => {
            const wagered = Number(entry.wagered) || 0;
            return wagered > 0;
        });

        const totalWagered = activeWagerers.reduce((sum: number, entry: AffiliateEntry) => {
            return sum + (Number(entry.wagered) || 0);
        }, 0);

        // Process the data - sort by wagered amount descending
        const leaderboard: LeaderboardEntry[] = activeWagerers
            .map((entry: AffiliateEntry) => ({
                username: entry.username || `User${entry.id}`,
                wagered: Math.round((Number(entry.wagered) || 0) * 100) / 100,
                reward: 0, // No automatic rewards - handled elsewhere
            }))
            .sort((a, b) => b.wagered - a.wagered)
            .slice(0, 100); // Top 100

        console.log(`🎯 Generated leaderboard: ${leaderboard.length} entries`);
        if (leaderboard.length > 0) {
            console.log(`🏆 Top player: ${leaderboard[0].username} - $${leaderboard[0].wagered} wagered`);
        }

        const responseData = {
            data: leaderboard,
            period: {
                month: now.toFormat('MMMM'),
                year: now.year,
                period: periodLabel,
                startDate: startDateISO,
                endDate: endDateISO,
                note: `Leaderboard data from ${startDateISO} to ${endDateISO}`,
                totalWagered: totalWagered,
                activeWagerers: activeWagerers.length
            }
        };

        // Store in database - both cache and individual leaderboard entries
        try {
            await prisma.luxdropCache.upsert({
                where: {
                    period_startDate_endDate: {
                        period: periodLabel,
                        startDate: startDateISO,
                        endDate: endDateISO,
                    },
                },
                update: {
                    data: responseData as any,
                    updatedAt: new Date(),
                },
                create: {
                    data: responseData as any,
                    period: periodLabel,
                    startDate: startDateISO,
                    endDate: endDateISO,
                },
            });
            console.log(`✅ Successfully cached API response`);
        } catch (cacheError: any) {
            if (cacheError.code === 'P2021' && cacheError.meta?.table === 'public.LuxdropCache') {
                console.log("⚠️ LuxdropCache table not found - skipping cache storage");
            } else {
                console.error("❌ Failed to cache API response:", cacheError);
            }
        }

        // Store individual leaderboard entries
        console.log(`💾 Storing ${leaderboard.length} leaderboard entries...`);

        try {
            // Delete existing entries for this period
            const deletedCount = await prisma.leaderboard.deleteMany({
                where: {
                    period: periodLabel,
                    startDate: startDateISO,
                    endDate: endDateISO,
                },
            });
            console.log(`🗑️ Deleted ${deletedCount.count} existing entries`);

            // Insert new entries
            const leaderboardEntries = leaderboard.map((entry, index) => ({
                username: entry.username,
                wagered: entry.wagered,
                reward: entry.reward,
                rank: index + 1, // 1-based ranking
                period: periodLabel,
                startDate: startDateISO,
                endDate: endDateISO,
            }));

            console.log(`📝 Sample entry to insert:`, leaderboardEntries[0]);

            const insertResult = await prisma.leaderboard.createMany({
                data: leaderboardEntries,
            });
            console.log(`✅ Inserted ${insertResult.count} leaderboard entries`);
        } catch (leaderboardError: any) {
            if (leaderboardError.code === 'P2021' && leaderboardError.meta?.table === 'public.Leaderboard') {
                console.log("⚠️ Leaderboard table not found - skipping leaderboard storage");
            } else {
                console.error("❌ Failed to store leaderboard entries:", leaderboardError);
            }
        }

        console.log(`💾 Successfully cached Luxdrop data: ${leaderboard.length} entries, $${totalWagered.toFixed(2)} total wagered`);

        return res.status(200).json({
            success: true,
            message: 'Luxdrop data cached successfully',
            stats: {
                totalEntries: monthlyData.length,
                activeWagerers: activeWagerers.length,
                totalWagered: totalWagered,
                leaderboardEntries: leaderboard.length,
            },
        });

    } catch (error: any) {
        console.error('❌ Failed to cache Luxdrop data:', error.message);

        if (error.response?.status === 429) {
            console.log('⚠️ Rate limited - will try again later');
            return res.status(429).json({
                error: 'Rate limited',
                message: 'Luxdrop API rate limit reached, will retry later',
            });
        }

        return res.status(500).json({
            error: 'Failed to cache Luxdrop data',
            message: error.message,
        });
    }
}
