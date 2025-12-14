const { isPlainObject, sortObjectKeys } = require("./object.js");
const RedisService = require("../classes/redisService.js");
const { createHash } = require("crypto");

// build a unique cache identifier for queries (e.g: sort=price&price[gt]=50)
// takes query as an object 
const generateQueryHash = (query = {}) => { 
  
  // directly hash and return (buffer can represent an image or any file)
  if (Buffer.isBuffer(query)) {
    return createHash('sha256')
    .update(query)
    .digest('hex')
    .slice(0, 32)
  }

  // At this point it should be a query object
  const filter = { 
    ...query.filter || {}
  }
  
  const { sort, limit, skip, select } = query;

  // merge properties
  Object.assign(filter, { sort, limit, skip, select });

  // sort keys to prevent cache misses due to different key ordering
  // (skip sorting keys for search resource requests)
  const sortedFilter = query.value ? query : sortObjectKeys(filter);

   // generate hash for query string (reason: query strings can be too lengthy as a Redis key)
  return createHash("sha256")
  .update(JSON.stringify(sortedFilter))
  .digest("hex")
  .slice(0, 32);
};

// reusable helper for cacheID
const resolveCacheID = (cacheKeySource) => {

  let hash;
  if(cacheKeySource){
    if (isPlainObject(cacheKeySource) && Object.keys(cacheKeySource).length > 0)
      hash = generateQueryHash(cacheKeySource);

    else
      hash = cacheKeySource;
}

  return String(hash || "unknown");
}

// CACHE CRUD:

// store data in Redis with TTL (default 5 mins)
const storeCachedData = async (
  key,
  { data, ttl = 300 },
  resourceType,
  isUpdate = false
) => {
  const CacheStore = new RedisService(`${resourceType}:${key}`, "DATA_CACHE");
  await CacheStore.setShortLivedData(data, ttl, isUpdate);
};

// get cached data
const getCachedData = async (key, resourceType) => {
  const CacheStore = new RedisService(`${resourceType}:${key}`, "DATA_CACHE");
  return await CacheStore.getData();
};

// delete cached data
const deleteCachedData = async (key, resourceType) => {
  const CacheStore = new RedisService(`${resourceType}:${key}`, "DATA_CACHE");
  await CacheStore.deleteData(CacheStore.getKey());
};

module.exports = { generateQueryHash, resolveCacheID, storeCachedData, getCachedData, deleteCachedData };