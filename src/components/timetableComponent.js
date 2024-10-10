import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import '../styles/timetablePage.css';

const TimetableComponent = () => {
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch timetable data without generating new timetable
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
                    Subjects (code),
                    Locations (name),
                    staff_id,
                    Staff (name)
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

    // Generate new timetable and then fetch data
    const generateAndFetchTimetable = async () => {
        setIsLoading(true);
        try {
            // Generate the new timetable
            const { error } = await supabase.functions.invoke('generate-timetable');
            if (error) throw error;

            // Fetch the updated timetable data after generation
            await fetchTimetableData();
        } catch (error) {
            console.error('Error generating timetable:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch timetable when component loads
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
        const dbTime = dayIndex * 48 + halfHourIndex + 16;

        const classesInSlot = classes.filter(c => c.start_time === dbTime);
        if (classesInSlot.length === 0) return null;

        return classesInSlot.map((classItem, index) => {
            const subjectCode = classItem.Subjects?.code || 'N/A';
            const classLocation = classItem.Locations?.name || 'N/A';
            const backgroundColor = getClassColor(subjectCode);
            const staffName = classItem.Staff?.name;

            return (
                <div
                    key={index}
                    className={`class-slot ${classItem.is_online ? 'online-class' : ''}`}
                    style={{
                        height: `${classItem.duration_30mins * 25 - 3 * classItem.duration_30mins}px`,
                        backgroundColor,
                    }}
                >
                    <div className="class-content">
                        <div className="class-code">{subjectCode}</div>
                        <div className="class-type">
                            {`${classItem.class_type} - ${staffName}` || 'Class Type N/A'}
                        </div>
                        <div className="class-location">
                            {classItem.is_online ? 'Online' : `${classLocation}`}
                        </div>
                    </div>
                </div>
            );
        });
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = Array.from({ length: 25 }, (_, i) => i);

    const formatTimeLabel = (halfHourIndex) => {
        const hour = Math.floor(halfHourIndex / 2) + 8;
        const minute = halfHourIndex % 2 === 0 ? '00' : '30';
        return `${hour.toString().padStart(2, '0')}:${minute}`;
    };

    return (
        <div className="timetable-section">
            <button
                onClick={generateAndFetchTimetable}
                disabled={isLoading}
                className="generate-button"
            >
                {isLoading ? 'Loading...' : 'Generate New Timetable'}
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
