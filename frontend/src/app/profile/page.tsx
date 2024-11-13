'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator";
import { difficulties } from '@/utils/constant';
import HistoryTable from '@/app/profile/components/HistoryTable';
import { FolderClock as HistoryIcon, Loader2 } from 'lucide-react';
import { MatchHistory, columns } from "./components/columns"
import { DataTable } from "./components/data-table"

interface UserStatistics {
    totalQuestions: number,
    difficulty: Record<string, number>,
    categories: Record<string, number>
}

const ProfilePage: React.FC = () => {
    const { isAuthenticated, user, isAdmin, refreshAuth } = useAuth();
    const [pastMatches, setPastMatches] = useState<PastMatch[]>([]);
    const [userStatistics, setUserStatistics] = useState<UserStatistics>();
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isLoadingMatches, setIsLoadingMatches] = useState(true);

    const questionServiceBaseUrl = process.env.NEXT_PUBLIC_QUESTION_SERVICE_URL;
    const historyServiceBaseUrl = process.env.NEXT_PUBLIC_HISTORY_SERVICE_URL;

    const fetchUserStats = async () => {
        if (!user?.id) return;

        try {
            setIsLoadingStats(true);
            const response = await fetch(`${historyServiceBaseUrl}/stats/${user.id}`, {
                method: 'GET',
            });
            const { data } = await response.json();
            if (response.ok) {
                setUserStatistics(data);
            }
        } catch (err) {
            console.error("Error!", err);
        } finally {
            setIsLoadingStats(false);
        }
    }

    const fetchQuestionData = async (questionId: string) => {
        try {
            const response = await fetch(`${questionServiceBaseUrl}/get-questions?questionId=${questionId}`, {
                method: 'GET',
            });
            const data = await response.json();
            if (response.ok) {
                return data[0]?.title || '';
            }
            return '';
        } catch (err) {
            console.error("Error", err);
            return '';
        }
    }

    const fetchPastMatches = async () => {
        if (!user?.id) return;

        try {
            setIsLoadingMatches(true);
            const response = await fetch(`${historyServiceBaseUrl}/history/${user.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch past successful matches');
            }
            const { data } = await response.json();

            // Fetch all question titles in parallel
            const matchesWithTitles = await Promise.all(
                data.map(async (match: any) => {
                    const questionTitle = await fetchQuestionData(match.questionId);
                    return { ...match, questionTitle };
                })
            );

            setPastMatches(matchesWithTitles);
        } catch (err) {
            console.error("Error", err);
        } finally {
            setIsLoadingMatches(false);
        }
    }

    useEffect(() => {
        if (user?.id) {
            fetchUserStats();
            fetchPastMatches();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="flex flex-grow items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const ProfileCardSkeleton = () => (
        <div className="flex animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gray-200 mr-4" />
            <div className='py-1 space-y-2'>
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
            </div>
        </div>
    );

    const StatsSkeleton = () => (
        <div className="animate-pulse space-y-4">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded" />
                ))}
            </div>
        </div>
    );

    const HistorySkeleton = () => (
        <div className="animate-pulse space-y-4 pt-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
        </div>
    )

    return (
        <div className="flex flex-grow items-center justify-center w-screen">
            <div className="flex-col h-full py-12 w-5/6 2xl:w-3/5 space-y-8">
                <div className="flex flex-grow gap-8">
                    <div className="min-w-[300px] w-1/4 h-fit p-4 bg-white rounded-lg space-y-4 shadow-lg">
                        {/* Profile Card */}
                        {isLoadingStats ? <ProfileCardSkeleton /> : (
                            <div className="flex">
                                <img
                                    src="/assets/wumpus.jpg"
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
                        )}
                        <Separator />
                        {/* Problems Statistics */}
                        {isLoadingStats ? <StatsSkeleton /> : (
                            <div className="flex flex-col gap-2">
                                <div className='flex'>
                                    <h2 className="text-sm font-bold">Problems Solved</h2>
                                    <p className="text-sm ml-auto">{userStatistics?.totalQuestions || 0}</p>
                                </div>
                                <div className='grid grid-cols-3 gap-2'>
                                    {difficulties.map((difficulty) => (
                                        <div key={difficulty} className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-sm">
                                            <span style={{ color: `var(--color-${difficulty}-bg)` }} className={`text-xs font-semibold`}>
                                                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                            </span>
                                            <span className="text-xs">
                                                {userStatistics?.difficulty[difficulty.charAt(0).toUpperCase() + difficulty.slice(1)] || 0}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <Separator />
                        {/* Categories Statistics */}
                        {isLoadingStats ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-4 w-16 bg-gray-200 rounded" />
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-6 w-20 bg-gray-200 rounded" />
                                    ))}
                                </div>
                            </div>
                        ) : (
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
                        )}
                    </div>
                    <div className="flex flex-col flex-1 bg-white rounded-lg p-6 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <HistoryIcon size={20} />
                            <h2 className="text-md font-semibold">History</h2>
                        </div>
                        {isLoadingMatches ? (
                            <HistorySkeleton />
                        ) : (
                            <DataTable columns={columns} data={pastMatches} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;