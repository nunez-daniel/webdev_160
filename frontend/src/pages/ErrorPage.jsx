import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
    // Hook to programmatically navigate the user
    const navigate = useNavigate(); 
    
    const handleLoginRedirect = () => {
        // Navigates the user to the login page
        navigate('/'); 
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>401 Unauthorized Access</h1>
            <p style={styles.message}>
                Access to this resource is restricted. 
                Your session may have expired, or you may not have the necessary permissions.
            </p>
            <button 
                style={styles.button}
                onClick={handleLoginRedirect}
            >
                Go to Login Page
            </button>
            <p style={styles.smallText}>
                If you believe you should have access, please contact support.
            </p>
        </div>
    );
};

// Basic inline styling for a clean look
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
    },
    title: {
        fontSize: '2.5em',
        color: '#CC0000', // Red for error
        marginBottom: '10px',
    },
    message: {
        fontSize: '1.1em',
        textAlign: 'center',
        maxWidth: '400px',
        marginBottom: '20px',
    },
    button: {
        padding: '10px 20px',
        fontSize: '1em',
        color: 'white',
        backgroundColor: '#16A34A',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        marginBottom: '15px',
    },
    smallText: {
        fontSize: '0.8em',
        color: '#666',
    }
};

export default ErrorPage;