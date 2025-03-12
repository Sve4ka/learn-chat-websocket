// UserProfile.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
//
// interface User {
//     username: string;
// }

const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const userId: string = JSON.parse(localStorage.getItem('userId') || "Guest");

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>User Profile</h2>
            <p>Welcome, <strong>{userId}</strong>!</p>
            <button
                onClick={() => navigate('/chat')}
                style={{ padding: '10px 20px', background: '#031777', color: 'white' }}
            >
                Enter Chat
            </button>
        </div>
    );
};

export default UserProfile;