// sort object keys alphabetically
const sortObjectKeys = (filter) => {
  return Object.keys(filter || {})
    .sort()
    .reduce((sortedFilter, key) => {
      if (filter[key] !== undefined && filter[key] !== null) {
        sortedFilter[key] = filter[key];
      }
      return sortedFilter;
    }, {});
}

// checks if the given value is a plain object (not an array or null)
const isPlainObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return false;
  
  const proto = Object.getPrototypeOf(obj);
  return proto === null || proto === Object.prototype;
  
}
module.exports = { sortObjectKeys, isPlainObject };