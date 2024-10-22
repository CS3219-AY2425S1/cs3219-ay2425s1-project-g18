import dotenv from 'dotenv'
import { connect } from 'mongoose'
import logger from '../utils/logger'

dotenv.config({ path: './.env' })

const url: string | undefined = process.env.DATABASE_CONNECTION

if (!url) {
    throw new Error('Database connection URL is missing')
}

export const connectToDatabase = async () => {
    try {
        const res = await connect(url)

        if (res) {
            logger.info('Connected to question service database')
            return
        }
    } catch (e) {
        logger.error('Cannot connect to question service database', e)
    }
}
