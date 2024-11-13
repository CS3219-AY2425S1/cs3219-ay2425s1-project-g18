import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { UserIcon } from 'lucide-react';
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label";
import { Spinner } from '@/components/spinner'

interface SuccessMatchInfoProps {
    isOpen: boolean;
    match: {
        matchId: string;
        partner: {
            userId: string;
            userName: string;
        };
        question: {
            questionId: number;
            title: string;
            difficulty: string;
            categories: string[];
        };
        language: string;
    };
    onOpenChange: (isOpen: boolean) => void;
    handleAccept: (matchId: string) => void;
    matchStatus: 'pending' | 'waiting' | 'accepted' | 'timeout' | 'failed';
    setMatchStatus: React.Dispatch<React.SetStateAction<'pending' | 'waiting' | 'accepted' | 'timeout' | 'failed'>>;
}


const SuccessMatchInfo = (props: SuccessMatchInfoProps) => {
    const { isOpen, match, onOpenChange, handleAccept, matchStatus, setMatchStatus } = props;
    const [timerProgress, setTimerProgress] = useState(0);
    const [isAcceptDisabled, setIsAcceptDisabled] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        if (isOpen && (matchStatus === 'pending' || matchStatus === 'waiting')) {
            const totalDuration = 15000; // 15 seconds
            const updateInterval = 100; // Every 100 ms
            const increment = (100 / totalDuration) * updateInterval;

            timer = setInterval(() => {
                setTimerProgress((prev) => {
                    const newProgress = prev + increment;
                    if (newProgress >= 100) {
                        if (timer) clearInterval(timer);
                        setTimerProgress(100);
                        setIsAcceptDisabled(true);
                        setMatchStatus('timeout');
                        return 100;
                    }
                    return newProgress;
                });
            }, updateInterval);
        }

        return () => {
            if (timer) clearInterval(timer);
            if (!isOpen) {
                setTimerProgress(0);
                setIsAcceptDisabled(false);
            }
        };
    }, [isOpen, matchStatus]);

    useEffect(() => {
        if (matchStatus === 'accepted' || matchStatus === 'failed' || matchStatus === 'timeout') {
            setIsAcceptDisabled(true);
            setTimerProgress(100);
        }
    }, [matchStatus]);

    return (
        <div>
            {matchStatus === "accepted" && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-[999]">
                    <div className="flex flex-col items-center">
                        <Spinner size="large" />
                        <span className="mt-4 text-white text-lg">Redirecting to the collaborative space...</span>
                    </div>
                </div>
            )}
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent onInteractOutside={(event) => event.preventDefault()} className="sm:max-w-[425px] bg-gradient-to-br from-[#8A63D2] via-[#5932C3] to-[#2A185D] text-white border-none rounded-xl shadow-lg">
                    <DialogHeader>
                        <DialogTitle className='mt-10 flex justify-center'>
                            <h1 className='text-2xl'>Match Found!</h1>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 p-2">
                        {/* Partner Info */}
                        <div>
                            <p className="text-sm mb-2">Partner:</p>
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-secondary p-2">
                                    <UserIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold">{match.partner.userName}</h4>
                                </div>
                            </div>
                        </div>
                        {/* Question Info */}
                        <div>
                            <p className="text-sm mb-2">Question:</p>
                            <div>
                                <h4 className="text-lg font-semibold">{match.question.questionId}. {match.question.title}</h4>
                            </div>
                        </div>
                        {/* Difficulty */}
                        <div>
                            <h5 className="text-sm mb-2">Difficulty:</h5>
                            <div>
                                <h4 className="text-lg font-semibold">{match.question.difficulty}</h4>
                            </div>
                        </div>
                        {/* Language */}
                        <div>
                            <h5 className="text-sm mb-2">Language:</h5>
                            <div>
                                <h4 className="text-lg font-semibold">{match.language == 'Cpp' ? 'C++' : match.language}</h4>
                            </div>
                        </div>
                        {/* Categories */}
                        <div>
                            <h5 className="text-sm mb-2">Categories:</h5>
                            <div className="flex flex-wrap gap-2">
                                {match.question.categories.map((category, index) => (
                                    <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm">
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {matchStatus === 'waiting' && (
                            <div className="mt-4">
                                <Label className="text-yellow-500">Thank you! Waiting for your partner to accept...</Label>
                            </div>
                        )}
                        {matchStatus === 'accepted' && (
                            <div className="mt-4">
                                <Label className="text-green-500">Both users have accepted the match!</Label>
                            </div>
                        )}
                        {matchStatus === 'timeout' && (
                            <div className="mt-4">
                                <Label className="text-red-500">You or your partner did not accept in time.</Label>
                            </div>
                        )}
                        {matchStatus === 'failed' && (
                            <div className="mt-4">
                                <Label className="text-red-500">Your partner has canceled the match.</Label>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => handleAccept(match.matchId)}
                            disabled={isAcceptDisabled || matchStatus !== 'pending'}
                        >
                            Accept
                        </Button>
                    </DialogFooter>
                    <Progress className='bg-white' value={timerProgress} />
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default SuccessMatchInfo;

