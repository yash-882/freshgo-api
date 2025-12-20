//admin only operations

const CustomError = require('../../error-handling/customError.js');
const ProductModel = require('../../models/product.js');
const sendApiResponse = require('../../utils/apiResponse.js');
const { deleteCachedData, storeCachedData } = require('../../utils/helpers/cache.js');
const cacheKeyBuilders = require('../../constants/cacheKeyBuilders.js');
const cloudinary = require('../../configs/cloudinary.js');
const { 
    checkProductMissingFields,
    getProductBodyForDB, 
    limitImageUploads, 
    limitProductCreation, 
    limitProductCreationAi, 
    streamUpload
} = require('../../utils/helpers/product.js');
const generateProductFieldsAi = require('../../utils/ai/generateProductFieldsAi.js');


// create products with images
const createProductsWithImages = async (req, res, next) => {
    // Multer keeps JSON stringified
    const productData = JSON.parse(req.body.productData || '{}');

    if (Object.keys(productData).length === 0) {
        return next(new CustomError('BadRequestError', 'Product data is required', 400));
    }

    if (!req.files || req.files.length === 0) {
        return next(new CustomError('BadRequestError', 'Product images are required', 400));
    }

    // limit checks, throws error if limits exceeded
    limitProductCreation(productData);
    limitImageUploads(productData, req.files);

    // UPLOAD IMAGES TO CLOUDINARY

    let uploadedImages = [];
    let session;
    try {

        const imagesUploadPromises = req.files.map(f =>
            streamUpload(f.buffer, f.originalname)
        );

        // wait for all images to be uploaded
        uploadedImages = await Promise.all(imagesUploadPromises);

        // get sanitized product body for DB (with images)
        const productBodyDB = getProductBodyForDB(productData, uploadedImages.map(img => ({
            secure_url: img.secure_url,
            originalname: img.display_name
        })));

        // AI AUTO-GENERATION LOGIC

        let finalProductData;

        // if auto-generation 
        if ([true, 'true'].includes(req.query.withTagsAndDescription)) {
            // Validate product names
                    // Validate product names
        const invalidNames = Array.isArray(productBodyDB) ?
            productBodyDB.some(p => !p.name) : !productBodyDB.name;

            // throw err
            if (invalidNames)
                return next(new CustomError(
                    'BadRequestError',
                    'Product name is required for auto generating Tags and Description.', 400));

            limitProductCreationAi(productBodyDB)

            finalProductData = await generateProductFieldsAi(
                productBodyDB, ['tags', 'description', 'subcategory']
            );

        }

        else {
            // throws err if required fields missing
            checkProductMissingFields(productBodyDB)

            // let the AI generate 'subcategory' automatically
            finalProductData = await generateProductFieldsAi(productBodyDB, ['subcategory']);
        }

        // SAVE PRODUCTS TO DB WITH TRANSACTION

        let createdProducts;
        session = await ProductModel.startSession();
        await session.withTransaction(async () => {
            createdProducts = await ProductModel.create(finalProductData, { ordered: true, session });
        });

        return sendApiResponse(res, 201, {
            message: 'Product created successfully',
            data: createdProducts
        });

    }
    catch (err) {
        if (uploadedImages && uploadedImages.length > 0) {

            // delete uploaded images from cloudinary on error
            cloudinary.api.delete_resources(uploadedImages.map(img => img.public_id))
                .catch(cleanupErr => console.error('Cloudinary cleanup failed:', cleanupErr));
        }

        return next(err);
    }

    finally {
        session ? await session.endSession() : null;
    }
}


// create products without images
const createProducts = async (req, res, next) => {
    const products = Array.isArray(req.body) ? req.body : [req.body];

    if (products.length === 0)
        return next(new CustomError('BadRequestError', 'Product data is required', 400));


    // throws error if products limit exceeds
    limitProductCreation(products)

    const productBodyDB = getProductBodyForDB(products);
    let finalProductData;

    // if auto-generation 
    if ([true, 'true'].includes(req.query.withTagsAndDescription)) {

        // Validate product names
        const invalidNames = Array.isArray(productBodyDB) ?
            productBodyDB.some(p => !p.name) : !productBodyDB.name;

        // throw err
        if (invalidNames)
            return next(new CustomError(
                'BadRequestError',
                'Product name is required for auto generating Tags and Description.', 400));

        limitProductCreationAi(productBodyDB)

        finalProductData = await generateProductFieldsAi(
            productBodyDB, ['tags', 'description', 'subcategory']
        );
    }

    else {
        // throws err if required fields missing
        checkProductMissingFields(productBodyDB)

        // let the AI generate 'subcategory' automatically
        finalProductData = await generateProductFieldsAi(productBodyDB, ['subcategory']);
    }


    let session
    try {

        session = await ProductModel.startSession();
        let createdProducts;
        await session.withTransaction(async () => {
            createdProducts = await ProductModel.create(finalProductData, { ordered: true, session });
        })

        sendApiResponse(res, 201, {
            message: 'Product created successfully',
            data: createdProducts
        })
    }
    catch (err) {
        return next(err);
    }
    finally {
        session ? await session.endSession() : null;
    }
}

// update multiple products
const adminUpdateProducts = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new CustomError('BadRequestError', 'Body is empty for updation!', 400));
    }

    const { filter } = req.sanitizedQuery; // which products to update
    const updates = req.body; // updates

    updates.byAdmin = true;

    // update all matching products
    const result = await ProductModel.updateMany(filter, { $set: updates }, {
        runValidators: true,
    });

    if (result.matchedCount === 0) {
        return next(new CustomError('NotFoundError', 'No products found for update', 404));
    }

    // invalidate cached data
    const uniqueID = cacheKeyBuilders.publicResources(req.sanitizedQuery);
    await deleteCachedData(uniqueID, 'product');

    sendApiResponse(res, 200, {
        message: `Updated ${result.modifiedCount} product(s) successfully`,
    });
}


// delete multiple products (accessible roles: Admin only)
const adminDeleteProducts = async (req, res, next) => {
    const { filter } = req.sanitizedQuery;

    // Delete all matching products
    const result = await ProductModel.deleteMany(filter);

    if (result.deletedCount === 0) {
        return next(new CustomError('NotFoundError', 'No products found for deletion', 404));
    }

    // Invalidate cached data if needed
    const uniqueID = cacheKeyBuilders.publicResources(req.sanitizedQuery);
    await deleteCachedData(uniqueID, 'product');

    sendApiResponse(res, 200, {
        message: `${result.deletedCount} product(s) deleted successfully`,
    });
}

// update product by ID
const adminUpdateProductByID = async (req, res, next) => {
    if (Object.keys(req.body || {}).length === 0) {
        return next(new CustomError('BadRequestError', 'Body is empty for updation!', 400));
    }

    const productID = req.params.id;
    const updates = req.body;

    updates.byAdmin = true;
    const product = await ProductModel.findByIdAndUpdate(productID, { $set: updates }, {
        new: true,
        runValidators: true,
    });

    if (!product) {
        return next(new CustomError('NotFoundError', 'Product not found', 404));
    }


    const uniqueID = cacheKeyBuilders.publicResources(productID);
    await storeCachedData(uniqueID, { data: product }, 'product', true);

    sendApiResponse(res, 200, {
        data: product, //updated product
        message: 'Product updated successfully',
    })
}

// delete product by ID 
const adminDeleteProductByID = async (req, res, next) => {
    const productID = req.params.id;

    const deletedProduct = await ProductModel.findByIdAndDelete(productID);

    if (!deletedProduct) {
        return next(new CustomError('NotFoundError', 'Product not found', 404));
    }

    const uniqueID = cacheKeyBuilders.publicResources(productID);
    await deleteCachedData(uniqueID, 'product');

    sendApiResponse(res, 200, {
        data: deletedProduct,
        message: 'Product deleted successfully',
    })

}

module.exports = { createProductsWithImages, createProducts, adminUpdateProducts, adminDeleteProducts, adminUpdateProductByID, adminDeleteProductByID }
