import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import '../styles/timetablePage.css';
import GenerateTimetablePopup from './popups/generateTimetablePopup';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TimetableComponent = () => {
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const timetableRef = useRef(null);

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

    const generateAndFetchTimetable = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('generate-timetable');
            if (error) throw error;
            await fetchTimetableData();
        } catch (error) {
            console.error('Error generating timetable:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTimetableData();
    }, []);

    const handleConfirmGenerate = () => {
        generateAndFetchTimetable();
        setShowPopup(false);
    };

    const handleGenerateClick = () => {
        setShowPopup(true);
    };

    // Export as CSV
    const handleExportCSV = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('export-timetable');
            if (error) throw error;

            const blob = new Blob([data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'timetable.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    };

// Export as PDF
const handleExportPDF = async () => {
    if (timetableRef.current) {
        const timetableClone = timetableRef.current.cloneNode(true);
        document.body.appendChild(timetableClone);
        timetableClone.classList.add('pdf-export');

        // Force recalculation of class slot heights
        const classSlots = timetableClone.getElementsByClassName('class-slot');
        Array.from(classSlots).forEach(slot => {
            const duration = parseInt(slot.style.height);
            slot.style.height = `${Math.max(duration, 60)}px`; // Minimum 60px height
        });

        try {
            const canvas = await html2canvas(timetableClone, {
                scale: 2, // resolution
                useCORS: true,
                logging: false,
                windowWidth: timetableClone.offsetWidth, //  use the actual tt width
                windowHeight: timetableClone.scrollHeight, // and the height
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.body.firstChild;
                    clonedElement.style.transform = 'scale(1)';
                    clonedElement.style.transformOrigin = 'top left';
                }
            });

            const imgData = canvas.toDataURL('image/png');
                        
            const pdfWidth = timetableClone.offsetWidth * 0.75;
            const pdfHeight = timetableClone.scrollHeight * 0.75;
            
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'pt',
                format: [pdfWidth, pdfHeight] // Custom dimensions
            });
            
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = (pdfHeight - imgHeight * ratio) / 2; // Center vertically

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save('timetable.pdf');
        } finally {
            document.body.removeChild(timetableClone);
        }
    }
};

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
            <div className="button-container">
                <button
                    onClick={handleGenerateClick}
                    disabled={isLoading}
                    className="generate-button"
                >
                    {isLoading ? 'Loading...' : 'Generate New Timetable'}
                </button>

                <div className="export-dropdown">
                    <button
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className="export-button"
                    >
                        Export
                    </button>
                    {showExportDropdown && (
                        <div className="export-dropdown-content">
                            <button onClick={handleExportPDF}>Export as PDF</button>
                            <button onClick={handleExportCSV}>Export as CSV</button>
                        </div>
                    )}
                </div>
            </div>

            {showPopup && (
                <GenerateTimetablePopup
                    onClose={() => setShowPopup(false)}
                    onConfirm={handleConfirmGenerate}
                />
            )}

            <div className="timetable" ref={timetableRef}>
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