// UserProfile.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const userId: string = JSON.parse(localStorage.getItem('userId') || "Guest");

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">User Profile</h2>

                <div className="profile-content">
                    <p className="welcome-text">
                        Welcome back, <span className="username">{userId}</span>
                    </p>

                    <button
                        onClick={() => navigate('/chat')}
                        className="button full-width"
                    >
                        Enter Chat Room
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;