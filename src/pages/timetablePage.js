import NavbarComponent from '../components/navbarComponent';
import SidebarComponent from '../components/sidebarComponent';
import TimetableComponent from '../components/timetableComponent';
import '../styles/timetablePage.css';

const TimetablePage = () => {
    // Dummy data
    const courses = [
        { id: 1, name: 'IT Project COMP30022', details: 'Room PAR 104-101, Nguyen Pham' },
        { id: 2, name: 'Models of Computation COMP30026', details: 'Room PAR 104-G01, Forgot his name' },
        { id: 3, name: 'Blahblah BLAH10001', details: 'Room blah, Dr. Blah' },
        { id: 4, name: 'Blah BLAH10002', details: 'Room blah, Blah B. Blah' },
    ];

    return (
        <div className="timetable-container">
            <NavbarComponent />
            <div className="main-layout">
                <SidebarComponent courses={courses} />
                <TimetableComponent />
            </div>
        </div>
    );
};

export default TimetablePage;