import axios from "axios"
import { Response } from "express"
import logger from "../utils/logger"
import { GetUserMatchRequest } from "../models/types"

const getCollaborator = async (req: GetUserMatchRequest, res: Response) => {
    const { userId } = req.params

    try {
        const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/get-user/${userId}`)
        logger.info(`Retrieved user ${userId} details`)
        return res.status(200).json({ user: response.data.user })
    } catch {
        logger.error(`Error fetching user ${userId} details`)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export { getCollaborator  }