import User from "../../models/user";
import logger from "../../utils/logger";

/**
 * Checks whether a given userId is an admin
 * 
 * @param userId The user id of the user
 * @returns true if the user is an admin
 */

interface UserInfo {
    name: string;
    email: string;
}

export const findUserById = async ( userId: string ): Promise<UserInfo> => {
    
    const user = await User.findById(userId).select('-password');

    if (!user) {
        logger.warn('Attempt in findUserById failed: User not found.');
        throw new Error('Could not find user by Id: perhaps the user does not exist.');
    }

    const userInfo: UserInfo = {
        name: user.name,
        email: user.email,
        
    };
    
    return userInfo
};