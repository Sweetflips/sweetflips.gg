import { prisma } from '@/lib/prisma';
import { DateTime } from 'luxon';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Define the period (same as cron job and LuxdropProxy)
        const startDate = DateTime.utc(2025, 10, 16, 0, 0, 0);
        const endDate = DateTime.utc(2025, 10, 31, 23, 59, 59);
        const periodLabel = "October 16-31, 2025";
        const startDateISO = startDate.toISODate();
        const endDateISO = endDate.toISODate();

        // Get query parameters
        const { limit = '100', offset = '0' } = req.query;
        const limitNum = Math.min(parseInt(limit as string) || 100, 1000); // Max 1000 entries
        const offsetNum = Math.max(parseInt(offset as string) || 0, 0);

        console.log(`📊 Fetching leaderboard from database: ${periodLabel}`);

        // Fetch leaderboard entries from database
        const leaderboardEntries = await prisma.leaderboard.findMany({
            where: {
                period: periodLabel,
                startDate: startDateISO,
                endDate: endDateISO,
            },
            orderBy: {
                rank: 'asc',
            },
            skip: offsetNum,
            take: limitNum,
        });

        // Get total count for pagination
        const totalCount = await prisma.leaderboard.count({
            where: {
                period: periodLabel,
                startDate: startDateISO,
                endDate: endDateISO,
            },
        });

        // Calculate total wagered amount
        const totalWageredResult = await prisma.leaderboard.aggregate({
            where: {
                period: periodLabel,
                startDate: startDateISO,
                endDate: endDateISO,
            },
            _sum: {
                wagered: true,
            },
        });

        const totalWagered = totalWageredResult._sum.wagered || 0;

        // Format response data
        const responseData = {
            data: leaderboardEntries.map(entry => ({
                username: entry.username,
                wagered: Number(entry.wagered),
                reward: Number(entry.reward),
                rank: entry.rank,
            })),
            period: {
                month: "October",
                year: 2025,
                period: periodLabel,
                startDate: startDateISO,
                endDate: endDateISO,
                note: `Leaderboard data from ${startDateISO} to ${endDateISO}`,
                totalWagered: Number(totalWagered),
                activeWagerers: totalCount,
            },
            pagination: {
                total: totalCount,
                limit: limitNum,
                offset: offsetNum,
                hasMore: offsetNum + limitNum < totalCount,
            },
            meta: {
                dataSource: 'database',
                lastUpdated: leaderboardEntries.length > 0 ? leaderboardEntries[0].updatedAt : null,
            },
        };

        res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
        res.setHeader("X-Data-Source", "database");
        res.status(200).json(responseData);

    } catch (error: any) {
        console.error('❌ Failed to fetch leaderboard from database:', error.message);

        return res.status(500).json({
            error: 'Failed to fetch leaderboard data',
            message: error.message,
        });
    }
}
