'use client'
import { useEffect, useState } from "react";
import QuestionTable from "../problems/components/QuestionTable";
import MatchingFilters from "./components/MatchingFilters";
import { Notebook } from 'lucide-react';
import { getAccessToken } from "../../utils/checkAuth";

export default function ExplorePage() {
    const [questions, setQuestions] = useState([]);

    const fetchQuestions = async () => {
        try {
            const questionServiceBaseUrl = process.env.NEXT_PUBLIC_QUESTION_SERVICE_URL;
            const response = await fetch(`${questionServiceBaseUrl}/get-questions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch questions')
            }
            const data = await response.json()
            setQuestions(data)
        } catch (err) {
            console.log("Error", err)
        }
    }

    useEffect(() => {
        fetchQuestions()
    }, [])

    return (
        <section className="flex flex-grow justify-center">
            <div className="flex-col h-full py-12 w-5/6 2xl:w-3/5 space-y-8">
                <div className="shadow-lg rounded-lg">
                    <MatchingFilters />
                </div>
                <div className="flex flex-grow gap-8">
                    <div className="w-2/3 shadow-lg rounded-lg space-y-4 p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Notebook size={20} />
                            <h2 className="text-md font-semibold">Questions</h2>
                        </div>
                        <QuestionTable questions={questions} isAdmin={false}/>
                    </div>
                    <div className="flex-1 shadow-lg rounded-lg">Suggested</div>
                </div>
            </div>
        </section>
    )
}
