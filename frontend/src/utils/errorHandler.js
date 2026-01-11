/**
 * Extracts user-friendly error messages from API errors
 */
export const getErrorMessage = (error) => {
    if (!error) return 'An unexpected error occurred';

    // Network error
    if (error.message === 'Network Error') {
        return 'Unable to connect to the server. Please check your internet connection.';
    }

    // API error response
    if (error.response) {
        const { data, status } = error.response;

        // Handle validation errors
        if (status === 422 && data.detail) {
            if (Array.isArray(data.detail)) {
                return data.detail.map((err) => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
            }
            return data.detail;
        }

        // Handle other errors
        if (data.detail) {
            return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        }

        // Status-based messages
        switch (status) {
            case 400:
                return 'Invalid request. Please check your input.';
            case 401:
                return 'Authentication failed. Please log in again.';
            case 403:
                return 'You do not have permission to perform this action.';
            case 404:
                return 'The requested resource was not found.';
            case 409:
                return 'A conflict occurred. The resource may already exist.';
            case 500:
                return 'Server error. Please try again later.';
            default:
                return `Error ${status}: ${data.message || 'An error occurred'}`;
        }
    }

    return error.message || 'An unexpected error occurred';
};



