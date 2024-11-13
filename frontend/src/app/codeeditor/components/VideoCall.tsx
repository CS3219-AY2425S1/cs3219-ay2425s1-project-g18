"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Camera,
    CameraOff,
    Mic,
    MicOff,
    RefreshCw,
    UserCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/authContext';

interface VideoCallProps {
    userName: string;
    roomId: string;
}

interface PeerConnection {
    connection: RTCPeerConnection;
    username: string;
    stream?: MediaStream;
}

const VideoCall: React.FC<VideoCallProps> = ({ userName, roomId }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [connections, setConnections] = useState(new Set<string>());
    const [isConnectedToServer, setIsConnectedToServer] = useState(false);
    const [peerStreams, setPeerStreams] = useState<Map<string, MediaStream>>(new Map());
    const [hasAudioDevice, setHasAudioDevice] = useState(false);
    const [hasVideoDevice, setHasVideoDevice] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const { toast } = useToast();
    const { user } = useAuth();

    const myVideo = useRef<HTMLVideoElement>(null);
    const peerConnections = useRef<Record<string, PeerConnection>>({});

    const initializeMedia = useCallback(async () => {
        try {
            // Check available devices first
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasVideo = devices.some(device => device.kind === 'videoinput');
            const hasAudio = devices.some(device => device.kind === 'audioinput');

            setHasVideoDevice(hasVideo);
            setHasAudioDevice(hasAudio);

            // Try to get whatever media is available
            if (!hasVideo && !hasAudio) {
                console.log('No media devices available');
                setIsInitialized(true);
                return null;
            }

            const constraints = {
                video: hasVideo ? true : false,
                audio: hasAudio ? true : false
            };

            const currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Got user media stream:', constraints);

            // Set initial enabled states based on what we got
            setIsVideoEnabled(hasVideo);
            setIsAudioEnabled(hasAudio);

            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }

            setIsInitialized(true);
            return currentStream;
        } catch (error) {
            console.error('Media error:', error);
            setIsInitialized(true);
            return null;
        }
    }, []);

    // Initialize socket and media
    useEffect(() => {
        let currentStream: MediaStream | null = null;

        const init = async () => {
            // First get media stream
            currentStream = await initializeMedia();
            if (currentStream) {
                setStream(currentStream);
            }

            // Then connect socket
            const wsProtocol = process.env.NEXT_PUBLIC_WEBSOCKET_PROTOCOL;
            const collabBaseUrl = process.env.NEXT_PUBLIC_CODE_COLLAB_URL?.replace(/^https?:\/\//, '');
            const videoSocketUrl = `${wsProtocol}://${collabBaseUrl}`;

            console.log('Connecting to socket URL:', videoSocketUrl);

            const newSocket = io(videoSocketUrl, {
                path: '/video-call',
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            setSocket(newSocket);

            return () => {
                console.log('Cleaning up...');
                if (currentStream) {
                    currentStream.getTracks().forEach(track => track.stop());
                }
                Object.values(peerConnections.current).forEach(({ connection }) => {
                    connection.close();
                });
                setPeerStreams(new Map());
                setConnections(new Set());
                newSocket.close();
            };
        };

        init();
    }, [initializeMedia]);

    const createPeerConnection = useCallback(async (peerId: string, username: string) => {
        console.log(`Creating peer connection for ${username} (${peerId})`);

        // Clean up any existing connection for this user
        for (const [existingPeerId, connection] of Object.entries(peerConnections.current)) {
            if (connection.username === username && existingPeerId !== peerId) {
                console.log(`Cleaning up existing connection for ${username}`);
                connection.connection.close();
                delete peerConnections.current[existingPeerId];
                setPeerStreams(prev => {
                    const newStreams = new Map(prev);
                    newStreams.delete(existingPeerId);
                    return newStreams;
                });
                setConnections(prev => {
                    const newConnections = new Set(prev);
                    newConnections.delete(existingPeerId);
                    return newConnections;
                });
            }
        }

        if (peerConnections.current[peerId]) {
            console.log(`Connection already exists for ${username} with peerId ${peerId}, cleaning up`);
            peerConnections.current[peerId].connection.close();
            delete peerConnections.current[peerId];
            setPeerStreams(prev => {
                const newStreams = new Map(prev);
                newStreams.delete(peerId);
                return newStreams;
            });
        }

        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        };

        const peerConnection = new RTCPeerConnection(configuration);

        // Handle incoming streams
        peerConnection.ontrack = (event) => {
            console.log(`Received tracks from ${username}:`, event.streams);
            const [remoteStream] = event.streams;

            setPeerStreams(prev => {
                const newStreams = new Map(prev);
                for (const [existingPeerId, _] of newStreams) {
                    if (peerConnections.current[existingPeerId]?.username === username && existingPeerId !== peerId) {
                        newStreams.delete(existingPeerId);
                    }
                }
                newStreams.set(peerId, remoteStream);
                return newStreams;
            });

            setConnections(prev => new Set([...prev].filter(id =>
                peerConnections.current[id]?.username !== username || id === peerId
            )).add(peerId));
        };

        // Add local stream tracks if available
        if (stream) {
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });
        }

        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    peerId,
                    roomId
                });
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            console.log(`ICE connection state for ${username}:`, peerConnection.iceConnectionState);
            if (peerConnection.iceConnectionState === 'failed') {
                peerConnection.restartIce();
            }
        };

        peerConnections.current[peerId] = { connection: peerConnection, username };
        return peerConnections.current[peerId];
    }, [stream, socket, roomId]);

    // Handle socket events
    useEffect(() => {
        if (!socket || !isInitialized) return; // Wait for initialization instead of stream

        socket.on('connect', async () => {
            console.log('Connected to signaling server with socket ID:', socket.id);
            setIsConnectedToServer(true);
            // Join room immediately after connection
            console.log('Joining room:', roomId, 'as user:', userName);
            socket.emit('join-room', { roomId, username: userName, userId: user?.id || '' });
        });

        socket.on('existing-users', async (users) => {
            console.log('Received existing users:', users);
            for (const { peerId, username } of users) {
                try {
                    console.log(`Setting up connection for existing user: ${username}`);
                    const peerConnection = await createPeerConnection(peerId, username);

                    // Create and send offer
                    const offer = await peerConnection.connection.createOffer({
                        offerToReceiveAudio: true,
                        offerToReceiveVideo: true,
                    });
                    await peerConnection.connection.setLocalDescription(offer);
                    socket.emit('offer', { offer, peerId, roomId, username: userName });
                    console.log(`Sent offer to ${username}`);
                } catch (error) {
                    console.error(`Error setting up connection with ${username}:`, error);
                }
            }
        });

        socket.on('user-joined', async ({ peerId, username }) => {
            console.log('New user joined:', username);
            await createPeerConnection(peerId, username);
        });

        socket.on('user-disconnected', async ({ socketId, disconnectedUser }) => {
            console.log(`User disconnected: ${disconnectedUser?.username}`);
            for (const [peerId, connection] of Object.entries(peerConnections.current)) {
                if (connection.username === disconnectedUser?.username || peerId === socketId) {
                    connection.connection.close();
                    delete peerConnections.current[peerId];
                    setPeerStreams(prev => {
                        const newStreams = new Map(prev);
                        newStreams.delete(peerId);
                        return newStreams;
                    });
                    setConnections(prev => {
                        const newConnections = new Set(prev);
                        newConnections.delete(peerId);
                        return newConnections;
                    });
                }
            }
        });

        socket.on('offer', async ({ offer, peerId, username }) => {
            try {
                console.log('Received offer from:', username);
                const peerConnection = await createPeerConnection(peerId, username);
                await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(offer));

                // Create and send answer
                const answer = await peerConnection.connection.createAnswer();
                await peerConnection.connection.setLocalDescription(answer);
                socket.emit('answer', { answer, peerId, roomId });
                console.log(`Sent answer to ${username}`);
            } catch (error) {
                console.error('Error handling offer:', error);
            }
        });

        socket.on('answer', async ({ answer, peerId }) => {
            try {
                console.log('Received answer from peer:', peerId);
                const peerConnection = peerConnections.current[peerId];
                if (peerConnection && peerConnection.connection.signalingState !== 'stable') {
                    await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(answer));
                    console.log('Successfully set remote description from answer');
                }
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        });

        socket.on('ice-candidate', async ({ candidate, peerId }) => {
            try {
                const peerConnection = peerConnections.current[peerId];
                if (peerConnection && peerConnection.connection.remoteDescription) {
                    await peerConnection.connection.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log('Successfully added ICE candidate');
                }
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        });

        return () => {
            socket.off('connect');
            socket.off('existing-users');
            socket.off('user-disconnected');
            socket.off('user-joined');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
        };
    }, [socket, isInitialized, createPeerConnection, roomId, userName, user?.id]);

    return (
        <Card className='h-full flex flex-col flex-grow'>
            <CardHeader className="p-2 flex-shrink-0">
                <CardTitle className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <span>Video Call ({connections.size + 1} connected)</span>
                        <div
                            className={`w-2 h-2 rounded-full ${isConnectedToServer ? 'bg-green-500' : 'bg-red-500'}`}
                            title={isConnectedToServer ? 'Connected' : 'Disconnected'}
                        />
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex-grow flex flex-col">
                <div className='grid grid-cols-2 gap-2 flex-grow overflow-auto'>
                    <div className="relative rounded-lg overflow-hidden bg-secondary aspect-video">
                        {stream && isVideoEnabled ? (
                            <video
                                ref={myVideo}
                                muted
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary">
                                <UserCircle2 className="w-16 h-16 text-muted-foreground" />
                            </div>
                        )}
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white px-1 py-0.5 rounded text-xs">
                            {userName} (You)
                        </div>
                    </div>

                    {Array.from(peerStreams.entries()).map(([peerId, peerStream]) => (
                        <div key={peerId} className="relative rounded-lg overflow-hidden bg-secondary aspect-video">
                            {peerStream.getVideoTracks().length > 0 ? (
                                <video
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                    ref={el => {
                                        if (el) el.srcObject = peerStream;
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-secondary">
                                    <UserCircle2 className="w-16 h-16 text-muted-foreground" />
                                </div>
                            )}
                            <div className="absolute bottom-1 left-1 bg-black/50 text-white px-1 py-0.5 rounded text-xs">
                                {peerConnections.current[peerId]?.username || `User ${peerId}`}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-2 mt-2 flex-shrink-0">
                    {hasAudioDevice && (
                        <Button
                            variant={isAudioEnabled ? "outline" : "destructive"}
                            size="sm"
                            onClick={() => {
                                if (stream) {
                                    stream.getAudioTracks().forEach(track => {
                                        track.enabled = !isAudioEnabled;
                                    });
                                    setIsAudioEnabled(!isAudioEnabled);
                                    toast({
                                        title: isAudioEnabled ? "Microphone Muted" : "Microphone Unmuted",
                                    });
                                }
                            }}
                        >
                            {isAudioEnabled ?
                                <Mic className="h-3 w-3" /> :
                                <MicOff className="h-3 w-3" />
                            }
                        </Button>
                    )}
                    {hasVideoDevice && (
                        <Button
                            variant={isVideoEnabled ? "outline" : "destructive"}
                            size="sm"
                            onClick={() => {
                                if (stream) {
                                    stream.getVideoTracks().forEach(track => {
                                        track.enabled = !isVideoEnabled;
                                    });
                                    setIsVideoEnabled(!isVideoEnabled);
                                    toast({
                                        title: isVideoEnabled ? "Camera Turned Off" : "Camera Turned On",
                                    });
                                }
                            }}
                        >
                            {isVideoEnabled ?
                                <Camera className="h-3 w-3" /> :
                                <CameraOff className="h-3 w-3" />
                            }
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default VideoCall;