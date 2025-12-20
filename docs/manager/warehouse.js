/**
 * @swagger
 * /manager/warehouse:
 *   get:
 *     summary: Get my managed warehouse
 *     description: |
 *       Returns the warehouse managed by the currently authenticated
 *       warehouse manager.
 *
 *       This endpoint is accessible only to users with the `warehouse_manager` role.
 *     tags: [Warehouse Manager - Warehouse]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Warehouse fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a warehouse manager)
 */
