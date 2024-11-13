import User from '../../models/user';
import logger from '../../utils/logger';

/**
 * Checks whether a given userId is an admin
 * 
 * @param userId The user id of the user
 * @returns true if the user is an admin
 */
export const checkIsAdmin = async ( userId: string ) => {
    const user = await User.findById(userId).select('-password'); // excl password

    if (!user) {
        logger.warn('User not found.');
        return false
    }

    if (!user.isAdmin) {
        logger.warn('User is not an administrator.');
        return false
    }
    
    return true
};

