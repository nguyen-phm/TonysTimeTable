import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import '../styles/timetablePage.css';

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

    // map to store colors for each class id
    const colorMap = {};
    const getClassColor = (id) => {
        if (!colorMap[id]) {
            // Generate colours based on  class id
            const hue = id * 137.508;
            colorMap[id] = `hsl(${hue % 400}, 70%, 85%)`; // Light pastelish colours
        return colorMap[id];
    };

    const renderTimeSlot = (hour, day) => {
        const classesInSlot = classes.filter(c => c.start_time === hour);
        if (classesInSlot.length === 0) return null;

        return classesInSlot.map((classItem, index) => {
            const durationInHours = classItem.duration_30mins / 2;
            const backgroundColor = getClassColor(classItem.id); // Use class id for color

            return (
                <div
                    key={index}
                    className={`class-slot ${classItem.is_online ? 'online-class' : ''}`}
                    style={{
                        height: `${durationInHours * 50 - 5}px `,
                        backgroundColor,
                    }}
                >
                    <div className="class-content">
                        <div className="class-type">{classItem.class_type}</div>
                        <div className="class-location">
                            {classItem.is_online ? 'Online' : `Room ${classItem.location_id}`}
                        </div>
                        <div className="class-time">
                            {`${hour}:00 - ${hour + durationInHours}:00`}
                        </div>
                    </div>
                </div>
            );
        });
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

    return (
        <div className="timetable-section">
            <button
                onClick={fetchTimetableData}
                disabled={isLoading}
                className="generate-button"
            >
                {isLoading ? 'Loading...' : 'Refresh Timetable'}
            </button>
            <div className="timetable">
                <div className="timetable-header">
                    <div className="time-header">Time</div>
                    {daysOfWeek.map((day) => (
                        <div key={day} className="day-header">{day}</div>
                    ))}
                </div>
                <div className="timetable-body">
                    {timeSlots.map((hour) => (
                        <div key={hour} className="time-row">
                            <div className="time-label">
                                {`${hour.toString().padStart(2, '0')}:00`}
                            </div>
                            {daysOfWeek.map((day) => (
                                <div key={`${day}-${hour}`} className="day-cell">
                                    {renderTimeSlot(hour, day)}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TimetableComponent;

