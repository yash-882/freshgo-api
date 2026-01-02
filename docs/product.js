/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Search products by text
 *     description: Performs full-text search on products using query filters.
 *                  You can optionally attach a cookie named coordinates in the format [long, lat]. The client should send valid coordinates located within India; otherwise, the response may return empty results or a message such as “Not available in your area.” If the cookie is not provided, the API will automatically assign a demo warehouse with full stock.
 *     tags: [Products]
 *     parameters:
 *       # -------- SEARCH VALUE --------
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword (required)
 *
 *       # -------- TEXT FILTER --------
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by product name
 *
 *       # -------- CATEGORY FILTERS --------
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum:
 *             - fruits
 *             - vegetables
 *             - personal_care
 *             - household_essentials
 *             - dairy_and_breads
 *             - beverages
 *             - snacks
 *             - health_and_wellness
 *
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: string
 *           enum:
 *             - apple
 *             - banana
 *             - orange
 *             - grape
 *             - strawberry
 *             - mango
 *             - pineapple
 *             - potato
 *             - onion
 *             - tomato
 *             - carrot
 *             - broccoli
 *             - spinach
 *             - cauliflower
 *             - cucumber
 *             - soap
 *             - toothpaste
 *             - toothbrush
 *             - shampoo
 *             - lotion
 *             - conditioner
 *             - body_wash
 *             - sunscreen
 *             - detergent
 *             - tissue
 *             - air_freshener
 *             - glass_cleaner
 *             - bathroom_cleaner
 *             - surface_cleaner
 *             - milk
 *             - butter
 *             - cheese
 *             - paneer
 *             - cream
 *             - desi_ghee
 *             - white_bread
 *             - brown_bread
 *             - multigrain_bread
 *             - juice
 *             - soda
 *             - tea
 *             - coffee
 *             - water
 *             - soft_drink
 *             - energy_drink
 *             - milkshake
 *             - chips
 *             - noodles
 *             - cookies
 *             - popcorn
 *             - biscuits
 *             - nuts
 *             - chocolates
 *             - namkeen
 *             - sanitizer_and_disinfectant
 *             - vitamin_and_supplement
 *             - protein_powder
 *
 *       # -------- NUMERIC RANGE FILTERS --------
 *       - in: query
 *         name: price[gt]
 *         schema:
 *           type: number
 *         description: Price greater than
 *
 *       - in: query
 *         name: price[gte]
 *         schema:
 *           type: number
 *         description: Price greater than or equal to
 *
 *       - in: query
 *         name: price[lt]
 *         schema:
 *           type: number
 *         description: Price less than
 *
 *       - in: query
 *         name: price[lte]
 *         schema:
 *           type: number
 *         description: Price less than or equal to
 *
 *       - in: query
 *         name: quantity[gt]
 *         schema:
 *           type: number
 *         description: Quantity greater than
 *
 *       # -------- SORT / PAGINATION --------
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: |
 *           Sort fields (comma-separated).
 *
 *           Prefix with `-` for descending order.
 *
 *           Example:
 *           `sort=price,-createdAt`
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
 *           Fields to include or exclude (comma-separated).
 *
 *           - Include fields: `select=name,price,category`
 *           - Exclude fields: `select=-description,-images`
 *
 *           Mixing include and exclude is not allowed.
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
 *     description: Fetch products using query string filters.
 *                  You can optionally attach a cookie named coordinates in the format [long, lat]. The client should send valid coordinates located within India; otherwise, the response may return empty results or a message such as “Not available in your area.” If the cookie is not provided, the API will automatically assign a demo warehouse with full stock.
 *     tags: [Products]
 *     parameters:
 *       # -------- TEXT FILTERS --------
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *
 *       # -------- CATEGORY FILTERS --------
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum:
 *             - fruits
 *             - vegetables
 *             - personal_care
 *             - household_essentials
 *             - dairy_and_breads
 *             - beverages
 *             - snacks
 *             - health_and_wellness
 *
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: string
 *           enum:
 *             - apple
 *             - banana
 *             - orange
 *             - grape
 *             - strawberry
 *             - mango
 *             - pineapple
 *             - potato
 *             - onion
 *             - tomato
 *             - carrot
 *             - broccoli
 *             - spinach
 *             - cauliflower
 *             - cucumber
 *             - soap
 *             - toothpaste
 *             - toothbrush
 *             - shampoo
 *             - lotion
 *             - conditioner
 *             - body_wash
 *             - sunscreen
 *             - detergent
 *             - tissue
 *             - air_freshener
 *             - glass_cleaner
 *             - bathroom_cleaner
 *             - surface_cleaner
 *             - milk
 *             - butter
 *             - cheese
 *             - paneer
 *             - cream
 *             - desi_ghee
 *             - white_bread
 *             - brown_bread
 *             - multigrain_bread
 *             - juice
 *             - soda
 *             - tea
 *             - coffee
 *             - water
 *             - soft_drink
 *             - energy_drink
 *             - milkshake
 *             - chips
 *             - noodles
 *             - cookies
 *             - popcorn
 *             - biscuits
 *             - nuts
 *             - chocolates
 *             - namkeen
 *             - sanitizer_and_disinfectant
 *             - vitamin_and_supplement
 *             - protein_powder
 *
 *       # -------- NUMERIC RANGE FILTERS --------
 *       - in: query
 *         name: price[gt]
 *         schema:
 *           type: number
 *         description: Price greater than
 *
 *       - in: query
 *         name: price[gte]
 *         schema:
 *           type: number
 *         description: Price greater than or equal to
 *
 *       - in: query
 *         name: price[lt]
 *         schema:
 *           type: number
 *         description: Price less than
 *
 *       - in: query
 *         name: price[lte]
 *         schema:
 *           type: number
 *         description: Price less than or equal to
 *
 *       - in: query
 *         name: quantity[gt]
 *         schema:
 *           type: number
 *         description: Quantity greater than
 *
 *       # -------- SORT / PAGINATION --------
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: |
 *           Sort fields (comma-separated).
 *
 *           Prefix with `-` for descending order.
 *
 *           Example:
 *           `sort=price,-createdAt`
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of records to return
 *
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *         description: Number of records to skip
 *
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: |
 *           Fields to include or exclude (comma-separated).
 *
 *           - Include fields normally: `select=name,price`
 *           - Exclude fields by prefixing with `-`: `select=-description,-images`
 *
 *           Mixing include and exclude is not allowed.
 *
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: >
 *       You can optionally attach a cookie named `coordinates` in the format
 *       `[long, lat]`. The client should send valid coordinates within India;
 *       otherwise, the response may return empty results or a message such as
 *       "Not available in your area". If the cookie is not provided, the API
 *       will automatically assign a demo warehouse that always has full stock. <br> <br>
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
*     description: >
 *       You can optionally attach a cookie named `coordinates` in the format
 *       `[long, lat]`. The client should send valid coordinates within India;
 *       otherwise, the response may return empty results or a message such as
 *       "Not available in your area". If the cookie is not provided, the API
 *       will automatically assign a demo warehouse that always has full stock. <br> <br>

 *       Returns up to 20 recommended products based on the user's
 *       recently delivered orders (last 45 days).
 *       Recommendations are derived from previously purchased categories.
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: |
 *           Sort fields (comma-separated).
 *
 *           Prefix a field with `-` for descending order.
 *
 *           Example:
 *           `sort=price,-createdAt`
 *
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: |
 *           Fields to include or exclude (comma-separated).
 *
 *           - Include fields: `select=name,price,category`
 *           - Exclude fields: `select=-description,-images`
 *
 *           Mixing inclusion and exclusion is not allowed.
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
 *     description: >
 *       You can optionally attach a cookie named `coordinates` in the format
 *       `[long, lat]`. The client should send valid coordinates within India;
 *       otherwise, the response may return empty results or a message such as
 *       "Not available in your area". If the cookie is not provided, the API
 *       will automatically assign a demo warehouse that always has full stock. <br> <br>
 *       Accepts either:
 *        - an image file upload, or
 *        - an image URL <br> <br>
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
