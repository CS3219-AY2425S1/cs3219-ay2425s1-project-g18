export interface AuthStatus {
    isAuthenticated: boolean;
  }
  
  /**
   * Checks the authentication status (signed in or not) of the user by making a request to the backend.
   * @returns A promise that resolves to an object containing the authentication status.
   */
  export const checkAuthStatus = async (): Promise<AuthStatus> => {
    try {
      const response = await fetch('http://localhost:5000/api/users/status', {
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