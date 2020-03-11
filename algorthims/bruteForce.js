const fs = require('fs');
const currencyUtil = require('../util/currency');

const {
  illi, mich, cali, nev, ny, nj,
} = require('../states');

const findMostProfitRoutesWithRevenue = (gP, travelCost, cap, write) => {
  let writeFile = write || true;
  const statesObject = { illi, mich, cali, nev, ny, nj };
  // assuming traveling from state to state costs X gold coins
  // and you can buy gold to travel with money
  const goldPrice = gP || 60000;
  const travelCostWithGold = travelCost  || 10;
  const carryingCapacity = cap || 450;

  // eslint-disable-next-line global-require
  const profitArray = require('../results/profit.json');
  let profitRoutes = [];
  for (let index = 0; index < profitArray.length; index += 1) {
    const profitObject = { ...profitArray[index] }; // assign by value, not reference
    // console.log(index);
    let { to } = profitObject;
    profitObject.value *= carryingCapacity;
    const singleRoute = [profitObject];
    let foundNext = null;
    const visited = [profitObject.from];
    const duplicateProfitArray = [...profitArray];
    let cost = goldPrice * travelCostWithGold;
    let totalRevenue = statesObject[profitObject.to][profitObject.booze] * carryingCapacity;
    do {
      // foundNext = duplicateProfitArray.find((profitObjectElement) => profitObjectElement.from === to);
      for (let searchIndex = 0; searchIndex < duplicateProfitArray.length; searchIndex += 1) {
        const profitObjectElement = duplicateProfitArray[searchIndex];
        if (profitObjectElement.from === to && !visited.includes(profitObjectElement.from)) {
          foundNext = { ...profitObjectElement }; // assign by value, not reference
          foundNext.value *= carryingCapacity;
          duplicateProfitArray.splice(searchIndex, 1);
          cost += goldPrice * travelCostWithGold;
          totalRevenue += statesObject[foundNext.to][foundNext.booze] * carryingCapacity;
          break;
        } else if (searchIndex === duplicateProfitArray.length - 1) {
          foundNext = null;
        }
      }
      if (foundNext) {
        visited.push(foundNext.from);
        singleRoute.push(foundNext);
        to = foundNext.to;
        if (profitObject.from === foundNext.to) {
          const totalProfit = singleRoute.reduce((acc, currentValue) => acc + currentValue.value, 0);
          const singleRouteKeysLength = Object.keys(singleRoute).length;
          const profitPerTravel = (totalProfit / singleRouteKeysLength);
          const cashLost = cost - totalProfit;
          const goldLost = cashLost / goldPrice;
          profitRoutes.push({
            ...singleRoute,
            carryingCapacity,
            profitPerTravel,
            revenuePerTravel: totalRevenue / singleRouteKeysLength,
            lossPerTravel: (cost - totalProfit) / singleRouteKeysLength,
            totalSpentOnGold: cost,
            totalProfit,
            totalRevenue,
            cashLost,
            goldLost,
            revenuePerOneGold: totalRevenue / goldLost,
          });
          break;
        }
      }
    } while (foundNext);
  }
  profitRoutes = profitRoutes.sort((a, b) => b.revenuePerOneGold - a.revenuePerOneGold);
  if (writeFile) {
    fs.writeFile(
      './results/profitRoutesWithRev.json',
      JSON.stringify(profitRoutes, null, 2),
      (err) => {
        if (err) {
          return console.log(err);
        }
        return 'done';
      },
    );
  }
  return profitRoutes[0];
};

const calcRevenueGeneratedFromGold = (gP, travelCost, cap, goldToSpend) => {
  const goldPrice = gP || 60000;
  const travelCostWithGold = travelCost  || 10;
  const carryingCapacity = cap || 450;

  const profitRoute = findMostProfitRoutesWithRevenue(goldPrice, travelCostWithGold, carryingCapacity, false);

  const routesNeeded = Math.floor(goldToSpend/profitRoute.goldLost);
  let statesAmount = 0;
  let route = '';
    for (let i = 0; i < Object.keys(profitRoute).length; i += 1) {
    const key = Object.keys(profitRoute)[i];
    if (profitRoute[key].from) {
      statesAmount += 1;
      route += `  From: ${profitRoute[key].from}, To: ${profitRoute[key].to}, Running: ${profitRoute[key].booze}\n  `
    }
  }
  let text = `With the following input:
  Gold to burn: ${goldToSpend}
  Gold price: ${goldPrice}
  Carrying capacity: ${carryingCapacity}

  - Here are the results -

  The route is:
  ${route}
  You should generate: ${currencyUtil.getPrice6Chars(profitRoute.totalRevenue*routesNeeded)} Revenue
  You will travel ${statesAmount*routesNeeded} times
  You will have ${Math.ceil(goldToSpend-(profitRoute.goldLost*routesNeeded))} gold left!`;

  return text;
};

module.exports = {
  findMostProfitRoutesWithRevenue,
  calcRevenueGeneratedFromGold,
};
