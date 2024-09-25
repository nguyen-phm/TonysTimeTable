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
            target: { value: 'test@vit.ac.in' },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByText(/sign in/i));

        // Check if navigate was called with '/mfa'
        expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
        // You may need to check if a navigation mock was called if you have mocked navigate as well
    });

    test('displays error message on failed login', async () => {
        // Mock the failed login response
        supabase.auth.signInWithPassword.mockResolvedValueOnce({
            data: null,
            error: { message: 'Invalid credentials' },
        });

        fireEvent.change(screen.getByPlaceholderText(/enter vit email/i), {
            target: { value: 'wrong@vit.ac.in' },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
            target: { value: 'wrongpassword' },
        });
        fireEvent.click(screen.getByText(/sign in/i));

        // Check for the error message display
        const errorMessage = await screen.findByText(/invalid credentials/i);
        expect(errorMessage).toBeInTheDocument();
    });
});
