'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { QuestionTable } from "../problems/components/QuestionTable";
import MatchingFilters from "./components/MatchingFilters";
import { useAuth } from "@/context/authContext";
import ActiveMatch from "./components/ActiveMatch";
import { History, Notebook } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GetRoomsResponse {
    roomId: string;
}

export default function ExplorePage() {
    const [questions, setQuestions] = useState([]);
    const [roomId, setRoomId] = useState<string | undefined>(undefined);
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const fetchQuestions = async () => {
        try {
            const questionServiceBaseUrl = process.env.NEXT_PUBLIC_QUESTION_SERVICE_URL;
            const response = await fetch(`${questionServiceBaseUrl}/get-questions`)
            if (!response.ok) {
                throw new Error('Failed to fetch questions')
            }
            const data = await response.json()
            setQuestions(data)
        } catch (err) {
            console.log("Error", err)
        }
    }

    const fetchActiveMatch = async () => {
        try {
            const collabServiceBaseUrl = process.env.NEXT_PUBLIC_CODE_COLLAB_URL;

            if (!collabServiceBaseUrl) {
                throw new Error('Collab Service Base URL is not defined');
            }

            // Ensure that user and user.id are available
            if (!user?.id) {
                throw new Error('User ID is not available');
            }

            const response = await fetch(`${collabServiceBaseUrl}/get-rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id }),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('No active match found for the user.');
                } else {
                    throw new Error(`Failed to fetch an active match: ${response.statusText}`);
                }
                return;
            }

            const data: GetRoomsResponse = await response.json();

            if (data.roomId) {
                setRoomId(data.roomId);
            } else {
                console.warn('Received unexpected response structure:', data);
            }
        } catch (err) {
            console.error('Error fetching active match:', err);
        }
    };

    useEffect(() => {
        fetchQuestions()
        fetchActiveMatch()
    }, [])

    return (
        <section className="flex flex-grow justify-center">
            <div className="flex-col h-full py-12 w-5/6 2xl:w-3/5 space-y-8">
                {roomId == undefined ?
                    <div className="shadow-lg rounded-lg">
                        <MatchingFilters />
                    </div> :
                    <div className="shadow-lg rounded-lg">
                        <ActiveMatch roomId={roomId} />
                    </div>}
                <div className="flex flex-grow gap-8">
                    <div className="w-2/3 shadow-lg rounded-lg space-y-4 p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Notebook size={20} />
                            <h2 className="text-md font-semibold">Questions</h2>
                        </div>
                        <QuestionTable data={questions} isAdmin={false} />
                    </div>
                    <div className="flex flex-col flex-1 gap-4">
                        <Card
                            className="relative group cursor-pointer border-none overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
                            onClick={() => router.push('/problems')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(89,50,195,1)] via-[rgba(129,140,248,1)] to-[#a3acff]" />

                            <div className="relative p-6">
                                <CardHeader className="p-0">
                                    <Notebook className="text-white w-8 h-8 mb-4" />
                                    <CardTitle className="text-white text-lg">Questions</CardTitle>
                                    <CardDescription className="text-white/80">
                                        Explore our collection of problems
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-0 mt-4">
                                    <div className="w-full h-1 bg-white/20 rounded overflow-hidden">
                                        <div className="w-2/3 h-full bg-white/40 rounded" />
                                    </div>
                                </CardContent>
                            </div>
                        </Card>

                        <Card
                            className="relative group cursor-pointer border-none overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
                            onClick={() => router.push('/profile')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(46,86%,50%)] via-[hsl(46,79%,67%)] to-[hsl(46,77%,76%)]" />

                            <div className="relative p-6">
                                <CardHeader className="p-0">
                                    <History className="text-white w-8 h-8 mb-4" />
                                    <CardTitle className="text-white text-lg">History</CardTitle>
                                    <CardDescription className="text-white/80">
                                        View your past matches and statistics
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-0 mt-4">
                                    <div className="w-full h-1 bg-white/20 rounded overflow-hidden">
                                        <div className="w-1/2 h-full bg-white/40 rounded" />
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}
