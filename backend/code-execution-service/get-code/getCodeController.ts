import { Response } from "express"
import Submission from "../models/submission"
import logger from "../utils/logger"
import { GetCodeRequest } from "../models/types"

const getUserCode = async (req: GetCodeRequest, res: Response) => {
    const { matchId } = req.params

    try {
        const submissions = await Submission.find({ matchId })
        logger.info(`Successfully fetched submissions for match ${matchId}`)
        return res.status(200).json(submissions)
    } catch (e) {
        logger.error(`Error fetching submissions for match ${matchId}`)
        return res.status(500).json({ message: 'Error fetching submissions' })
    }
}

export { getUserCode }