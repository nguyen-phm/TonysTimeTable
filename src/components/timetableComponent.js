import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const TimetableComponent = () => {
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTimetableData = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('Classes')
                .select(`
                    id,
                    class_type,
                    is_online,
                    location_id,
                    start_time,
                    duration_30mins
                `)
                .order('start_time');

            if (error) throw error;
            
            console.log("Fetched data: ", data);  // Log fetched data to ensure it's coming through
            setClasses(data || []);

        } catch (error) {
            console.error('Error fetching timetable data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTimetableData();
    }, []);

    const renderTimeSlot = (hour) => {
        console.log("Rendering time slot for hour:", hour);

        classes.forEach((classItem) => {
            console.log(`Class start_time: ${classItem.start_time}`);
        });

        const classesInSlot = classes.filter(c => c.start_time === hour);

        console.log(`Classes for ${hour}:00`, classesInSlot);

        if (classesInSlot.length === 0) return <div className="empty-slot" >Empty</div>;

        return classesInSlot.map((classItem, index) => {
            const durationInHours = classItem.duration_30mins / 2;


            return (
                <div 
                    key={index} 
                    className={`class-slot ${classItem.is_online ? 'online-class' : ''}`}
                    style={{
                        height: `${durationInHours * 60}px`,
                        backgroundColor: 'lightblue',
                        border: '1px solid black',
                        margin: '5px'
                    }}
                >
                    <div className="class-type">
                        {classItem.class_type}
                    </div>
                    <div className="class-details">
                        {classItem.is_online ? 'Online' : `Location: ${classItem.location_id}`}
                    </div>
                </div>
            );
        });
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return (
        <div className="timetable-section">
            <button 
                onClick={fetchTimetableData}
                disabled={isLoading}
                className="generate-button"
            >
                {isLoading ? 'Loading...' : 'Generate Timetable'}
            </button>

            <div className="timetable">
                <div className="header">
                    <div className="dummy-space"></div>
                    {daysOfWeek.map((day) => (
                        <div key={day} className="day-header">{day}</div>
                    ))}
                </div>
                <div className="main-content">
                    <div className="times">
                        {Array.from({ length: 10 }, (_, i) => i + 8).map((hour) => (
                            <div key={hour} className="time-slot">
                                {`${hour.toString().padStart(2, '0')}:00`}
                            </div>
                        ))}
                    </div>
                    <div className="days">
                        {daysOfWeek.map((day) => (
                            <div key={day} className="day-column">
                                {Array.from({ length: 10 }, (_, i) => i + 8).map((hour) => (
                                    <div key={hour} className="hour-slot">
                                        {renderTimeSlot(hour)} {/* Classes only rendered for Monday nvm this isn't working */}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimetableComponent;
