
import { Request, Response } from 'express';
import { registrationValidator } from '../auth_utils/signUpValidator';
import { registerUser as registerUserService } from '../db_utils/userSignUpService';
import { connectToDatabase } from '../../config/db';

const registerUser = async (req: Request, res: Response) => {
    // Validate input
    const { error, value } = registrationValidator.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = value;

    try {
        await connectToDatabase();

        const user = await registerUserService({ name, email, password });

        res.status(201).json({ message: 'User registered successfully.', userId: user._id });
    } catch (error: any) {
        if (error.message === 'User already exists') {
            return res.status(409).json({ message: 'User already exists. Please proceed to sign in.' });
        }
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export { registerUser };
