import { createClient } from '@supabase/supabase-js';
import internal from 'stream';

const supabase = createClient(
    Deno.env.get("MY_SUPABASE_URL")!,
    Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY")!
  );
  interface ClassData {
    class_type: string;
    class_time: string;
  }
  
  interface CourseData {
    name: string;
    course_code: string;
    
  }
export const addCourseAndClasses = async (courseData: CourseData) => {
  // Check if the course already exists by course name or course code
  const { data: existingCourse, error: courseCheckError } = await supabase
    .from('Courses')
    .select('id')
    .eq('name', courseData.name) // Assuming the course name is unique
    .single(); // We expect only one course if it exists

  if (courseCheckError && courseCheckError.message !== "No rows found") {
    throw new Error(`Error checking course: ${courseCheckError.message}`);
  }

  let courseId;

  if (existingCourse) {
    // If the course exists, use the existing course id
    courseId = existingCourse.id;
  } else {
    // Course doesn't exist, so create it
    const { data: newCourse, error: courseCreateError } = await supabase
      .from('courses')
      .insert([
        {
          name: courseData.course_name,
          description: courseData.course_description
        }
      ])
      .select('id'); // Get the new course id

    if (courseCreateError) {
      throw new Error(`Failed to create course: ${courseCreateError.message}`);
    }

    courseId = newCourse[0].id; // Get the newly created course id
  }

  // Now insert the new classes for the course
  const classesData = courseData.classes.map(classItem => ({
    course_id: courseId, // Link to the course
    class_type: classItem.class_type,
    class_time: classItem.class_time
  }));

  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .insert(classesData);

  if (classesError) {
    throw new Error(`Failed to create classes: ${classesError.message}`);
  }

  return { courseId, classes };
};
