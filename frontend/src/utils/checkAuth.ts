export interface AuthStatus {
    isAuthenticated: boolean;
}

const userServiceBaseUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

/**
 * Checks the authentication status (signed in or not) of the user by making a request to the backend.
 * @returns A promise that resolves to an object containing the authentication status.
 */
export const checkAuthStatus = async (): Promise<AuthStatus> => {
    try {
        const response = await fetch(`${userServiceBaseUrl}/api/users/status`, {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const data: AuthStatus = await response.json();
            return data;
        } else {
            return { isAuthenticated: false };
        }
    } catch (error) {
        console.error('Error checking authentication status:', error);
        return { isAuthenticated: false };
    }
};