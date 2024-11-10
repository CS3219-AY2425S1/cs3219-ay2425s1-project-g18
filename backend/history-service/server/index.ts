import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import logger from "../utils/logger"
import { router as getMatchHistoryRoute } from "../get-match-history/getMatchHistoryRoute" 
import { router as getSubmissionsRoute } from "../get-submissions/getSubmissionsRoute"
import { router as getUserRoute } from "../get-user/getUserRoute"
import { router as getMatchRoute } from "../get-match/getMatchRoute"

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

app.use(getMatchHistoryRoute)
app.use(getSubmissionsRoute)
app.use(getUserRoute)
app.use(getMatchRoute)

const port = process.env.PORT || 3000

app.listen(port, () => {
    logger.info(`Server running on port ${port}`)
})