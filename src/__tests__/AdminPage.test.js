import React from 'react';
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'; // Wrap in router
import AdminPage from '../pages/adminPage';

describe('AdminPage', () => {
  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  // test
  test('renders Account section by default', () => {
    renderWithRouter(<AdminPage />);
    expect(screen.getByText(/Account Details/i)).toBeInTheDocument();
  });

  test('switches to Courses section', () => {
    renderWithRouter(<AdminPage />);
    fireEvent.click(screen.getByText(/Courses/i));
    expect(screen.getByText(/IT Project COMP30022/i)).toBeInTheDocument();
  });

  test('switches to User section', () => {
    renderWithRouter(<AdminPage />);
    fireEvent.click(screen.getByText(/User/i));
    expect(screen.getByText(/functionality coming soon/i)).toBeInTheDocument();
  });

  test('switches to Inbox section', () => {
    renderWithRouter(<AdminPage />);
    fireEvent.click(screen.getByText(/Inbox/i));
    expect(screen.getByText(/functionality coming soon/i)).toBeInTheDocument();
  });

  test('switches to History section', () => {
    renderWithRouter(<AdminPage />);
    fireEvent.click(screen.getByText(/History/i));
    expect(screen.getByText(/functionality coming soon/i)).toBeInTheDocument();
  });
});
