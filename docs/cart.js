/**
 * @swagger
 * /my-cart:
 *   get:
 *     summary: Get logged-in user's cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 *         content:
 *           application/x-www-form-urlencoded:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       type: object
 *                     cartSummary:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /my-cart/add:
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [productID]
 *             properties:
 *               productID:
 *                 type: string
 *                 example: 693ec24346dc79e827f2f149
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *       400:
 *         description: Invalid input or stock issue
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /my-cart/clear:
 *   delete:
 *     summary: Clear all items from the cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       404:
 *         description: Cart already empty
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /my-cart/update/{productID}/{operation}:
 *   patch:
 *     summary: Increase or decrease product quantity in cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productID
 *         required: true
 *         schema:
 *           type: string
 *         example: 693ec24346dc79e827f2f149
 *       - in: path
 *         name: operation
 *         required: true
 *         schema:
 *           type: string
 *           enum: [inc, dec]
 *         example: inc
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       400:
 *         description: Invalid operation or stock limit reached
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */

