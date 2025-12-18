/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: >
 *     Authentication and account management.
 *     This API uses HTTP-only cookies for authentication.
 *     Google OAuth is browser-based and not intended to be tested via Swagger.
 */

/**
 * @swagger
 * /auth/sign-up-validation:
 *   post:
 *     summary: Validate sign-up details and send OTP (Max requests- 7)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: OTP sent to email
 *       409:
 *         description: Email already taken
 */

/**
 * @swagger
 * /auth/sign-up:
 *   post:
 *     summary: Complete sign-up using OTP (Max attempts- 5)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [email, OTP]
 *             properties:
 *               email:
 *                 type: string
 *               OTP:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login using email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful (AT & RT cookies set)
 *       403:
 *         description: Google-only account
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Request OTP for password reset (Max requests- 7)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: OTP sent to email
 */

/**
 * @swagger
 * /auth/reset-password/verify:
 *   post:
 *     summary: Verify OTP for password reset (Max attempts- 5)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [email, OTP]
 *             properties:
 *               email:
 *                 type: string
 *               OTP:
 *                 type: string
 *     responses:
 *       201:
 *         description: OTP verified, reset session created
 */

/**
 * @swagger
 * /auth/reset-password/submit:
 *   patch:
 *     summary: Submit new password after OTP verification
 *     tags: [Auth]
 *     description: Requires PRT cookie issued after OTP verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [email, newPassword, confirmNewPassword]
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmNewPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Password changed successfully
 */

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Change password (logged-in user)
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmNewPassword]
 *             properties:
 *               newPassword:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *               confirmNewPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Password changed successfully
 */

/**
 * @swagger
 * /auth/change-email/request:
 *   post:
 *     summary: Request OTP to change email (Max requests- 7)
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [newEmail]
 *             properties:
 *              newEmail:
 *                 type: string
 *     responses:
 *       201:
 *         description: OTP sent to new email
 */

/**
 * @swagger
 * /auth/change-email/verify:
 *   patch:
 *     summary: Verify OTP and change email (Max attempts- 5)
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [OTP]
 *             properties:
 *              OTP:
 *               type: string
 *     responses:
 *       201:
 *         description: Email changed successfully
 */

/**
 * @swagger
 * /auth/delete-account:
 *   post:
 *     summary: Delete current user account
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *              password:
 *               type: string
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Logged out successfully
 */
