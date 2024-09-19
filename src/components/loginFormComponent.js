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
            navigate('/timetable'); // Navigate to the success page after login
        }
    };

    return (
        <div className="login-form-container">
                
            <div className="logo-border grid-cols-2 gap-1">
                <form onSubmit={handleLogin} className="login-form">
                    <h1>Login</h1>

                    <label>Email Address: </label>
                    <input
                        type="email"
                        value={email}
                        placeholder="Enter VIT Email"
                        onChange={(e) => setEmail(e.target.value)} // update user state
                        required
                    />

                    <label>Password: </label>
                    <input
                        type="password"
                        value={password}
                        placeholder="Enter Password"
                        onChange={(e) => setPassword(e.target.value)} //upate pass state
                        required
                    />

                    <div className="forgot-remember">
                        <div className="remember-container">
                            <input type="checkbox" id="remember-me" />
                            <label htmlFor="remember-me"> Remember me</label>
                        </div>

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

        </div>
    );
};

export default LoginFormComponent;
