/**
 * @swagger
 * /my-profile:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /my-profile:
 *   patch:
 *     summary: Update logged-in user's profile
 *     description: |
 *       Only profile-related fields can be updated.
 *       The following fields are NOT allowed:
 *       - email
 *       - roles
 *       - auth
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid update fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 */

/**
 * @swagger
 * /my-profile/addresses:
 *   post:
 *     summary: Add a new address to user's profile
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [street, pinCode, city, state]
 *             properties:
 *               label:
 *                 type: string
 *                 example: Home
 *                 description: Optional label for the address
 *               street:
 *                 type: string
 *                 example: 221B Baker Street
 *               pinCode:
 *                 type: string
 *                 example: "110001"
 *               city:
 *                 type: string
 *                 example: New Delhi
 *               state:
 *                 type: string
 *                 example: Delhi
 *     responses:
 *       201:
 *         description: Address added successfully
 *       400:
 *         description: Invalid or missing address fields
 *       401:
 *         description: Unauthorized
 */


/**
 * @swagger
 * /my-profile/addresses/{id}:
 *   patch:
 *     summary: Update an existing address
 *     tags: [User]
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
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 example: Office
 *               street:
 *                 type: string
 *                 example: MG Road
 *               pinCode:
 *                 type: string
 *                 example: "560001"
 *               city:
 *                 type: string
 *                 example: Bengaluru
 *               state:
 *                 type: string
 *                 example: Karnataka
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Invalid update data
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /my-profile/addresses/{id}:
 *   delete:
 *     summary: Delete an address by ID
 *     tags: [User]
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
 *         description: Address deleted successfully
 *       400:
 *         description: Address ID is required
 *       404:
 *         description: Address not found or no saved addresses
 *       401:
 *         description: Unauthorized
 */
