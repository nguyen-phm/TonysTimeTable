import '../styles/formComponent.css';
import VITLogo from '../assets/VITLogo.png';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const FormComponent = () => {
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
            navigate('/success'); // Navigate to the success page after login
        }
    };

    return (

        <div className="form">
            <form onSubmit={handleLogin}>
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
