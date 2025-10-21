import { prisma } from '@/lib/prisma';
import { DateTime } from 'luxon';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { username } = req.query;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: 'Username is required' });
        }

        // Define the period (same as cron job and LuxdropProxy)
        const startDate = DateTime.utc(2025, 10, 16, 0, 0, 0);
        const endDate = DateTime.utc(2025, 10, 31, 23, 59, 59);
        const periodLabel = "October 16-31, 2025";
        const startDateISO = startDate.toISODate();
        const endDateISO = endDate.toISODate();

        console.log(`👤 Fetching leaderboard position for user: ${username}`);

        // Fetch user's leaderboard entry
        const userEntry = await prisma.leaderboard.findUnique({
            where: {
                username_period_startDate_endDate: {
                    username: username,
                    period: periodLabel,
                    startDate: startDateISO,
                    endDate: endDateISO,
                },
            },
        });

        if (!userEntry) {
            return res.status(404).json({
                error: 'User not found in leaderboard',
                message: `User ${username} is not in the current leaderboard`,
            });
        }

        // Get surrounding entries (5 before and 5 after)
        const surroundingEntries = await prisma.leaderboard.findMany({
            where: {
                period: periodLabel,
                startDate: startDateISO,
                endDate: endDateISO,
                rank: {
                    gte: Math.max(1, userEntry.rank - 5),
                    lte: userEntry.rank + 5,
                },
            },
            orderBy: {
                rank: 'asc',
            },
        });

        // Get total count for context
        const totalCount = await prisma.leaderboard.count({
            where: {
                period: periodLabel,
                startDate: startDateISO,
                endDate: endDateISO,
            },
        });

        // Format response data
        const responseData = {
            user: {
                username: userEntry.username,
                wagered: Number(userEntry.wagered),
                reward: Number(userEntry.reward),
                rank: userEntry.rank,
                totalParticipants: totalCount,
                percentile: Math.round(((totalCount - userEntry.rank + 1) / totalCount) * 100),
            },
            surrounding: surroundingEntries.map(entry => ({
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
            },
            meta: {
                dataSource: 'database',
                lastUpdated: userEntry.updatedAt,
            },
        };

        res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
        res.setHeader("X-Data-Source", "database");
        res.status(200).json(responseData);

    } catch (error: any) {
        console.error('❌ Failed to fetch user leaderboard position:', error.message);

        return res.status(500).json({
            error: 'Failed to fetch user leaderboard data',
            message: error.message,
        });
    }
}
