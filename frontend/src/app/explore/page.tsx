'use client'
import { useEffect, useState } from "react";
import QuestionTable from "../problems/components/QuestionTable";
import MatchingFilters from "./components/MatchingFilters";

export default function ExplorePage() {
    const [questions, setQuestions] = useState([]);

    const fetchQuestions = async () => {
        try {
            const response = await fetch('http://localhost:5001/get-questions')
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
                <div className="border-2 rounded-lg">
                    <MatchingFilters />
                </div>
                <div className="flex flex-grow gap-8">
                    <div className="w-2/3 border-2 rounded-lg space-y-4">
                        <QuestionTable questions={questions} isAdmin={false}/>
                    </div>
                    <div className="flex-1 border-2 rounded-lg">Suggested</div>
                </div>
            </div>
        </section>
    )
}
