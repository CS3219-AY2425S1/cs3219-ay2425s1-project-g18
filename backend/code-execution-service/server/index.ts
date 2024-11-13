import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import logger from "../utils/logger"
import { connectToDatabase } from "./db"
import { router as executeCodeRoute } from "../execute-code/executeCodeRoute"
import { router as submitCodeRoute } from "../submit-code/submitCodeRoute"
import { router as getCodeRoute } from "../get-code/getCodeRoute"

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
app.use(executeCodeRoute)
app.use(submitCodeRoute)
app.use(getCodeRoute)

connectToDatabase()

const port = process.env.PORT || 3000

app.listen(port, () => {
    logger.info(`Server running on port ${port}`)
})