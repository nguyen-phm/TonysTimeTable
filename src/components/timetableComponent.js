const TimetableComponent = () => {
    return (
        <div className="timetable">
            <div className="header">
                {/* Dummy space */}
                <div className="dummy-space"></div>
                {/* Day headers */}
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => (
                    <div key={index} className="day-header">{day}</div>
                ))}
            </div>
            <div className="main-content">
                <div className="times">
                    {/* Times on the left */}
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time, index) => (
                        <div key={index} className="time-slot">{time}</div>
                    ))}
                </div>
                <div className="days">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => (
                        <div key={index} className="day-column">
                            {/* Empty time slots for now */}
                            {[...Array(10)].map((_, idx) => (
                                <div key={idx} className="empty-slot"></div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export default TimetableComponent;