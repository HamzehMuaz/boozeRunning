const fs = require('fs');

const {
  illi, mich, cali, nev, ny, nj,
} = require('../states');

const findMostProfit = () => {
  const stateArray = [illi, mich, cali, nev, ny, nj];
  let profitArray = [];
  for (let statesIndex = 0; statesIndex < stateArray.length; statesIndex += 1) {
    const fromStateBoozeObject = stateArray[statesIndex];
    for (let secondStatesIndex = 0; secondStatesIndex < stateArray.length; secondStatesIndex += 1) {
      const toStateBoozeObject = stateArray[secondStatesIndex];
      for (let boozeIndex = 0; boozeIndex < Object.keys(fromStateBoozeObject).length; boozeIndex += 1) {
        const fromStateKey = Object.keys(fromStateBoozeObject)[boozeIndex];
        if (typeof fromStateBoozeObject[fromStateKey] === 'number'
        && fromStateBoozeObject.name !== toStateBoozeObject.name) {
          const fromStateValue = fromStateBoozeObject[fromStateKey];
          const profitValue = toStateBoozeObject[fromStateKey] - fromStateValue;
          if (profitValue > 400) {
            const profitObject = {
              value: profitValue,
              from: fromStateBoozeObject.name,
              to: toStateBoozeObject.name,
              booze: fromStateKey,
            };
            profitArray.push(profitObject);
          }
        }
      }
    }
  }
  profitArray = profitArray.sort((a, b) => b.value - a.value);
  fs.writeFile(
    './results/profit.json',
    JSON.stringify(profitArray, null, 2),
    (err) => {
      if (err) {
        return console.log(err);
      }
      return 'done';
    },
  );
};

const findMostProfitRoutes = () => {
  // eslint-disable-next-line global-require
  const profitArray = require('../results/profit.json');
  let profitRoutes = [];
  for (let index = 0; index < profitArray.length; index += 1) {
    const profitObject = profitArray[index];
    console.log(index);
    let { to } = profitObject;
    const singleRoute = [profitObject];
    let foundNext;
    const visited = [profitObject.from];
    const duplicateProfitArray = [...profitArray];
    do {
      // foundNext = duplicateProfitArray.find((profitObjectElement) => profitObjectElement.from === to);
      for (let searchIndex = 0; searchIndex < duplicateProfitArray.length; searchIndex += 1) {
        const profitObjectElement = duplicateProfitArray[searchIndex];
        if (profitObjectElement.from === to && !visited.includes(profitObjectElement.from)) {
          foundNext = profitObjectElement;
          duplicateProfitArray.splice(searchIndex, 1);
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
          profitRoutes.push({ ...singleRoute, profitPerTravel: totalProfit / Object.keys(singleRoute).length });
          break;
        }
      }
    } while (foundNext);
  }
  profitRoutes = profitRoutes.sort((a, b) => b.profitPerTravel - a.profitPerTravel);
  fs.writeFile(
    './results/profitRoutes.json',
    JSON.stringify(profitRoutes, null, 2),
    (err) => {
      if (err) {
        return console.log(err);
      }
      return 'done';
    },
  );
};

const findMostProfitRoutesWithRevenue = () => {
  const statesObject = { illi, mich, cali, nev, ny, nj };
  // assuming traveling from state to state costs X gold coins
  // and you can buy gold to travel with money
  const goldPrice = 60000;
  const travelCostWithGold = 10;
  const carryingCapacity = 450;

  // eslint-disable-next-line global-require
  const profitArray = require('../results/profit.json');
  let profitRoutes = [];
  for (let index = 0; index < profitArray.length; index += 1) {
    const profitObject = { ...profitArray[index] }; // assign by value, not reference
    console.log(index);
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
};

module.exports = {
  findMostProfit,
  findMostProfitRoutes,
  findMostProfitRoutesWithRevenue,
};
