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
  let routeObject = {
    1: 'nev - illi Cognac',
  };
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

module.exports = {
  findMostProfit,
  findMostProfitRoutes,
};
