import axios from 'axios'
import { Response } from 'express'
import logger from '../utils/logger'
import {
    CodeSubmissionRequest,
    ExecutionResult,
    TestCase,
    languageExtensions,
} from '../models/types'
import {
    formatTestInput,
    countNumberOfPassedTestCases,
    passedAllTestCases,
} from '../utils/utils'
import Submission from '../models/submission'
import { Schema } from 'mongoose'

const submitUserCode = async (
    req: CodeSubmissionRequest,
    res: Response,
): Promise<Response> => {
    const { questionId, matchId, code, language } = req.body

    if (!questionId || !code || !language) {
        return res
            .status(400)
            .json({ message: 'Question ID, code and language are required' })
    }

    let question: any
    let testCases: TestCase[]
    try {
        const getQuestionRes = await axios.get(
            `${process.env.QUESTION_SERVICE_URL}/get-questions`,
            {
                params: { questionId },
                validateStatus: (status) => status >= 200 && status < 500,
            },
        )

        if (!getQuestionRes.data || getQuestionRes.data.length === 0) {
            logger.error('Question not found')
            return res.status(400).json({ message: 'Question not found' })
        }

        question = getQuestionRes.data[0]
        testCases = question.testCases
    } catch (e) {
        logger.error('Error fetching question details', e)
        return res
            .status(500)
            .json({ message: 'Error fetching question details' })
    }

    let payload: any
    const formattedInput = testCases
        .map((tc) => formatTestInput(tc.input))
        .join('\n')
    const fileName = `q${questionId}.${languageExtensions.get(language == 'Cpp' ? 'c++' : language.toLowerCase())}`
    payload = {
        language: language.toLowerCase(),
        stdin: formattedInput,
        files: [
            {
                name: fileName,
                content: code,
            },
        ],
        compileOnly: false,
        wait: true,
    }

    let results: ExecutionResult[] = []
    try {
        const executeCodeRes = await axios.post(
            `${process.env.CODE_COMPILER_URL}`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com',
                    'x-rapidapi-key': process.env.ACCESS_TOKEN,
                },
                validateStatus: (status) => status >= 200 && status < 500,
            },
        )

        const codeOutput = (executeCodeRes.data.stdout || '').trim().split('\n')
        results = testCases.map((tc, i) => ({
            input: tc.input,
            expected: tc.expected,
            output: codeOutput[i]?.trim() || '',
            passed: String(tc.expected) == codeOutput[i]?.trim(),
        }))
    } catch (e) {
        logger.error('Error executing code', e)
        return res
            .status(500)
            .json({ message: 'Error executing code' })
    }

    let submissionId: Schema.Types.ObjectId
    let submission: any
    try {
        submission = new Submission({
            matchId,
            questionId,
            code,
            language,
            solved: passedAllTestCases(results),
            testCasesPassed: countNumberOfPassedTestCases(results),
            testCasesTotal: testCases.length,
        })
        await submission.save()
        logger.info('Submission saved successfully', submission)
    } catch (e) {
        logger.error('Error saving submission', e)
        return res
            .status(500)
            .json({ message: 'Error saving submission' })
    }

    try {
        submissionId = submission._id
        await axios.patch(`${process.env.MATCH_SERVICE_URL}/update-match`, {
            matchId,
            submissionId
        })

        logger.info('Match updated successfully')
        return res.status(200).json(submission)
    } catch (e) {
        logger.error('Error updating match', e)
        return res
            .status(500)
            .json({ message: 'Error updating match' })
    }
}

export { submitUserCode }
