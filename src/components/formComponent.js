import '../styles/formComponent.css';
import VITLogo from '../assets/VITLogo.png';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { supabase } from './supabaseClient';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://epzbzgpckybkcuujwiac.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwemJ6Z3Bja3lia2N1dWp3aWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1NDg4MjEsImV4cCI6MjA0MTEyNDgyMX0.0BXh3GnxhLhvoEdcbaRte9s8Z3VA2937pV0A6QXMMB0');

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
