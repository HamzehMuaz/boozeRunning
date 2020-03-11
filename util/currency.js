
function getPrice6Chars(originalPrice) {
  let price = originalPrice;
  if (price === 0) {
    return '';
  }
  if (price < 10) {
    return ` ${parseInt(price, 10)}.${parseInt(
      price !== 0 ? (price % 1).toFixed(2).substr(2, 2) : 0,
      10,
    )}`;
  }
  if (price < 100) {
    return `${parseInt(price, 10)}.${parseInt(
      price !== 0 ? (price % 1).toFixed(2).substr(2, 2) : 0,
      10,
    )}`;
  }
  if (price < 1000) {
    return `${parseInt(price, 10)}.${parseInt(
      price !== 0 ? (price % 1).toFixed(2).substr(2, 1) : 0,
      10,
    )}`;
  }
  if (price < 10000) {
    const decimalNumber = parseInt(price.toString().substr(1, 1), 10);
    return ` ${parseInt(price / 1000, 10)}.${decimalNumber}K`;
  }
  if (price < 100000) {
    const decimalNumber = parseInt(price.toString().substr(2, 1), 10);
    return `${parseInt(price / 1000, 10)}.${decimalNumber}K`;
  }
  if (price < 1000000) {
    const decimalNumber = parseInt(price.toString().substr(3, 1), 10);
    if (decimalNumber >= 5) {
      price += 1000;
    }
    return `${parseInt(price / 1000, 10)}K`;
  }
  if (price < 10000000) {
    const decimalNumber = parseInt(price.toString().substr(1, 1), 10);
    return ` ${parseInt(price / 1000000, 10)}.${decimalNumber}M`;
  }
  if (price < 100000000) {
    const decimalNumber = parseInt(price.toString().substr(2, 1), 10);
    return `${parseInt(price / 1000000, 10)}.${decimalNumber}M`;
  }
  if (price < 1000000000) {
    const decimalNumber = parseInt(price.toString().substr(3, 1), 10);
    return `${parseInt(price / 1000000, 10)}.${decimalNumber}M`;
  }
  return price;
}

module.exports = {
  getPrice6Chars,
};