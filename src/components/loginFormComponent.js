import '../styles/loginFormComponent.css';
import VITLogo from '../assets/VITLogo.png'
import { Link } from "react-router-dom";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const LoginFormComponent = () => {
    const [email, setEmail] = useState(''); // stores email
    const [password, setPassword] = useState(''); // stores pass
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // prevents page reload on form submission

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message); // Set error message if login fails
        } else {
            // navigate('/timetable'); // Navigate to the success page after login
            navigate('/mfa');
        }
    };

    return (
        <div className="login-form-container">
            <form onSubmit={handleLogin} className="login-form">
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // update user state
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

                <div className="login-forgot-password">
                    <Link to="/forgot-password">
                        {"Forgot Password?"}
                    </Link>
                </div>

                <button type="submit">Login</button>

                <div className="login-sign-up">
                    <p>Don't have an account?</p>
                    <Link to="/sign-up">
                        {"Register"}
                    </Link>
                </div>

            </form>
            <div className="login-hero-image">
                <img src={VITLogo} alt="VIT Logo" />
            </div>
        </div>
    );
};

export default LoginFormComponent;
