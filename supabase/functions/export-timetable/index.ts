// File: supabase/functions/export-timetable/index.ts
// Export the timetable for a given course as a .xlsx file

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import ExcelJS from 'npm:exceljs@4.4.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!, 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    // Attempt to read course_id from req
    const { course_id } = await req.json();
    if (!course_id || typeof course_id !== 'number' || !Number.isInteger(course_id)) {
      return new Response('Invalid or missing course_id. It should be an integer.', { status: 400 });
    }

    const excelFile = await generateExcelFile(course_id);
    return new Response(excelFile, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="timetable.xlsx"'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

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
  timetableData.forEach((row, rowIndex) => {
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
    Subjects ( name, code, course_id ),
    Locations ( name ),
    Staff ( name )
  `)
  .eq('Subjects.course_id', course_id)
  .order('start_time');
  if (error) throw new Error(error.message);

  const timetableData: any[][] = Array.from({ length: classes.length }, () => new Array(5)); 

  classes.forEach((cls, row) => {
    timetableData[row][0] = getDayString(cls);
    timetableData[row][1] = getTimeString(cls); 
    timetableData[row][2] = `${cls.Subjects.code} - ${cls.Subjects.name} (${cls.class_type === 'LECTURE' ? 'Lecture' : 'Tutorial'})`;
    timetableData[row][3] = cls.Locations.name;
    timetableData[row][4] = cls.Staff.name;
    timetableData[row][5] = cls.is_online ? 'Online' : 'Face to Face'; 
  });

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

