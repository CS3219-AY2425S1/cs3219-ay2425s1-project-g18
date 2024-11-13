'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator";
import { difficulties } from '@/utils/constant';
import HistoryTable from '@/app/profile/components/HistoryTable';
import { FolderClock as HistoryIcon } from 'lucide-react';

interface UserStatistics {
    totalQuestions: number,
    difficulty: Record<string, number>,
    categories: Record<string, number>
}

const ProfilePage: React.FC = () => {
    const { isAuthenticated, user, isAdmin, refreshAuth } = useAuth();
    const [pastMatches, setPastMatches] = useState<PastMatch[]>([]);
    const [totalNumberOfMatches, setTotalNumberOfMatches] = useState(0);
    const [userStatistics, setUserStatistics] = useState<UserStatistics>();
    const [isLoadingMatches, setIsLoadingMatches] = useState(false);

    const questionServiceBaseUrl = process.env.NEXT_PUBLIC_QUESTION_SERVICE_URL;
    const historyServiceBaseUrl = process.env.NEXT_PUBLIC_HISTORY_SERVICE_URL;

    const fetchUserStats = async () => {
        try {
            const response = await fetch(`${historyServiceBaseUrl}/stats/${user?.id}`, {
                method: 'GET',
            });
            const { data } = await response.json()
            if (response.ok) {
                setUserStatistics(data);
            }
            return '';
        } catch (err) {
            console.log("Error!", err)
            return '';
        }
    }

    const fetchQuestionData = async (questionId: string) => {
        try {
            const response = await fetch(`${questionServiceBaseUrl}/get-questions?questionId=${questionId}`, {
                method: 'GET',
            });
            const data = await response.json()
            if (response.ok) {
                return data[0]?.title || '';
            }
            return '';
        } catch (err) {
            console.log("Error", err)
            return '';
        }
    }

    const fetchPastMatches = async () => {
        try {
            setIsLoadingMatches(true)
            const response = await fetch(`${historyServiceBaseUrl}/history/${user?.id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch past successful matches')
            }
            const { data } = await response.json()

            const matchesWithTitles = await Promise.all(
                data.map(async (match: any) => {
                    const questionTitle = await fetchQuestionData(match.questionId)
                    return { ...match, questionTitle }
                })
            );

            setPastMatches(matchesWithTitles)
            console.log(matchesWithTitles)
        } catch (err) {
            console.log("Error", err)
        } finally {
            setIsLoadingMatches(false);
        }
    }

    useEffect(() => {
        fetchUserStats();
        fetchPastMatches();
    }, []);

    if (!user || isLoadingMatches) {
        // Optionally, show a loading state while fetching user data and match history
        return (
            <div className="flex flex-grow items-center justify-center min-h-screen">
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-grow items-center justify-center w-screen">
            <div className="flex-col h-full py-12 w-5/6 2xl:w-3/5 space-y-8">
                <div className="flex flex-grow gap-8">
                    <div className="min-w-[300px] w-1/4 p-4 bg-white rounded-lg space-y-4 shadow-lg">
                        {/* Profile Card */}
                        <div className="flex">
                            <img
                                src="/assets/wumpus.jpg" // Keep the avatar as is
                                alt="User Avatar"
                                className="w-20 h-20 rounded-full mr-4 object-cover"
                            />
                            <div className='py-1'>
                                <div className='flex gap-2'>
                                    <h2 className="text-md font-bold">{user.name}</h2>
                                    {isAdmin && <Badge variant='outline'>Admin</Badge>}
                                </div>
                                <p className="text-gray-600 text-xs">{user.email}</p>
                            </div>
                        </div>
                        <Separator />
                        {/* Problems Statistics */}
                        <div className="flex flex-col gap-2">
                            <div className='flex'>
                                <h2 className="text-sm font-bold">Problems Solved</h2>
                                <p className="text-sm ml-auto">{userStatistics?.totalQuestions || 0}</p>
                            </div>
                            <div className='grid grid-cols-3 gap-2'>
                                {difficulties.map((difficulty) => (
                                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-sm">
                                        <span style={{ color: `var(--color-${difficulty}-bg)` }} className={`text-xs font-semibold`}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                                        <span className="text-xs">{userStatistics?.difficulty[difficulty.charAt(0).toUpperCase() + difficulty.slice(1)] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Separator />
                        {/* Categories Statistics */}
                        <div className="flex flex-col gap-2">
                            <h2 className="text-sm font-bold">Skills</h2>
                            <div className='flex flex-wrap gap-2'>
                                {Object.keys(userStatistics?.categories || {}).map((category) => (
                                    <Badge variant='category' key={category}>
                                        {category}: {userStatistics?.categories[category]}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col flex-1 bg-white rounded-lg p-6 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <HistoryIcon size={20} />
                            <h2 className="text-md font-semibold">History</h2>
                        </div>
                        <HistoryTable matches={pastMatches} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
