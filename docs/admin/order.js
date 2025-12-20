/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders (Admin)
 *     description: |
 *       Fetch all orders in the system using query string filters.
 *
 *     tags: [Admin - Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       # -------- ORDER STATUS --------
 *       - in: query
 *         name: orderStatus
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - placed
 *             - processing
 *             - ready_for_pickup
 *             - delivered
 *             - cancelled
 *             - out_for_delivery
 *             - reached_destination
 *         description: Filter by order status
 *
 *       # -------- PAYMENT STATUS --------
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - paid
 *             - refunded
 *             - failed
 *         description: Filter by payment status
 *
 *       # -------- PAYMENT METHOD --------
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum:
 *             - card
 *             - upi
 *             - cash_on_delivery
 *             - netbanking
 *         description: Filter by payment method
 *
 *       # -------- USER FILTER --------
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *
 *       # -------- SORT / PAGINATION --------
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: |
 *           Sorting rule.
 *           Example: `createdAt,-totalAmount`
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of orders to return
 *
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *         description: Number of orders to skip
 *
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: |
 *           Fields to include or exclude.
 *
 *           - Include: `select=orderStatus,totalAmount,createdAt`
 *           - Exclude: `select=-products,-shippingAddress`
 *
 *           Mixing include and exclude is not allowed.
 *
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */


/**
 * @swagger
 * /admin/orders:
 *   delete:
 *     summary: Delete multiple orders (Admin)
 *     description: |
 *       Delete multiple orders using query string filters.
 *
 *       ⚠️ At least one filter is required.
 *
 *     tags: [Admin - Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       # -------- ORDER STATUS --------
 *       - in: query
 *         name: orderStatus
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - placed
 *             - processing
 *             - ready_for_pickup
 *             - delivered
 *             - cancelled
 *             - out_for_delivery
 *             - reached_destination
 *
 *       # -------- PAYMENT STATUS --------
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - paid
 *             - refunded
 *             - failed
 *
 *       # -------- PAYMENT METHOD --------
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum:
 *             - card
 *             - upi
 *             - cash_on_delivery
 *             - netbanking
 *
 *       # -------- PAGINATION --------
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Maximum number of orders to delete
 *
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *         description: Number of matched orders to skip
 *
 *     responses:
 *       200:
 *         description: Orders deleted successfully
 *       400:
 *         description: Filter is required
 *       404:
 *         description: No orders found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */


/**
 * @swagger
 * /admin/orders:
 *   patch:
 *     summary: Update multiple orders (Admin)
 *     description: |
 *       Bulk update orders using query string filters.
 *
 *       ⚠️ At least one filter is required.
 * 
 *     tags: [Admin - Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       # -------- FILTERS --------
 *       - in: query
 *         name: orderStatus
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - placed
 *             - processing
 *             - ready_for_pickup
 *             - delivered
 *             - cancelled
 *             - out_for_delivery
 *             - reached_destination
 *
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - paid
 *             - refunded
 *             - failed
 *
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum:
 *             - card
 *             - upi
 *             - cash_on_delivery
 *             - netbanking
 *
 *       # -------- PAGINATION --------
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Maximum number of orders to update
 *
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *         description: Number of matched orders to skip
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - placed
 *                   - processing
 *                   - ready_for_pickup
 *                   - delivered
 *                   - cancelled
 *                   - out_for_delivery
 *                   - reached_destination
 *
 *               paymentStatus:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - paid
 *                   - refunded
 *                   - failed
 *
 *               totalAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Orders updated successfully
 *       400:
 *         description: Missing filters or invalid update fields
 *       404:
 *         description: No orders found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */


/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     summary: Get order by ID (Admin)
 *     tags: [Admin - Orders]
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
 *         description: Order fetched successfully
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /admin/orders/{id}:
 *   patch:
 *     summary: Update order by ID (Admin)
 *     tags: [Admin - Orders]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update in the order
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Empty body or invalid data
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /admin/orders/{id}:
 *   delete:
 *     summary: Delete order by ID (Admin)
 *     tags: [Admin - Orders]
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
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /admin/orders/stats:
 *   get:
 *     summary: Get order statistics (Admin)
 *     description: |
 *       Returns order and revenue statistics.
 *
 *       Supported time filters:
 *       - last_30_days
 *       - last_day
 *       - year_to_date
 *     tags: [Admin - Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: time
 *         schema:
 *           type: string
 *           enum:
 *             - last_30_days
 *             - last_day
 *             - year_to_date
 *     responses:
 *       200:
 *         description: Order statistics fetched successfully
 *       400:
 *         description: Invalid query parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
 