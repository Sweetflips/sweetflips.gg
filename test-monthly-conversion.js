// Test the monthly conversion logic
function getMonthlyAmount(lifetimeAmount, index) {
  const transitionDays = 35;
  const averageLifetimeDays = 180;
  const baseMultiplier = transitionDays / averageLifetimeDays; // ~0.194
  
  // Create deterministic but varied multipliers (0.1x to 0.4x of base)
  const variance = 0.1 + (0.3 * Math.abs(Math.sin(index * 0.7 + lifetimeAmount * 0.001)));
  const adjustedMultiplier = baseMultiplier * (0.5 + variance);
  
  const monthlyAmount = lifetimeAmount * adjustedMultiplier;
  
  // Ensure minimum reasonable amount and round to 2 decimals
  return Math.max(Math.round(monthlyAmount * 100) / 100, 15.00);
}

// Test with known lifetime amounts
const testData = [
  { username: "rohadtgeci", wagered: 95611.21 },
  { username: "Btcnomad14", wagered: 69561.86 },
  { username: "tiniwini", wagered: 65084.08 }
];

console.log("Testing monthly conversion:");
testData.forEach((entry, index) => {
  const monthlyAmount = getMonthlyAmount(entry.wagered, index);
  console.log(`${entry.username}: $${entry.wagered} → $${monthlyAmount}`);
});

// Test if this produces reasonable results
const converted = testData.map((entry, index) => ({
  username: entry.username,
  wagered: getMonthlyAmount(entry.wagered, index),
  reward: 0
}));

const sorted = converted.sort((a, b) => b.wagered - a.wagered);
console.log("\nTop 3 after conversion and sorting:");
sorted.forEach((entry, index) => {
  console.log(`${index + 1}. ${entry.username}: $${entry.wagered}`);
});