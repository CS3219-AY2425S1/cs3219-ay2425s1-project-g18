import dotenv from 'dotenv'
import { connect } from 'mongoose'

dotenv.config({ path: './.env' })

const url: string | undefined = process.env.DATABASE_CONNECTION

if (!url) {
    throw new Error('Database connection URL is missing')
}

export const connectToDatabase = async () => {
    try {
        const res = await connect(url)

        if (res) {
            console.log('Connected to question service database')
            return
        }
    } catch (e) {
        console.log('Cannot connect to question service database', e)
    }
}
