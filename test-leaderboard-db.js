const { PrismaClient } = require('@prisma/client');

async function checkLeaderboard() {
  const prisma = new PrismaClient();
  
  try {
    const leaderboardEntries = await prisma.leaderboard.findMany();
    console.log('Leaderboard entries:', leaderboardEntries.length);
    
    if (leaderboardEntries.length > 0) {
      console.log('Sample entries:');
      leaderboardEntries.slice(0, 3).forEach(entry => {
        console.log(`- ${entry.username}: $${entry.wagered} (rank ${entry.rank})`);
      });
    } else {
      console.log('No leaderboard entries found');
    }
    
    // Check luxdrop cache
    const cacheEntries = await prisma.luxdropCache.findMany();
    console.log('\nLuxdrop cache entries:', cacheEntries.length);
    
    if (cacheEntries.length > 0) {
      console.log('Cache periods:');
      cacheEntries.forEach(cache => {
        console.log(`- ${cache.period} (${cache.startDate} to ${cache.endDate})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLeaderboard();
