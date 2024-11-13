import axios from "axios"
import { Response } from "express"
import logger from "../utils/logger"
import { GetUserMatchRequest } from "../models/types"

const getUserMatchHistory = async (req: GetUserMatchRequest, res: Response) => {
    const { userId } = req.params

    try {
        const response = await axios.get(`${process.env.MATCH_SERVICE_URL}/get-user-match-history/${userId}`)
        logger.info(`Successfully fetched past successful matches for user ${userId}`)
        return res.status(200).json(response.data)
    } catch (e) {
        logger.error(`Error fetching past successful matches for user ${userId}`)
        return res.status(500).json({ message: 'Error fetching past successful matches' })
    }
}

export { getUserMatchHistory }