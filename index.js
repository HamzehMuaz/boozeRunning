const bruteForce = require('./algorthims/bruteForce');

/*
** The below method is used to calculate the most efficient
** routes to generate revenue while making the least loss of gold
** Change the numbers to change the input, thus changing the result
*/


const goldPrice = 68000; // price for each piece of gold
const travelCost = 10; // gold needed to reset travel
const cap = 450; // carrying capacity (450 for Ldon & 360 for Rdon)
const result = bruteForce.findMostProfitRoutesWithRevenue(goldPrice, travelCost, cap);

console.log(result);


// const goldToSpend = 300;
// const goldPrice = 65000; // price for each piece of gold
// const travelCost = 10; // gold needed to reset travel
// const cap = 450; // carrying capacity (450 for Ldon & 360 for Rdon)
// const result = bruteForce.calcRevenueGeneratedFromGold(goldPrice, travelCost, cap, goldToSpend);

// console.log(result);