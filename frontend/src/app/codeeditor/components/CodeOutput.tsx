
import { Button } from "@/components/ui/button";
import { error } from "console";

interface TestCase {
    input: string;
    expected: string;
    output: string;
    passed: boolean;
  }
  
  interface CodeOutputProps {
    outputText: string;
    errorOutputText: string;
    allPassed: boolean;
    handleRunCode: () => void;
    handleSubmitCode: () => void;
    testCases: TestCase[];
    isRunLoading: boolean; 
    isSubmitLoading: boolean; 
  }

const CodeOutput:React.FC<CodeOutputProps> = ( { outputText, errorOutputText, allPassed, handleRunCode, handleSubmitCode, testCases, isRunLoading, isSubmitLoading } ) => {

    return (
        <div className="flex flex-col h-full justify-between border-2 rounded-lg p-4 overflow-y-auto">
            {/* Output Text */}
            <div>
                {allPassed ? (
                <p className="text-green-700 font-semibold">{outputText}</p>
                ) : (
                <p className="text-rose-700 font-semibold">{outputText}</p>
                )}
            </div>

            <div>
                { errorOutputText && <p className="text-rose-700 font-semibold">{errorOutputText}</p> }
            </div>

            {/* Display Test Cases */}
            <div className="mt-4">
                {testCases.length > 0 ? (
                testCases.map((testCase, index) => (
                    <div key={index} className="mb-4 border-b pb-2">
                    <p className="font-bold">
                        Test Case {index + 1}:{" "}
                        {testCase.passed ? (
                        <span className="text-green-700">Passed ✅</span>
                        ) : (
                        <span className="text-rose-700">Failed ❌</span>
                        )}
                    </p>
                    <p>
                        <strong>Input:</strong> {testCase.input}
                    </p>
                    <p>
                        <strong>Expected Output:</strong> {testCase.expected}
                    </p>
                    <p>
                        <strong>Your Output:</strong> {testCase.output}
                    </p>
                    </div>
                ))
                ) : (
                <p>No test cases to display.</p>
                )}
            </div>
            <div className="flex justify-end gap-1 mt-4">
                <Button variant="secondary" onClick={handleRunCode} disabled={isRunLoading || isSubmitLoading}>{isRunLoading ? "Running..." : "Run Code"}</Button>
                <Button onClick={handleSubmitCode} disabled={isRunLoading || isSubmitLoading}>{isSubmitLoading ? "Submitting..." : "Submit"}</Button>
            </div>
        </div>
    );
}


export default CodeOutput;