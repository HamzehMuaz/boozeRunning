const bruteForce = require('./algorthims/bruteForce');

/*
** The below method is used to calculate the most efficient
** routes to generate revenue while making the least loss of gold
** Change the numbers to change the input, thus changing the result
*/

/*
 state control is the states controled by any crew or subcrew owned by the runner.
 First element stateControl[0] is the direct crew in which the runner is in, and any following elements are sub-crews.
 - first element will get 100% of revenue of sold booze and 91% of the profit/cash
 - next elements will get 90% of revenue and 91% of the profit/cash (assuming u cooperate)
 - any not included state will get 90% of revenue and 81% of cash.

 States = nev, illi, ny, nj, mich, cali
*/
const stateControl = ['mich', ''];
let result;
let result2;
const goldPrice = 350000; // price for each piece of gold
const travelCost = 10; // gold needed to reset travel
const cap = 1200; // carrying capacity (450 for Ldon & 360 for Rdon)
// result = bruteForce.findMostProfitRoutesWithRevenue(goldPrice, travelCost, cap);
// result = bruteForce.findMostProfitRoutesWithRevenueWithTaxWithNegotiations(goldPrice, travelCost, cap, true, stateControl);
result = bruteforce.findMostProfitRoutesWithRevenueWithTax(goldPrice, travelCost, cap, true, stateControl)
console.log(result);

// bruteForce.findMostProfitRoutes();

/*
const goldToSpend = 1000;
const goldPrice = 180000; // price for each piece of gold
const travelCost = 10; // gold needed to reset travel
const cap = 450; // carrying capacity (450 for Ldon & 360 for Rdon)
// result = bruteForce.calcRevenueGeneratedFromGold(goldPrice, travelCost, cap, goldToSpend, stateControl);
result2 = bruteForce.calcRevenueGeneratedFromGoldWithTax(goldPrice, travelCost, cap, goldToSpend, stateControl);



console.log(`No Tax:\n${result || ''}\n\nWith Tax:\n ${result2 || ''}`);
*/
/*
before buying illi: 383400
Cognac price: 1065
start cash: 0
start BR: 211359017
start crew cut: 72,792,410

Cognac price: 1900
Cognac sold total: 684,000
Whisky price: 854
Whisky price total: 307440
After illi cash: 554965
After buying Whisky cash: 247525
After illi BR: 211,974,617
After illi Crew cut: 72,854,079

Whisky price: 1938
Whisky sold total: 697,680
Gin price: 473
Gin price total: 170,280
After Nev cash: 875345
After buying Gin cash: 717368
After Nev BR: 212,672,297
After Nev Crew cut: 72,923,847

Gin price: 1568
Gin sold total: 564,480
Cognac price: 1236
Cognac price total:
After nj cash: 1174438
After buying Cognac cash:
After nj BR: 213,180,329
After nj Crew cut: 72,976,017

-----
total rev: 213180329 - 211359017 = 1,821,312 (Expected 1.9m)
Crew cut: 72,976,017 - 72,792,410 = 183,000 (expected 177k from both crews)
NJ > Illi: 
profit: 554,965 - 444960 = 110k + 68,400 = 178k (expected 215k)
Rev: 211,974,617 - 211,359,017 = 615k (expected 697680)
*/
