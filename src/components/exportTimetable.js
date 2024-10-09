import { supabase } from './supabaseClient';
import ExcelJS from 'exceljs';

// Export the timetable for a given course as an Excel file
async function exportTimetable(course_id) {
    // Attempt to fetch course
    const { data: course, error } = await supabase
        .from('Courses')
        .select(`id, name`)
        .eq('id', course_id)
        .limit(1)
        .single();
    
    if (error | !course) {
        console.error('Error fetching course');
        return;
    }

    // Attempt to export timetable to excel
    const excelBuffer = await generateExcelFile(course);

    if (!excelBuffer) {
        console.error('Failed to export timetable');
        return;
    }
    
    // Force download
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `timetable - ${course.name}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
}

// Generate the Excel file and write it to a buffer
async function generateExcelFile(course) {
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Timetable');

    let boilerplateLineCount = 0;
    // Add a single line of boilerplate and increment the counter
    const addBoilerplateLine = (text, color, center, size, bold) =>  {
        boilerplateLineCount++;
        worksheet.mergeCells(`A${boilerplateLineCount}:F${boilerplateLineCount}`);
        const cell = worksheet.getRow(boilerplateLineCount).getCell(1);
        cell.value = text;
        cell.font = { size: size, name: 'Tahoma', color: { argb: color }, bold: bold }
        if (center) {
            cell.alignment = { horizontal: 'center'};
        }
    }

    // Add boilerplate
    addBoilerplateLine('Victorian Institute of Technology Pty Ltd', '0000FF', true, 9, true);
    addBoilerplateLine('ABN: 41 085 128 525 RTO No: 20829 TEQSA ID: PRV14007 CRICOS Provider Code: 02044E', '0000FF', true, 9, false);
    addBoilerplateLine(course.name, '000000', true, 9, true);
    addBoilerplateLine('Venue: 123 & 235 Queens Street, Melbourne', '000000', true, 9, true);
    addBoilerplateLine('Timetable:', '000000', false, 9, true);
    addBoilerplateLine('Note: (a) This is a Master Timetable. You are required to refer to your Unit Allocation (i.e., your enrolled units) to know which units/sessions are applicable to you.', 'C00000', false, 9, true);
    addBoilerplateLine('(b) Time Table may change in the event of some exigencies.', 'C00000', false, 9, true);
    addBoilerplateLine('(c) Units have additional consulting sessions (based on unit requirements) which is not reflected below including online guided learning.', 'C00000', false, 9, true);

    // Add VIT logo
    const response =  await fetch('/logoExcel_upscaled.png');
    const logo = workbook.addImage({
        buffer: response.arrayBuffer(),
        extension: 'png', 
    });
    worksheet.addImage(logo, {
        tl: { col: 0, row: 0 },
        ext: { width: 150, height: 75 },
        editAs: 'oneCell'
    });
    

    // Add timetable headers
    const headers = ['Day', 'Time', 'Unit', 'Classroom', 'Teaching Staff', 'Delivery Mode'];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9D9D9' } };
        cell.font = { size: 10, name: 'Tahoma', bold: true };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }};
        cell.alignment = { horizontal: 'center' };
    });

    // Add class data
    const classData = await fetchClassData(course);
    classData.forEach(row => {
        const dataRow = worksheet.addRow(row);
        dataRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DEEAF6' } };
            cell.font = { size: 10, name: 'Tahoma' };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }};
            cell.alignment = { horizontal: 'center' };

        });
    });

    // Adjust column widths to fit content
    worksheet.columns.forEach(column => {
        let maxLength = 0;
        const cells = column.values;
        // Skip boilerplate
        for (let i = boilerplateLineCount + 1; i < cells.length; i++) {  
            const cell = cells[i];
            const columnLength = cell ? cell.toString().length : 10;
            if (columnLength > maxLength) {
                maxLength = columnLength;
            }
        }
        column.width = maxLength + 6;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}

async function fetchClassData(course) {
    // Attempt to fetch classes
    const { data: classes, error } = await supabase
        .from('Classes')
        .select(`
            id, start_time, duration_30mins, class_type, is_online,
            Subjects!inner(course_id, name, code), 
            Locations ( name ),
            Staff ( name )
        `)
        .eq('Subjects.course_id', course.id)
        .order('start_time');

    if (error | !classes) {
        console.error('Failed to fetch classes');
        return [];
    }

    // Format class data
    const classData = Array.from(Array(classes.length), () => new Array(6))
    for (let i = 0; i < classes.length; i++) {
        classData[i][0] = timeToDayString(classes[i].start_time);
        classData[i][1] = `${timeToTimeString(classes[i].start_time)} to ${timeToTimeString(classes[i].start_time + classes[i].duration_30mins)}`; 
        classData[i][2] = `${classes[i].Subjects.code} - ${classes[i].Subjects.name} (${classes[i].class_type === 'LECTURE' ? 'Lecture' : 'Tutorial'})`;
        classData[i][3] = classes[i].Locations.name;
        classData[i][4] = classes[i].Staff.name;
        classData[i][5] = classes[i].is_online ? 'Online' : 'Face to Face';
    };
    
    return classData;
}

// Utility function function validate an encoded time
function validateTime(time) {
    return Number.isInteger(time) && time >= 0 && time < 24*2*5;
  }

// Utility function to extract the day from an encoded time as a string
// Assumes that the encoded time is valid
function timeToDayString(time) {
    switch (Math.floor(time / 48)) {
        case 0: return 'Monday';
        case 1: return 'Tuesday';
        case 2: return 'Wednesday';
        case 3: return 'Thursday';
        case 4: return 'Friday';
    }
}

// Utility function to extract the time from an encoded time as a string
// Assumes that the encoded time is valid
function timeToTimeString(time) {
    const hour24 = Math.floor(time/2) % 24; 
    const hour12Str = (hour24 % 12 || 12).toString();
    const minuteStr = time % 2 == 0 ? '00' : '30'; 
    const amPm = hour24 < 12 ? 'am' : 'pm';
    return `${hour12Str}:${minuteStr}${amPm}`;
}

export default exportTimetable;