import express from 'express';
import { registerUser } from '../controllers/userSignUpController';
import { userLoginController } from '../controllers/logInController';
import { authenticate, AuthenticatedRequest, authenticateForAccessToken } from '../../middleware/authMiddleware';
import { authStatusController } from '../controllers/checkAuthStatusController';
import { getUserProfile } from '../controllers/getUserProfileController';
import { authenticateAdmin } from '../../middleware/authAdminMiddleware';
import { checkAdminController } from '../controllers/checkAdminController';
import { getUserById } from '../controllers/getUserByIdController';
import { userLogoutController } from '../controllers/logoutController';
import { getNewAccessToken } from '../controllers/getNewAccessTokenController';

const router = express.Router();

/**
 * APIs for regular users
 */
// POST /api/users/register
// THIS REGISTERS A REGULAR USER.
router.post('/register', registerUser);
// POST /api/users/login
router.post('/login', userLoginController);
// POST /api/users/logout
router.post('/logout', authenticate, userLogoutController);

router.post('/refresh', authenticateForAccessToken, getNewAccessToken)

router.get('/get-user/:userId', getUserById);

// GET /api/users/status
// Checks whether the user is signed in (whether the cookie is valid/present)
router.get('/status', authStatusController);
// GET /api/users/profile
// Retrieve the profile of the signed in user using the given cookie. Protected path, cannot be accessed without cookie.
router.get('/profile', authenticate, getUserProfile);

/**
 * APIs for admin users
 */
// GET /api/users/isAdmin
// Checks whether the user is signed in (whether the cookie is valid/present)
router.get('/isAdmin', checkAdminController);

/**
 * FOR REFERENCE
 */
// Example Protected Route - Regular User
router.get('/protected', authenticate, (req: AuthenticatedRequest, res: express.Response) => {
    res.status(200).json({ message: 'Hello User! This is a protected route.', user: req.user });
});

// Example Protected Route - Admin User
router.get('/admin', authenticateAdmin, (req: AuthenticatedRequest, res: express.Response) => {
    res.status(200).json({ message: 'Hello Admin! This is a protected route.', user: req.user });
});
export default router;
