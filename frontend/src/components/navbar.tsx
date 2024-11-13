'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import classnames from 'classnames'
import { CodeXml } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const userServiceBaseUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

const Navbar: React.FC = () => {
    const router = useRouter();
    const currentPath = usePathname();

    // Routes for those who are logged in
    const authRoutes = [
        { label: 'Explore', href: '/explore' },
        { label: 'Problems', href: '/problems' },
    ];
    // Routes for those who are not logged in
    const guestRoutes = [
        { label: 'How it works', href: '/' },
        { label: 'About Us', href: '/' },
        { label: 'Login', href: '/login' },
    ];

    const navigateToProfile = () => {
        router.push('/profile')
    }

    const { isAuthenticated, refreshAuth } = useAuth();

    const handleLogout = async () => {
        try {
            const response = await fetch(`${userServiceBaseUrl}/api/users/logout`, {
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

    return (
        <nav className="bg-violet-800 w-full p-2 top-0">
            <div className="mx-auto flex justify-between items-center 2xl:w-3/5">
                {/* peerprep logo */}
                <div className="text-white flex gap-4 text-xl ml-6 font-extrabold 2xl:text-2xl">
                    <Link className="flex gap-4 justify-center items-center" href="/">
                        <CodeXml className="w-7 h-7 2xl:w-8 2xl:h-8" />
                        peerprep.
                    </Link>
                </div>

                {/* nav links */}
                <ul className="flex justify-end w-4/5 text-sm 2xl:text-md">
                    {(isAuthenticated ? authRoutes : guestRoutes).map((route) => (
                        <Link
                            key={route.label}
                            className={classnames({
                                'font-bold': route.href === currentPath,
                                'font-medium': route.href !== currentPath,
                                'hover:text-zinc-400 text-white transition-colors mx-4':
                                    true,
                            })}
                            href={route.href}
                        >
                            {route.label}
                        </Link>
                    ))}
                </ul>

                <div className="flex w-auto justify-between items-center">
                    {isAuthenticated ? (
                        <>
                            <button className="font-black bg-yellow-500 h-8 px-4 text-sm 2xl:text-md rounded-lg mx-4">
                                Practice
                                {/* button to call API and brings out matching component*/}
                            </button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="w-10 h-10 rounded-full bg-white mx-4 cursor-pointer hover:bg-gray-200 transition-colors"></div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem className="cursor-pointer" onSelect={navigateToProfile}>
                                            Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer" onSelect={navigateToProfile}>
                                            History
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer" onSelect={handleLogout}>
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Link href="/signup">
                                <div className="font-black bg-yellow-500 h-8 px-3 text-sm 2xl:text-md rounded-lg mx-4 whitespace-nowrap flex items-center">
                                    Sign Up Now!
                                </div>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
