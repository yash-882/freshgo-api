/**
 * @swagger
 * /admin/products:
 *   patch:
 *     summary: Update multiple products (Admin)
 *     description: |
 *       Bulk update products using query string filters.
 *
 *       At least one filter is required.
 *       `limit` can be used to restrict how many matched products are updated.
 *       Only fields provided in the request body will be updated.
 *     tags: [Admin - Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *         description: Filter products by category
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
 *         description: Filter products by subcategory
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
 *       # -------- LIMIT --------
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: |
 *           Maximum number of matched products to update.
 *           Useful for controlled bulk updates.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             description: |
 *               Fields to update.
 *               Only provided fields will be updated.
 *     responses:
 *       200:
 *         description: Products updated successfully
 *       400:
 *         description: Empty body or invalid input
 *       404:
 *         description: No products found
 */

/**
 * @swagger
 * /admin/products:
 *   delete:
 *     summary: Delete multiple products (Admin)
 *     description: |
 *       Deletes multiple products using query-based filters.
 *
 *       ⚠️ At least one filter is required
 *       (category, subcategory, or price range).
 *     tags: [Admin - Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       # -------- CATEGORY FILTER --------
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
 *         description: Filter products by category
 *
 *       # -------- SUBCATEGORY FILTER --------
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
 *         description: Filter products by subcategory
 *
 *       # -------- PRICE RANGE FILTERS --------
 *       - in: query
 *         name: price[gt]
 *         schema:
 *           type: number
 *         description: Delete products with price greater than
 *
 *       - in: query
 *         name: price[gte]
 *         schema:
 *           type: number
 *         description: Delete products with price greater than or equal to
 *
 *       - in: query
 *         name: price[lt]
 *         schema:
 *           type: number
 *         description: Delete products with price less than
 *
 *       - in: query
 *         name: price[lte]
 *         schema:
 *           type: number
 *         description: Delete products with price less than or equal to
 *
 *     responses:
 *       200:
 *         description: Products deleted successfully
 *       400:
 *         description: At least one filter is required
 *       404:
 *         description: No products found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */


/**
 * @swagger
 * /admin/products/{id}:
 *   patch:
 *     summary: Update product by ID (Admin)
 *     tags: [Admin - Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Empty body
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     summary: Delete product by ID (Admin)
 *     tags: [Admin - Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Create product(s) without images (Admin)
 *     description: |
 *       Creates one or multiple products using JSON input.
 *
 *       If `withTagsAndDescription=true` is provided,
 *       the system automatically generates:
 *       - tags
 *       - description
 *       - subcategory
 *
 *       Otherwise, only `subcategory` is generated.
 *     tags: [Admin - Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: withTagsAndDescription
 *         schema:
 *           type: boolean
 *         description: Enable AI generation of tags and description
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *               - type: array
 *     responses:
 *       201:
 *         description: Product(s) created successfully
 *       400:
 *         description: Invalid product data or missing product name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */