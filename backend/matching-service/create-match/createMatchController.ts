import { Response } from 'express'
import SuccessfulMatch from '../models/match'
import { CreateMatchRequest } from '../models/types'
import logger from '../utils/logger'

const addMatch = async (req: CreateMatchRequest, res: Response) => {
    const { matchId, collaborators, questionId } = req.body

    if (!matchId || !collaborators || collaborators.length == 0 || !questionId) {
        return res
            .status(400)
            .json({ message: 'Collaborators and question ID are required' })
    }

    const match = new SuccessfulMatch({
        matchId,
        collaborators,
        questionId
    })

    try {
        await match.save()
        return res.status(200).json({ message: 'Match successfully added to database' })
    } catch (e) {
        logger.error('Error adding match to database', e)
        return res.status(500).json({ message: 'Error adding match to database' })
    }
}

export { addMatch  }