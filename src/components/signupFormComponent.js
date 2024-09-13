import '../styles/signupFormComponent.css';
import { useState } from 'react';
import { supabase } from './supabaseClient';

const SignupFormComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        
        // Check if passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        // Call Supabase signUp function
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccessMessage("Signup successful! Check your email for verification.");
            setError(null); // Clear error if signup is successful
        }
    };

    return (
        <div className="signup-form-container">
            <p className="signup-institute">
                Victoria Institute of Technology
            </p>

            <div className="signup-form">
                <form>
                    <label>Email:</label>
                    <input type="text" required />

                    <label>Password:</label>
                    <input type="password" required />

                    <label>Confirm Password:</label>
                    <input type="password" required />

                    <ul className="">
                        <li>Password must contain only numbers and letters.</li>
                        <li>Password must contain atleast one symbol</li>
                        <li>Password must be atleast 6 characters long</li>
                    </ul>
    
                    <p className="signup-agreement">
                        By clicking Join now, you agree to VIT's User agreement, Privacy Policy, and Cookie Policy
                    </p>

                    <button type="submit" className="signup-button">
                        <label htmlFor="join-now">Join Now</label>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupFormComponent;
