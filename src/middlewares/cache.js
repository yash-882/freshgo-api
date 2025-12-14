const { getCachedData } = require("../utils/helpers/cache.js");
const sendApiResponse = require("../utils/apiResponse.js");
const cacheKeyBuilders = require("../constants/cacheKeyBuilders.js");

// middleware to get cached products (stored in Redis)
// resourceType can be a product/cart/user/order, etc
const checkCachedData = (resourceType,  isPvtResource=false) => {
  // query or document ID is used for a uniqueID as a part of Redis key
  return async (req, res, next) => {


    function getImageInput() {
      if (req.imageData)
        // buffer or image(URL)
        return req.imageData.image?.buffer || req.imageData.image
  }

    // get a source for generating hash-key by query/params or image input
    
    let hash;
    let cacheKeySource = req.sanitizedQuery || req.params.id || getImageInput()

    if(isPvtResource){

      hash = cacheKeyBuilders
     .pvtResources(req.user._id, cacheKeySource)
    } 
    else{
      hash = cacheKeyBuilders
      .publicResources(cacheKeySource)
    }

    if (!hash){
       return next(); // nothing to build cache from
    }

    const cachedData = await getCachedData(hash, resourceType)


    if (!cachedData) {

      req.redisCacheKey = hash; //cache key
      return next();

    }

    // send cached response
    sendApiResponse(res, 200, {data: cachedData });
    console.log('Sent via cache.');
}
}

module.exports = checkCachedData;