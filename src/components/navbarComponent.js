import { Navbar, Nav, Container } from 'react-bootstrap';
import VITLogo from '../assets/VITLogo.png';
import '../styles/timetablePage.css'; // Update the CSS import

const NavbarComponent = () => {
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
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;