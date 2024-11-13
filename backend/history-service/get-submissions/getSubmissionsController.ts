import axios from "axios"
import { Response } from "express"
import logger from "../utils/logger"
import { GetSubmissionRequest } from "../models/types"

const getSubmissions = async (req: GetSubmissionRequest, res: Response) => {
    const { matchId } = req.params

    try {
        const response = await axios.get(`${process.env.CODE_EXECUTION_SERVICE_URL}/get-code/${matchId}`)
        logger.info(`Successfully fetched past successful submissions for user ${matchId}`)
        return res.status(200).json(response.data)
    } catch (e) {
        logger.error(`Error fetching past successful submissions for user ${matchId}`)
        return res.status(500).json({ message: 'Error fetching past successful matches' })
    }
}

export { getSubmissions }