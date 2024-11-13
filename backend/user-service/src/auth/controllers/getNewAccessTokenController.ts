import { Request, Response } from 'express'
import { generateToken } from '../auth_utils/jwtUtils'

const getNewAccessToken = async (req: Request, res: Response) => {
    const accessToken = generateToken(req.user, '5s')
    return res.status(200).json({ accessToken })
}

export { getNewAccessToken }