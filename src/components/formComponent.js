import '../styles/formComponent.css';
import VITLogo from '../assets/VITLogo.png';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FormComponent = () => {
    const [username, setUsername] = useState(''); // stores user
    const [password, setPassword] = useState(''); // stores pass
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault(); // no reloading page
        // Navigate to timetable page after login
        navigate('/timetable');
    };

    return (
        <div className="form">
            <form onSubmit={handleLogin}>
                <label>Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} // update user state
                    required
                />

                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} //upate pass state
                    required
                />

                <div className="checkbox-container">
                    <label htmlFor="remember-me"> Remember me</label>
                    <input type="checkbox" id="remember-me" />
                </div>

                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Forgot Password?</a>
                <button type="submit">Login</button>

                <div className="sign-up">
                    <p>Don't have an account?</p>
                    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Register</a>
                </div>
            </form>

            <div className="hero-image">
                <img src={VITLogo} alt="VIT Logo" />
            </div>
        </div>
    );
};

export default FormComponent;
