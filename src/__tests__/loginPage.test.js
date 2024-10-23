import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginFormComponent from '../components/loginFormComponent';
import { supabase } from '../components/supabaseClient';
import { act } from 'react';
import '@testing-library/jest-dom/extend-expect';

// Mocking
jest.mock('../components/supabaseClient', () => ({
    supabase: {
        auth: {
            signInWithPassword: jest.fn(),
            signOut: jest.fn()
        },
        from: jest.fn((table) => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            then: jest.fn(),
            data: [],
            error: null
        }))
    },
}));

const createCanvasMock = () => {
    const mockCanvas = {
        getContext: jest.fn(() => ({
            fillRect: jest.fn(),
            drawImage: jest.fn(),
            createPattern: jest.fn(),
        })),
    };

    return mockCanvas;
};

global.HTMLCanvasElement.prototype.getContext = createCanvasMock().getContext;

// LoginForm Tests
describe('LoginFormComponent', () => {
    beforeEach(() => {
        act(() => {
            render(
                <BrowserRouter>
                    <LoginFormComponent />
                </BrowserRouter>
            );
        });
    });

    test('logs in and redirects on successful login', async () => {
        // Mock the successful login response
        supabase.auth.signInWithPassword.mockResolvedValueOnce({
            data: { user: {} },
            error: null,
        });

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText(/enter vit email/i), {
                target: { value: 'default123@gmail.com' },
            });
            fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
                target: { value: 'default123' },
            });
            fireEvent.click(screen.getByText(/sign in/i));
        });
        expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });
});