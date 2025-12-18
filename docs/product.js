/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Search products by text
 *     description: |
 *       Performs full-text search on products.
 *
 *       **Query string examples:**
 *
 *       - `/products/search?value=apple`
 *       - `/products/search?value=juice&price[gte]=50&price[lte]=200`
 *       - `/products/search?value=milk&category=dairy_and_breads`
 *       - `/products/search?value=chips&sort=price,-createdAt&limit=10`
 *
 *       Supported filter fields:
 *       - name
 *       - price
 *       - quantity
 *       - category
 *       - subcategory
 *
 *       Supported operators for numeric fields:
 *       - gt, gte, lt, lte
 *
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: |
 *           Sorting rule.
 *           Example: `price,-createdAt`
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of results to return
 *
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *         description: Number of results to skip
 *
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: |
 *           Fields to include or exclude.
 *           Example: `name,price,category`
 *
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       400:
 *         description: Search value is required
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get products list
 *     description: |
 *       Fetch products using query string filters.
 *
 *       **Query syntax examples:**
 *
 *       - Exact match:
 *         `/products?category=fruits&subcategory=apple`
 * 
 *       - Multiple match:
 *        `/products?category=fruits&category=vegetables`
 *
 *       - Range filters:
 *         `/products?price[gte]=100&price[lte]=500`
 *
 *       - Quantity filter:
 *         `/products?quantity[gt]=0`
 *
 *       - Text filter:
 *         `/products?name=milk`
 *
 *       - Sorting:
 *         `/products?sort=price,-createdAt`
 *
 *       - Pagination:
 *         `/products?limit=20&skip=40`
 *
 *       - Field selection:
 *         `/products?select=name,price,category`
 *
 *       Supported fields:
 *       - name
 *       - price
 *       - quantity
 *       - category
 *       - subcategory
 *
 *       Supported operators for numeric fields:
 *       - lt (less than)
 *       - gt (greater than), 
 *       - lte (less than or equal to)
 *       - gte (greater than or equal to)
 *
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */



/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/recommendations:
 *   get:
 *     summary: Get product recommendations based on order history
 *     description: |
 *       Returns up to 20 products based on user's recent delivered orders
 *       (last 45 days).
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recommendations fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /products/image-search:
 *   post:
 *     summary: Search similar products using an image
 *     description: |
 *       Accepts either:
 *       - an image file upload, OR
 *       - an image URL
 *       
 *       AI is used to identify the product subcategory.
 *       NSFW or unsupported images will be rejected.
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               imageURL:
 *                 type: string
 *                 example: https://example.com/product.jpg
 *     responses:
 *       200:
 *         description: Similar products fetched successfully
 *       400:
 *         description: Invalid image or image URL
 */
