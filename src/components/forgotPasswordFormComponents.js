import '../styles/forgotPasswordFormComponent.css'
import { useState } from 'react';
import { supabase } from './supabaseClient';

const ForgotPasswordFormComponent = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: '/resetpassword' 
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Password reset email has been sent.');
        }
    };

    return (
        <div className="forgot-password-container">
            <div className='forgot-password-border'>
                <div className="forgot-password-form">
                    <form onSubmit={handlePasswordReset}>
                        <h1>Reset Your Password</h1>
                        <div className='recovery-requirements'>
                            Enter your email address and we will send you a link to reset your account.
                        </div>

                        <hr className='custom-line'/>

                        <label>Email Address: </label>
                        <input 
                            type="email" 
                            placeholder="Enter VIT Email Address" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />

                        <button type="submit" id="forgotResetButton">
                            Reset Password
                        </button>
                        {message && <p>{message}</p>}
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordFormComponent;
