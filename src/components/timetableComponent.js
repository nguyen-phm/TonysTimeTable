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
                    subject_id,
                    is_online,
                    location_id,
                    start_time,
                    duration_30mins,
                    Subjects (code)
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

    const colorMap = {};
    const getClassColor = (subjectCode) => {
        if (!colorMap[subjectCode]) {
            const hue = subjectCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 137.508;
            colorMap[subjectCode] = `hsl(${hue % 360}, 70%, 85%)`;
        }
        return colorMap[subjectCode];
    };
    
    const renderTimeSlot = (halfHourIndex, dayIndex) => {
        // Convert visual time slot to database time
        // 8am = 16 half-hour slots from midnight
        const dbTime = dayIndex * 48 + halfHourIndex + 16;
        
        const classesInSlot = classes.filter(c => c.start_time === dbTime);
        if (classesInSlot.length === 0) return null;
    
        return classesInSlot.map((classItem, index) => {
            const subjectCode = classItem.Subjects?.code || 'N/A';
            const backgroundColor = getClassColor(subjectCode);
    
            return (
                <div
                    key={index}
                    className={`class-slot ${classItem.is_online ? 'online-class' : ''}`}
                    style={{
                        height: `${classItem.duration_30mins * 25 - 5}px`,
                        backgroundColor,
                    }}
                >
                    <div className="class-content">
                        <div className="class-code">{subjectCode}</div>
                        <div className="class-type">
                            {classItem.class_type || 'Class Type N/A'}
                        </div>
                        <div className="class-location">
                            {classItem.is_online ? 'Online' : `Room ${classItem.location_id}`}
                        </div>
                    </div>
                </div>
            );
        });
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    // Generate time slots from 8am (0) to 8pm (24 half-hour slots)
    const timeSlots = Array.from({ length: 25 }, (_, i) => i);

    const formatTimeLabel = (halfHourIndex) => {
        const hour = Math.floor(halfHourIndex / 2) + 8;
        const minute = halfHourIndex % 2 === 0 ? '00' : '30';
        return `${hour.toString().padStart(2, '0')}:${minute}`;
    };

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
                    {timeSlots.map((halfHourIndex) => (
                        <div key={halfHourIndex} className="time-row">
                            <div className="time-label">
                                {formatTimeLabel(halfHourIndex)}
                            </div>
                            {daysOfWeek.map((day, dayIndex) => (
                                <div key={`${day}-${halfHourIndex}`} className="day-cell">
                                    {renderTimeSlot(halfHourIndex, dayIndex)}
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