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
          if (profitValue > 1000) {
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

module.exports = {
  findMostProfit,
};
