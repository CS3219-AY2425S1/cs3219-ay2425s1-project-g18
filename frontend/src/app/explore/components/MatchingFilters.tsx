"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { MultiSelect } from "@/components/multi-select";
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/spinner'
import SuccessMatchInfo from './SuccessMatchInfo';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/authContext';
import { useToast } from '@/hooks/use-toast';
import { Hourglass } from 'lucide-react';

const MatchingFilters = () => {
    const socketRef = useRef<Socket | null>(null);
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast()
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isMatchFound, setIsMatchFound] = useState(false);
    const [matchPartner, setMatchPartner] = useState<any | null>(null);

    const languagesList = [
        { label: "Python", value: "Python" },
        { label: "JavaScript", value: "JavaScript" },
        { label: "Java", value: "Java" },
        { label: "C++", value: "C++" },
        { label: "C#", value: "C#" },
        { label: "Ruby", value: "Ruby" },
        { label: "Go", value: "Go" },
        { label: "Kotlin", value: "Kotlin" },
        { label: "Swift", value: "Swift" },
        { label: "TypeScript", value: "TypeScript" },
    ]
    const categoriesList = [
        { label: "Strings", value: "Strings" },
        { label: "Algorithms", value: "Algorithms" },
        { label: "Data Structures", value: "Data Structures" },
        { label: "Bit Manipulation", value: "Bit Manipulation" },
        { label: "Recursion", value: "Recursion" },
        { label: "Databases", value: "Databases" },
        { label: "Arrays", value: "Arrays" },
        { label: "Brainteaser", value: "Brainteaser" },
    ]
    const difficultyList = [
        { label: "Easy", value: "Easy" },
        { label: "Medium", value: "Medium" },
        { label: "Hard", value: "Hard" },
    ]
    const questionsList = [
        { label: "Question 1", value: "Question 1" },
        { label: "Question 2", value: "Question 2" },
        { label: "Question 3", value: "Question 3" },
        { label: "Question 4", value: "Question 4" },
        { label: "Question 5", value: "Question 5" },
        { label: "Question 6", value: "Question 6" },
        { label: "Question 7", value: "Question 7" },
        { label: "Question 8", value: "Question 8" },
        { label: "Question 9", value: "Question 9" },
        { label: "Question 10", value: "Question 10" },
    ]

    // Setup socket connection and event handlers
    useEffect(() => {
        socketRef.current = io('http://localhost:5002');

        const { current: socket } = socketRef;

        socket.on('connect', () => {
            console.log(`Connected with socket ID: ${socket.id}`);
        });

        socket.on('matchFound', (partner: any) => {
            console.log(`Match found:`, partner);
            setMatchPartner(partner);
            setIsMatchFound(true);
            setIsSearching(false);
        });

        socket.on('noMatchFound', (data: any) => {
            console.log(`No match found:`, data.message);
            setIsSearching(false);
            toast({
                title: "Matchmaking timeout",
                description: "We could not find a match for you in time. Try again!",
            })
        });

        socket.on('matchCanceled', (data: any) => {
            console.log(`Match canceled:`, data.message);
            toast({
                title: "Match Canceled",
                description: data.message,
            })
            setIsSearching(false);
        });

        return () => {
            socket.off('connect');
            socket.off('matchFound');
            socket.off('noMatchFound');
            socket.off('matchCanceled');
            socket.disconnect();
        }
    }, [user]);

    const onSearchPress = () => {
        if (!isSearching) {
            setIsSearching(true);
            const matchRequest = {
                userId: user?.id,
                userName: user?.name,
                difficulty: selectedDifficulty,
                categories: selectedCategories,
            }
            socketRef.current?.emit('login', user?.id);
            socketRef.current?.emit('requestMatch', matchRequest);
            console.log('Sent match request', matchRequest);
        } else {
            setIsSearching(false);
            socketRef.current?.emit('cancelMatch', user?.id);
            console.log('Sent cancel match for user', user?.id);
        }
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSearching) {
            interval = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [isSearching])

    return (
        <div className="flex flex-col p-8 gap-4">
            {isMatchFound && <SuccessMatchInfo isOpen={isMatchFound} match={matchPartner} onOpenChange={setIsMatchFound} handleAccept={() => { }} />}
            <h1 className="text-2xl font-bold self-start text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-text-first)] via-[var(--gradient-text-second)] to-[var(--gradient-text-third)]">Look for peers to code now!</h1>
            <div className='flex gap-6'>
                {/* <div className='w-1/3'>
                    <Label>Language</Label>
                    <MultiSelect
                        options={languagesList}
                        onValueChange={setSelectedLanguages}
                        defaultValue={selectedLanguages}
                        placeholder="Select language..."
                        maxCount={3}
                        disabled={isSearching}
                    />
                </div> */}
                <div className='w-1/3'>
                    <Label>Difficulty</Label>
                    <Select disabled={isSearching} onValueChange={(value: string) => setSelectedDifficulty(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            {difficultyList.map((difficulty) => (
                                <SelectItem key={difficulty.value} value={difficulty.value}>
                                    {difficulty.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className='w-2/3'>
                    <Label>Categories</Label>
                    <MultiSelect
                        options={categoriesList}
                        onValueChange={setSelectedCategories}
                        defaultValue={selectedCategories}
                        placeholder="Select categories..."
                        maxCount={3}
                        disabled={isSearching}
                    />
                </div>
            </div>
            {/* <div>
                <Label>Selected Questions</Label>
                <MultiSelect
                    options={questionsList}
                    onValueChange={setSelectedQuestions}
                    defaultValue={selectedQuestions}
                    placeholder="Select categories..."
                    maxCount={3}
                    disabled={isSearching}
                />
            </div> */}
            <div className="flex justify-end w-full space-x-2 mt-4">
                <Button variant={isSearching ? "destructive" : "default"} onClick={onSearchPress}>
                    {isSearching ? (
                        <>
                            <Spinner size='small' className="size-small mr-2" />
                            <span>{formatTime(elapsedTime)} - Cancel</span>
                        </>
                    ) : (
                        "Match Now"
                    )}
                </Button>
            </div>
        </div>
    )
}

export default MatchingFilters
