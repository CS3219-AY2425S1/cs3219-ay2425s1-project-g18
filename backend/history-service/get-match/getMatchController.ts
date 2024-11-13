import axios from "axios"
import { Response } from "express"
import logger from "../utils/logger"
import { GetUserMatchRequest } from "../models/types"

const getUserMatch = async (req: GetUserMatchRequest, res: Response) => {
    const { matchId } = req.params

    try {
        const response = await axios.get(`${process.env.MATCH_SERVICE_URL}/get-user-match/${matchId}`)
        logger.info(`Successfully fetched past successful matches for user ${matchId}`)
        return res.status(200).json(response.data)
    } catch (e) {
        logger.error(`Error fetching past successful matches for user ${matchId}`)
        return res.status(500).json({ message: 'Error fetching past successful matches' })
    }
}

export { getUserMatch  }