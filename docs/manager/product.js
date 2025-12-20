/**
 * @swagger
 * /manager/products:
 *   get:
 *     summary: Get products in my managed warehouse
 *     description: |
 *       Returns products available in the warehouse managed by the logged-in
 *       warehouse manager.
 *
 *       Query string follows the common query syntax (filters are spread).
 *
 *       Examples:
 *       - `/manager/products?category=fruits`
 *       - `/manager/products?quantity[gt]=0&sort=quantity`
 *       - `/manager/products?limit=20&skip=0`
 *     tags: [Warehouse Manager - Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sorting rule (e.g. quantity,-updatedAt)
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Fields to include or exclude
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a warehouse manager)
 */

/**
 * @swagger
 * /manager/products:
 *   patch:
 *     summary: Add or update products in my warehouse
 *     description: |
 *       Adds products to the managed warehouse or updates quantity
 *       if the product already exists.
 *
 *       Duplicate product IDs are automatically aggregated.
 *     tags: [Warehouse Manager - Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             minItems: 1
 *             items:
 *               type: object
 *               required: [productID, quantity]
 *               properties:
 *                 productID:
 *                   type: string
 *                   example: 64f2a91e9c7e123456789abc
 *                 quantity:
 *                   type: number
 *                   example: 10
 *     responses:
 *       200:
 *         description: Products added or updated successfully
 *       400:
 *         description: Invalid product data
 *       404:
 *         description: Some products not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a warehouse manager)
 */

/**
 * @swagger
 * /manager/products:
 *   delete:
 *     summary: Remove products from my warehouse
 *     description: |
 *       Removes the managed warehouse from the specified products.
 *       The products themselves are not deleted from the system.
 *     tags: [Warehouse Manager - Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             minItems: 1
 *             items:
 *               type: string
 *               example: 64f2a91e9c7e123456789abc
 *     responses:
 *       200:
 *         description: Products removed from warehouse successfully
 *       400:
 *         description: Product IDs are required
 *       404:
 *         description: Some products not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a warehouse manager)
 */
