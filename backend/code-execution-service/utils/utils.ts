import { ExecutionResult } from "../models/types"

export const formatTestInput = (input: any) => {
    if (Array.isArray(input)) {
        return input.join(' ')
    }
    return String(input)
}

export const countNumberOfPassedTestCases = (results: ExecutionResult[]) => {
    return results.filter((result) => result.passed).length
}

export const passedAllTestCases = (results: ExecutionResult[]) => {
    return results.every((result) => result.passed)
}