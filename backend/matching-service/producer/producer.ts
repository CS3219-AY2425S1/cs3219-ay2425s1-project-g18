import dotenv from 'dotenv'
import { connect, Connection } from 'amqplib'
import logger from '../utils/logger'

dotenv.config({ path: './.env' })

const rabbitUrl: string = String(process.env.RABBITMQ_URL)

const sendMatchingRequest = async (data: any) => {
    const maxRetries = 3
    const retryDelay = 13000 // 13 secs

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            logger.info(`Attempt ${attempt}: Connecting to RabbitMQ at ${rabbitUrl}`)
            const connection: Connection = await connect(rabbitUrl)
            const channel = await connection.createChannel()

            const queue = 'matching_requests'
            await channel.assertQueue(queue, { durable: false })

            const msg = JSON.stringify(data)
            channel.sendToQueue(queue, Buffer.from(msg))
            logger.info(`Sent matching request to queue: ${msg}`)

            await channel.close()
            await connection.close()
            logger.info('RabbitMQ connection closed gracefully.')
            break 
        } catch (error: any) {
            logger.error(`Attempt ${attempt}: Failed to send matching request: ${error.message}`)
            if (attempt === maxRetries) {
                logger.error('Max retries reached. Failed to send matching request.')
                throw error
            }
            logger.info(`Retrying in ${retryDelay} seconds...`)
            await new Promise(res => setTimeout(res, retryDelay))
        }
    }
}

export { sendMatchingRequest }
