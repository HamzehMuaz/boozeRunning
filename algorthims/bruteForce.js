const fs = require('fs');
const currencyUtil = require('../util/currency');

const {
  illi, mich, ohio, no, ny, nj,
} = require('../states');


const findMostProfitNew = () => {
  const {
    illi, mich, ohio, no, ny, nj,
  } = require('../states');
  const stateArray = [illi, mich, ohio, no, ny, nj];
  let profitArray = [];
  for (let statesIndex = 0; statesIndex < stateArray.length; statesIndex += 1) {
    const fromStateBoozeObject = stateArray[statesIndex];
    for (let secondStatesIndex = 0; secondStatesIndex < stateArray.length; secondStatesIndex += 1) {
      const toStateBoozeObject = stateArray[secondStatesIndex];
      if (secondStatesIndex == 0) console.log({toStateBoozeObject})
      for (let boozeIndex = 0; boozeIndex < Object.keys(fromStateBoozeObject).length; boozeIndex += 1) {
        const fromStateKey = Object.keys(fromStateBoozeObject)[boozeIndex];
      if (secondStatesIndex == 0) console.log({fromStateKey})
        if (fromStateKey != 'name'
        && fromStateBoozeObject.name !== toStateBoozeObject.name) {
          const fromStateValue = fromStateBoozeObject[fromStateKey];
          const profitValue = toStateBoozeObject[fromStateKey] - fromStateValue;
          if (profitValue > 150) {
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
    './results/profitNew.json',
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
  const profitArray = require('../results/profitNew.json');
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

const findMostProfitRoutesWithRevenue = (gP, travelCost, cap, write) => {
  let writeFile = write || true;
  const statesObject = { illi, mich, ohio, no, ny, nj };
  // assuming traveling from state to state costs X gold coins
  // and you can buy gold to travel with money
  const goldPrice = gP || 60000;
  const travelCostWithGold = travelCost  || 10;
  const carryingCapacity = cap || 450;

  // eslint-disable-next-line global-require
  const profitArray = require('../results/profitNew.json');
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
  console.log('||No Tax||: ',{profitRoute});

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

/*
 When selling booze:
 State control takes 10% of the cash gained after selling the booze. If you're selling in same state as your crew owns, you will keep that 10% but 9% still goes to crew bank.
 In your controled state: you will lose 9% of cash to crew bank, but keep 91%.
 In other states: you will lose 19% of the cash, 9% of which goes to the crew bank.

 State control also takes 10% of the revenue, so if you sell in a state that your crew does not control, you will only make 90% of the revenue.
 However, if your crew controls that state, then you will make 100% of it, even if the crew takes a 9% tax
 
*/

const findMostProfitWithoutNegotiationsWithTax = (control = [], carryingCapacity) => {
  const {
    illi, mich, ohio, no, ny, nj,
  // eslint-disable-next-line global-require
  } = require('../states');
  const stateArray = [illi, mich, ohio, no, ny, nj];
  let profitArray = [];
  for (let statesIndex = 0; statesIndex < stateArray.length; statesIndex += 1) {
    const fromStateBoozeObject = stateArray[statesIndex];
    for (let secondStatesIndex = 0; secondStatesIndex < stateArray.length; secondStatesIndex += 1) {
      let crewCut = 0;
      const toStateBoozeObject = stateArray[secondStatesIndex];
      for (let boozeIndex = 0; boozeIndex < Object.keys(fromStateBoozeObject).length; boozeIndex += 1) {
        const fromStateKey = Object.keys(fromStateBoozeObject)[boozeIndex];
        if (typeof fromStateBoozeObject[fromStateKey] === 'number'
        && fromStateBoozeObject.name !== toStateBoozeObject.name) {
        let taxValueProfit = 0.81, taxValueRev = 0.9, crewTax = 0.09;
          if (control.includes(toStateBoozeObject.name)) {
            if (control[0] === toStateBoozeObject.name) {
              taxValueRev = 1;
            }
            taxValueProfit = 0.91;
          }
          const fromStateValue = fromStateBoozeObject[fromStateKey];
          const profitValue = toStateBoozeObject[fromStateKey] - fromStateValue;
          const profitValueWithTax = (toStateBoozeObject[fromStateKey] * taxValueProfit) - fromStateValue;
          crewCut = toStateBoozeObject[fromStateKey]*crewTax;
          // console.log({to: toStateBoozeObject[fromStateKey], fromStateKey,
          // from: fromStateValue, fromname: fromStateBoozeObject.name, toname: toStateBoozeObject.name})
          // if (fromStateBoozeObject.name === 'nj' && toStateBoozeObject.name === 'illi' && fromStateKey == 'Cognac') {
          //   console.log({ toStateBoozeObject, taxValueRev })
          // }
          const revValueWithTax = toStateBoozeObject[fromStateKey] * taxValueRev;
          if (profitValueWithTax > 400) {
            const profitObject = {
              value: profitValue,
              valueWithTax: Number(profitValueWithTax.toFixed(2)),
              revValueWithTax: Number(revValueWithTax.toFixed(2)),
              totalRevWithTax: Number((revValueWithTax * carryingCapacity).toFixed(2)),
              crewCutPerCrate: crewCut,
              crewCutTotal: Number((crewCut * carryingCapacity).toFixed(2)),
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
  profitArray = profitArray.sort((a, b) => b.valueWithTax - a.valueWithTax);
  return { profitArray };
};


const findMostProfitWithNegotiationsWithTax = (control = [], carryingCapacity) => {
const {
  illi, mich, ohio, no, ny, nj,
} = require('../statesWithNegotiations');
  const stateArray = [illi, mich, ohio, no, ny, nj];
  let profitArray = [];
  for (let statesIndex = 0; statesIndex < stateArray.length; statesIndex += 1) {
    const fromStateBoozeObject = stateArray[statesIndex];
    // console.log({fromStateBoozeObject}) /////////////
    for (let secondStatesIndex = 0; secondStatesIndex < stateArray.length; secondStatesIndex += 1) {
      let crewCut = 0;
      const toStateBoozeObject = stateArray[secondStatesIndex];
    // console.log({toStateBoozeObject}) /////////////////////
      for (let boozeIndex = 0; boozeIndex < Object.keys(fromStateBoozeObject).length; boozeIndex += 1) {
        const fromStateKey = Object.keys(fromStateBoozeObject)[boozeIndex];
    // console.log({fromBooze: fromStateBoozeObject[fromStateKey] })//////////////
        if (typeof fromStateBoozeObject[fromStateKey] === 'object'
        && fromStateBoozeObject.name !== toStateBoozeObject.name) {
        let taxValueProfit = 0.81, taxValueRev = 0.9, crewTax = 0.09;
          if (control.includes(toStateBoozeObject.name)) {
            if (control[0] === toStateBoozeObject.name) {
              taxValueRev = 1;
            }
            taxValueProfit = 0.91;
          }
          const fromStateValue = fromStateBoozeObject[fromStateKey].low;
          const profitValue = toStateBoozeObject[fromStateKey].high - fromStateValue;
          const profitValueWithTax = (toStateBoozeObject[fromStateKey].high * taxValueProfit) - fromStateValue;
          crewCut = toStateBoozeObject[fromStateKey].high * crewTax;
          // console.log({to: toStateBoozeObject[fromStateKey], fromStateKey,
          // from: fromStateValue, fromname: fromStateBoozeObject.name, toname: toStateBoozeObject.name})
          // if (fromStateBoozeObject.name === 'nj' && toStateBoozeObject.name === 'illi' && fromStateKey == 'Cognac') {
          //   console.log({ toStateBoozeObject, taxValueRev })
          // }
          const revValueWithTax = toStateBoozeObject[fromStateKey].high * taxValueRev;
          if (profitValueWithTax > 400) {
            const profitObject = {
              value: profitValue,
              valueWithTax: Number(profitValueWithTax.toFixed(2)),
              revValueWithTax: Number(revValueWithTax.toFixed(2)),
              totalRevWithTax: Number((revValueWithTax * carryingCapacity).toFixed(2)),
              crewCutPerCrate: crewCut,
              crewCutTotal: Number((crewCut * carryingCapacity).toFixed(2)),
              from: fromStateBoozeObject.name,
              to: toStateBoozeObject.name,
              booze: fromStateKey,
            };
    // console.log({profitObject: profitObject })//////////////
            profitArray.push(profitObject);
          }
        }
      }
    }
  }
  profitArray = profitArray.sort((a, b) => b.valueWithTax - a.valueWithTax);
  return { profitArray };
};

const findMostProfitRoutesWithRevenueWithTax = (gP, travelCost, cap, write, control = []) => {
  let writeFile = write || true;
  const statesObject = { illi, mich, ohio, no, ny, nj };
  // assuming traveling from state to state costs X gold coins
  // and you can buy gold to travel with money
  const goldPrice = gP || 60000;
  const travelCostWithGold = travelCost  || 10;
  const carryingCapacity = cap || 450;
  // eslint-disable-next-line global-require
  // const profitArray = require('../results/profitWithTax.json');
  const { profitArray } = findMostProfitWithoutNegotiationsWithTax(control, cap);
  let profitRoutes = [];
  for (let index = 0; index < profitArray.length; index += 1) {
    const profitObject = { ...profitArray[index] }; // assign by value, not reference
    // console.log(index);
    let { to } = profitObject;
    profitObject.valueWithTax *= carryingCapacity;
    const singleRoute = [profitObject];
    let foundNext = null;
    const visited = [profitObject.from];
    const duplicateProfitArray = [...profitArray];
    // let cost = goldPrice * travelCostWithGold ;
    let cost = goldPrice * (travelCostWithGold + (index * 5));
    let totalRevenue = profitObject.revValueWithTax * carryingCapacity;
    let crewCut = profitObject.crewCutPerCrate * carryingCapacity;
    // console.log({ to, totalRevenue, revValWTax: profitObject.revValueWithTax })
    // let totalRevenue = statesObject[profitObject.to][profitObject.booze] * carryingCapacity;
    do {
      // foundNext = duplicateProfitArray.find((profitObjectElement) => profitObjectElement.from === to);
      for (let searchIndex = 0; searchIndex < duplicateProfitArray.length; searchIndex += 1) {
        const profitObjectElement = duplicateProfitArray[searchIndex];
        if (profitObjectElement.from === to && !visited.includes(profitObjectElement.from)) {
          foundNext = { ...profitObjectElement }; // assign by value, not reference
          foundNext.valueWithTax *= carryingCapacity;
          duplicateProfitArray.splice(searchIndex, 1);
          // cost += goldPrice * travelCostWithGold;
          cost = goldPrice * (travelCostWithGold + (searchIndex * 5));
          // totalRevenue2 += statesObject[foundNext.to][foundNext.booze] * carryingCapacity;
          totalRevenue += foundNext.revValueWithTax * carryingCapacity;
          // if (foundNext.valueWithTax == 316440 && profitObject.from =='nev') {
          //   console.log({
          //     profitObject,
          //     foundNext,
          //     to: foundNext.to,
          //     to2: profitObject.to,
          //     booze: foundNext.booze,
          //     booze2: profitObject.booze,
          //     totalRevenue: foundNext.revValueWithTax * carryingCapacity,
          //     totalRevenue2: statesObject[foundNext.to][foundNext.booze] * carryingCapacity,
          //     totalRevenueOG: profitObject.revValueWithTax * carryingCapacity,
          //     totalRevenueOG2: statesObject[profitObject.to][profitObject.booze] * carryingCapacity,
          //     })
          // }
          crewCut += foundNext.crewCutPerCrate * carryingCapacity
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
          const totalProfit = singleRoute.reduce((acc, currentValue) => acc + currentValue.valueWithTax, 0);
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
            crewCut,
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
      './results/profitRoutesWithRevWithTax.json',
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


const findMostProfitRoutesWithRevenueWithTaxWithNegotiations = (gP, travelCost, cap, write, control = []) => {
  let writeFile = write || true;
  const statesObject = { illi, mich, ohio, no, ny, nj };
  // assuming traveling from state to state costs X gold coins
  // and you can buy gold to travel with money
  const goldPrice = gP || 60000;
  const travelCostWithGold = travelCost  || 10;
  const carryingCapacity = cap || 450;
  // eslint-disable-next-line global-require
  // const profitArray = require('../results/profitWithTax.json');
  const { profitArray } = findMostProfitWithNegotiationsWithTax(control, cap);
  let profitRoutes = [];
  for (let index = 0; index < profitArray.length; index += 1) {
    const profitObject = { ...profitArray[index] }; // assign by value, not reference
    // console.log(index);
    let { to } = profitObject;
    profitObject.valueWithTax *= carryingCapacity;
    const singleRoute = [profitObject];
    let foundNext = null;
    const visited = [profitObject.from];
    const duplicateProfitArray = [...profitArray];
    // let cost = goldPrice * travelCostWithGold;
    let cost = goldPrice * (travelCostWithGold + (index * 5));
    let totalRevenue = profitObject.revValueWithTax * carryingCapacity;
    let crewCut = profitObject.crewCutPerCrate * carryingCapacity;
    // console.log({ to, totalRevenue, revValWTax: profitObject.revValueWithTax })
    // let totalRevenue = statesObject[profitObject.to][profitObject.booze] * carryingCapacity;
    do {
      // foundNext = duplicateProfitArray.find((profitObjectElement) => profitObjectElement.from === to);
      for (let searchIndex = 0; searchIndex < duplicateProfitArray.length; searchIndex += 1) {
        const profitObjectElement = duplicateProfitArray[searchIndex];
        if (profitObjectElement.from === to && !visited.includes(profitObjectElement.from)) {
          foundNext = { ...profitObjectElement }; // assign by value, not reference
          foundNext.valueWithTax *= carryingCapacity;
          duplicateProfitArray.splice(searchIndex, 1);
          // cost += goldPrice * travelCostWithGold;
          cost = goldPrice * (travelCostWithGold + (searchIndex * 5));
          // totalRevenue2 += statesObject[foundNext.to][foundNext.booze] * carryingCapacity;
          totalRevenue += foundNext.revValueWithTax * carryingCapacity;
          // if (foundNext.valueWithTax == 316440 && profitObject.from =='nev') {
          //   console.log({
          //     profitObject,
          //     foundNext,
          //     to: foundNext.to,
          //     to2: profitObject.to,
          //     booze: foundNext.booze,
          //     booze2: profitObject.booze,
          //     totalRevenue: foundNext.revValueWithTax * carryingCapacity,
          //     totalRevenue2: statesObject[foundNext.to][foundNext.booze] * carryingCapacity,
          //     totalRevenueOG: profitObject.revValueWithTax * carryingCapacity,
          //     totalRevenueOG2: statesObject[profitObject.to][profitObject.booze] * carryingCapacity,
          //     })
          // }
          crewCut += foundNext.crewCutPerCrate * carryingCapacity
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
          const totalProfit = singleRoute.reduce((acc, currentValue) => acc + currentValue.valueWithTax, 0);
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
            crewCut,
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
      './results/profitRoutesWithRevWithTaxWithNegotiations.json',
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
const calcRevenueGeneratedFromGoldWithTax = (gP, travelCost, cap, goldToSpend, control = []) => {
  const goldPrice = gP || 60000;
  const travelCostWithGold = travelCost  || 10;
  const carryingCapacity = cap || 450;

  const profitRoute = findMostProfitRoutesWithRevenueWithTax(goldPrice, travelCostWithGold, carryingCapacity, false, control);
  console.log('||With Tax||: ', {profitRoute})
  const routesNeeded = Math.floor(goldToSpend/profitRoute.goldLost);
  let statesAmount = 0;
  let route = '';
  let crewCut = 0;
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
  Crew bank(s) will take: ${currencyUtil.getPrice6Chars(profitRoute.crewCut*routesNeeded)} in cash
  You will travel ${statesAmount*routesNeeded} times
  You will have ${Math.ceil(goldToSpend-(profitRoute.goldLost*routesNeeded))} gold left!`;

  return text;
};
module.exports = {
  findMostProfitRoutesWithRevenue,
  calcRevenueGeneratedFromGold,
  calcRevenueGeneratedFromGoldWithTax,
  findMostProfitRoutesWithRevenueWithTaxWithNegotiations,
  findMostProfitNew,
  findMostProfitRoutes
};
