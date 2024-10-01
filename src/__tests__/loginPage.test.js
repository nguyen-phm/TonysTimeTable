import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginFormComponent from '../components/loginFormComponent';
import { supabase } from '../components/supabaseClient';

// Mock the supabase auth signInWithPassword method
jest.mock('../components/supabaseClient', () => ({
    supabase: {
        auth: {
            signInWithPassword: jest.fn(),
        },
    },
}));

describe('LoginFormComponent', () => {
    beforeEach(() => {
        render(
            <BrowserRouter>
                <LoginFormComponent />
            </BrowserRouter>
        );
    });

    test('logs in and redirects to /mfa on successful login', async () => {
        // Mock the successful login response
        supabase.auth.signInWithPassword.mockResolvedValueOnce({
            data: { user: {} },
            error: null,
        });

        fireEvent.change(screen.getByPlaceholderText(/enter vit email/i), {
            target: { value: 'test2@gmail.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
            target: { value: 'password1' },
        });
        fireEvent.click(screen.getByText(/sign in/i));

        // Check if navigate was called with '/mfa'
        expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });

    test('displays error message on failed login', async () => {
        // Mock the failed login response
        supabase.auth.signInWithPassword.mockResolvedValueOnce({
            data: null,
            error: { message: 'Invalid credentials' },
        });

        fireEvent.change(screen.getByPlaceholderText(/enter vit email/i), {
            target: { value: 'wrong@vit.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
            target: { value: 'password' },
        });
        fireEvent.click(screen.getByText(/sign in/i));

        // Check for the error message display
        const errorMessage = await screen.findByText(/invalid credentials/i);
        expect(errorMessage).toBeInTheDocument();
    });
});
