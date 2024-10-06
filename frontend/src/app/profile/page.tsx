// frontend/src/app/profile/page.tsx

'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';

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
        <div className="flex flex-grow items-center justify-center bg-gray-100 p-4 w-screen">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="flex items-center mb-6">
                    <img
                        src="/assets/wumpus.jpg" // Keep the avatar as is
                        alt="User Avatar"
                        className="w-16 h-16 rounded-full mr-4 object-cover"
                    />
                    <div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-gray-600">{user.email}</p>
                        <p className="text-gray-600">Role: {isAdmin ? 'Admin' : 'User'}</p>
                    </div>
                </div>
                {/* Add more profile-related sections here */}
                <button
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
