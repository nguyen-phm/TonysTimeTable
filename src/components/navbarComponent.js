import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import VITLogo from '../assets/VITLogo.png';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import '../styles/timetablePage.css'; 

const NavbarComponent = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
  
            navigate('/'); 
        }
    };

    return (
        <Navbar expand="lg" className="navbar" fixed="top">
            <Container>
                <Navbar.Brand href="#">
                    <div className="logo-container">
                        <img
                            src={VITLogo}
                            alt="VIT Logo"
                            className="logo"
                        />
                        <div className="student-label">Student</div>
                    </div>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Enquiry Page</Nav.Link>
                        <Nav.Link href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">View Enrollment</Nav.Link>
                        <Button variant="outline-light" onClick={handleSignOut}>Sign Out</Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;