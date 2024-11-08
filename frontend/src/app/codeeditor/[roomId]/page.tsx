'use client';
import React, { useEffect, useState, PropsWithChildren  } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import CollaborativeCodingPage from '../components/CollaborativeSpace';
import axios from 'axios';
import { LiveblocksProvider } from "@liveblocks/react";
import { Question } from '../models/types'

const CollabRoomPage = ({ params }: {
    params: { roomId: string }
}) => {
    const roomId = String(params.roomId);
    const { user, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isValidRoom, setIsValidRoom] = useState(false);
    const [collabQuestion, setCollabQuestion] = useState<Question | undefined>(undefined);
    const [collabLanguage, setCollabLanguage] = useState<string | undefined>(undefined);
    const [matchId, setMatchId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const verifyRoom = async () => {
            if (!roomId || !user) return;

            try {
                const response = await axios.post('http://localhost:5003/verify-room', {
                    roomId,
                    userId: user.id,
                });

                if (response.status === 200) {
                    setIsValidRoom(true);
                    setCollabQuestion(response.data.question)
                    setCollabLanguage(response.data.language)
                    setMatchId(response.data.matchId)
                }
            } catch (error: any) {
                console.error('Error verifying room:', error.response?.data?.message || error.message);
                setIsValidRoom(false);
            } finally {
                setIsLoading(false);
            }
        };

        verifyRoom();
    }, [roomId, user]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isValidRoom) {
        return <div>Oops! This room either does not exist or you are not authorized to access this room.</div>;
    }

    if (!collabLanguage || !collabQuestion
    ) {
        return <div>Oops! Something seems to have gone wrong. Please reload or try finding another match.</div>;
    }

    return (
        <div className='flex flex-col flex-grow h-[calc(100vh-4rem)]'>
            <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
                <CollaborativeCodingPage
                    initialCode='import math'
                    language={collabLanguage}
                    theme="vs-dark"
                    roomId={roomId}
                    userName={String(user?.name)}
                    question={collabQuestion}
                    matchId={matchId}
                />
            </LiveblocksProvider>
            {/* DO NOT REMOVE THIS PLEASE */} <span className='absolute left-0 top-0 opacity-0 select-none'>do not remove this {roomId}</span>
        </div>
    );
};

export default CollabRoomPage;
