// frontend/src/app/profile/page.tsx

'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator";
import { difficulties } from '@/utils/constant';

const ProfilePage: React.FC = () => {
    const router = useRouter();
    const { isAuthenticated, user, isAdmin, refreshAuth } = useAuth();

    const handleLogout = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/logout`, {
                method: 'POST',
                credentials: 'include', // Include cookies
            });

            if (response.ok) {
                // refresh authentication status
                await refreshAuth();
                // redirect to home page
                router.push('/');
            } else {
                console.error('Failed to log out.');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };


    if (!user) {
        // Optionally, show a loading state while fetching user data
        return (
            <div className="flex flex-grow items-center justify-center min-h-screen">
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-grow items-center justify-center bg-gray-100 w-screen">
            <div className="flex-col h-full py-12 w-5/6 2xl:w-3/5 space-y-8">
                <div className="flex flex-grow gap-8">
                    <div className="min-w-fit w-1/4 p-4 bg-white rounded-lg space-y-4">
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
                        {/* <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                            onClick={handleLogout}
                        >
                            Logout
                        </button> */}
                        <Separator />
                        {/* Problems Statistics */}
                        <div className="flex flex-col gap-2">
                            <div className='flex'>
                                <h2 className="text-sm font-bold">Problems Solved</h2>
                                <p className="text-sm ml-auto">0</p>
                            </div>
                            <div className='grid grid-cols-3 gap-2'>
                                {difficulties.map((difficulty) => (
                                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-sm">
                                        <span style={{ color: `var(--color-${difficulty}-bg)` }} className={`text-xs font-semibold`}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                                        <span className="text-xs">count</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Separator />
                        {/* Categories Statistics */}
                        <div className="flex flex-col gap-2">
                            <h2 className="text-sm font-bold">Skills</h2>
                            <div className='flex'>
                                {/* Add content here */}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg">
                        History
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
