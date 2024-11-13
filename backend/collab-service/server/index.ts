import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import logger from '../utils/logger'

import createRoomRouter from '../create-room/createRoomRouter'
import deleteRoomRouter from '../delete-room/deleteRoomRouter'
import verifyRoomRouter from '../verify-room-validity/verifyRoomValidityRouter'
import { setupCodeCollabWebSocketServer } from '../websocket/websocketServer'
import { setupVideoCallServer } from '../websocket/videoCallServer'
import { verifyRoom } from '../verify-room-validity/verifyRoomValidityController'

dotenv.config({ path: './.env' })

const app = express()
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.USER_SERVICE_URL || 'http://user_service:5000',
        process.env.QUESTION_SERVICE_URL || 'http://question_service:5001',
        process.env.MATCH_SERVICE_URL || 'http://matching_service:5002',
        process.env.CODE_COLLAB_URL || 'http://collab_service:5003',
        process.env.CODE_EXECUTION_URL || 'http://code_execution_service:5005',
        process.env.HISTORY_SERVICE_URL || 'http://history_service:5006',
     ], 
    credentials: true, // allows cookies to be sent
}));
app.use(express.json())

app.use(createRoomRouter)
app.use(deleteRoomRouter)
app.use(verifyRoomRouter)

const PORT = process.env.PORT || 5003
const server = createServer(app)

setupVideoCallServer(server)
setupCodeCollabWebSocketServer(server)

server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
})
