import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminPage from '../pages/adminPage';

describe('AdminPage', () => {
  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Courses section by default', () => {
    renderWithRouter(<AdminPage />);
    expect(screen.getByText(/BITS/i)).toBeInTheDocument();
  });

  test('switches to Account section', () => {
    renderWithRouter(<AdminPage />);
    fireEvent.click(screen.getByText(/Account/i));
    expect(screen.getByText(/Email/i)).toBeInTheDocument();
  });

  test('switches to Home section', () => {
    renderWithRouter(<AdminPage />);
    fireEvent.click(screen.getByText(/Home/i));
    expect(screen.getByText(/Home dashboard/i)).toBeInTheDocument();
  });
  
  test('switches to Classrooms section', () => {
    renderWithRouter(<AdminPage />);
    fireEvent.click(screen.getByText(/Classrooms/i));
    expect(screen.getByText(/Classrooms functionality/i)).toBeInTheDocument();
  });

  test('switches to Students section', () => {
    renderWithRouter(<AdminPage />);
    fireEvent.click(screen.getByText(/Students/i));
    expect(screen.getByText(/Students functionality/i)).toBeInTheDocument();
  });

  test('switches to Staff section', () => {
    renderWithRouter(<AdminPage />);
    fireEvent.click(screen.getByText(/Staff/i));
    expect(screen.getByText(/Staff functionality/i)).toBeInTheDocument();
  });

});
