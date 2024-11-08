import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import logger from '../utils/logger'

import createRoomRouter from '../create-room/createRoomRouter'
import deleteRoomRouter from '../delete-room/deleteRoomRouter'
import liveblocksAuthRouter from '../liveblocks/liveblocksAuthRouter'
import { setupCodeCollabWebSocketServer } from '../websocket/websocketServer'
import { setupVideoCallServer } from '../websocket/videoCallServer'
import { verifyRoom } from '../verify-room-validity/verifyRoomValidityController'

dotenv.config({ path: './.env' })

const app = express()
app.use(cors())
app.use(express.json())

app.use(createRoomRouter)
app.use(deleteRoomRouter)
app.use(liveblocksAuthRouter)
app.use(verifyRoom)

const PORT = process.env.PORT || 5003
const server = createServer(app)

setupCodeCollabWebSocketServer()
setupVideoCallServer(server)

server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
})