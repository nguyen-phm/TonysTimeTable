import { supabase } from './supabaseClient';
import ExcelJS from 'exceljs';

async function exportTimetable(course_id) {
    console.log('Exporting timetable...');
    const buffer = await generateExcelFile(course_id);

    // Download the file
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'timetable.xlsx');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
}

async function generateExcelFile(course_id) {
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Timetable');

    // worksheet.mergeCells('A1:F1'); 
    // const topRow = worksheet.getRow(1); 
    // topRow.getCell(1).value = "Victorian Institute of Technology Pty Ltd";
    // topRow.getCell(1).alignment = { horizontal: 'center' }; // Center the text

    // Add headers
    const headers = ['Day', 'Time', 'Unit', 'Classroom', 'Teaching Staff', 'Delivery Mode'];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9D9D9' }
    };
    cell.font = {
        size: 10,
        font: 'Tahoma',
        bold: true,
    };
    cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
    cell.alignment = { horizontal: 'center' };
    });

    // Add the timetable data
    const timetableData = await getTimetableData(course_id);
    
    timetableData.forEach(row => {
    const dataRow = worksheet.addRow(row);
    dataRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'DEEAF6' }
        };
        cell.font = {
            size: 10,
            font: 'Tahoma',
        };
            cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };  
        cell.alignment = { horizontal: 'center' };
    });
    });

    // Adjust column widths to fit content (including headers and data)
    worksheet.columns.forEach(column => {
    let maxLength = 0;
    const cells = column.values;
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const columnLength = cell ? cell.toString().length : 10; // Default to 10 if no value
        if (columnLength > maxLength) {
        maxLength = columnLength;
        }
    }
    column.width = maxLength + 2; // Add some padding
    });

    // Generate the Excel file as a buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}

async function getTimetableData(course_id) {
    const { data: classes, error } = await supabase
        .from('Classes')
        .select(`
        id, start_time, duration_30mins, class_type, is_online,
        Subjects!inner(course_id, name, code), 
        Locations ( name ),
        Staff ( name )
        `)
        .eq('Subjects.course_id', course_id)
        .order('start_time');
    if (error) {
        console.log('Error reading Classes: ' + error.message);
        return [];
    }
    const timetableData = Array.from(Array(classes.length), () => new Array(6))
    for (let i = 0; i < classes.length; i++) {
        timetableData[i][0] = getDayString(classes[i]);
        timetableData[i][1] = getTimeString(classes[i]); 
        timetableData[i][2] = `${classes[i].Subjects.code} - ${classes[i].Subjects.name} (${classes[i].class_type === 'LECTURE' ? 'Lecture' : 'Tutorial'})`;
        timetableData[i][3] = classes[i].Locations.name;
        timetableData[i][4] = classes[i].Staff.name;
        timetableData[i][5] = classes[i].is_online ? 'Online' : 'Face to Face';
    };
    
    return timetableData;
}

function getDayString(cls) {
    switch (Math.floor(cls.start_time / 48)) {
    case 0:
        return 'Monday';
    case 1:
        return 'Tuesday';
    case 2:
        return 'Wednesday';
    case 3:
        return 'Thursday';
    case 4:
        return 'Friday';
    default:
        throw new Error('Invalid time.')
    }
}

function getTimeString(cls) {
    const startTime = cls.start_time;
    const duration30mins = cls.duration_30mins;
    const startHour = Math.floor(startTime / 2) % 24; 
    const startMinute = (startTime % 2) * 30; 
    const endHour = Math.floor((startTime + duration30mins) / 2) % 24; 
    const endMinute = ((startTime + duration30mins) % 2) * 30; 
    const formatHour = (hour) => (hour % 12 || 12).toString();
    const getAmPm = (hour) => hour < 12 ? 'am' : 'pm';
    const startTimeString = `${formatHour(startHour)}:${startMinute.toString().padStart(2, '0')}${getAmPm(startHour)}`;
    const endTimeString = `${formatHour(endHour)}:${endMinute.toString().padStart(2, '0')}${getAmPm(endHour)}`;
    return `${startTimeString} to ${endTimeString}`;
}

export default exportTimetable;