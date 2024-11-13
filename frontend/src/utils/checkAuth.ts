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

export const getAccessToken = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const expiryTime = localStorage.getItem('expiryTime');
    const currTime = new Date().getTime();

    if (expiryTime && currTime > parseInt(expiryTime)) {
        await refreshAccessToken();
        return null;
    }
    return accessToken;
}

export const refreshAccessToken = async () => {
    // cookie is automatically attached in the request
    const userServiceBaseUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
    fetch(`${userServiceBaseUrl}/api/users/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            const expiryTime = new Date().getTime() + 5000;  // Set the new expiry time (5 seconds for testing)
            localStorage.setItem('expiryTime', expiryTime.toString());
        }
    })
    .catch((error) => {
        console.error('Error refreshing token:', error);
    });
}
