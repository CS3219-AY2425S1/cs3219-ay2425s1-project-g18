import axios from 'axios'
import { Response } from 'express'
import logger from '../utils/logger'
import {
    CodeExecutionRequest,
    ExecutionResult,
    TestCase,
    languageExtensions,
} from '../models/types'
import {
    formatTestInput,
    countNumberOfPassedTestCases,
    passedAllTestCases
} from '../utils/utils'
import { error } from 'winston'

const executeUserCode = async (
    req: CodeExecutionRequest,
    res: Response,
): Promise<Response> => {
    const { questionId, code, language } = req.body

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

    const formattedInput = testCases
        .map((tc) => formatTestInput(tc.input))
        .join('\n')

    const fileName = `q${questionId}.${languageExtensions.get(language == 'Cpp' ? 'c++' : language.toLowerCase())}`
    let payload = {
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

        if (executeCodeRes.data.stderr) {
            let errorMsg = executeCodeRes.data.stderr
            console.log(errorMsg)
            logger.error(
                'Error appeared when executing code',
                { error: errorMsg },
            )
            return res.status(400).json({
                success: false,
                error: executeCodeRes.data.stderr,
                compilationOutput: executeCodeRes.data.compilationOutput,
            })
        }

        const codeOutput = (executeCodeRes.data.stdout || '').trim().split('\n')
        const results: ExecutionResult[] = testCases.map((tc, i) => ({
            input: tc.input,
            expected: tc.expected,
            output: codeOutput[i]?.trim() || '',
            passed: String(tc.expected) == codeOutput[i]?.trim(),
        }))

        const response = {
            success: passedAllTestCases(results),
            results,
            testCasesPassed: countNumberOfPassedTestCases(results),
            testCasesTotal: testCases.length,
            compilationOutput: executeCodeRes.data.compilationOutput,
            error: executeCodeRes.data.stderr,
        }

        const submissionOutcomeMsg = response.success
            ? 'All test cases passed'
            : 'Some test cases failed'
        logger.info(`Code execution results: ${submissionOutcomeMsg}`)
        return res.status(200).json(response)
    } catch (e) {
        logger.error('Error executing code', e)
        return res
            .status(500)
            .json({ message: 'Error executing code with OneCompiler' })
    }
}

export { executeUserCode }
