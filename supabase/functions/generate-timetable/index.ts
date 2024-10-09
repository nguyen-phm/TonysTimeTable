import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const MIN_HOUR = 7-1; // earliest a class can start (0-23)
const MAX_HOUR = 19-1; // latest a class can finish
const IDEAL_HOUR = 13-1;

const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!, 
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
    const { data: campuses, error } = await supabase
        .from('Campuses')
        .select('id');
    if (error) throw new Error('Error fetching campuses: ' + error.message);
    console.log(campuses);

    if (campuses) {
        for (const campus of campuses) { 
            if (campus.id != 1) continue;
            const data = await fetchData(campus.id);
            let timetable = await getInitialState(data);
            timetable = optimizeTimetable(timetable, data);
            await updateDatabase(timetable, data);
        }
    }

    return new Response(
        { headers: { "Content-Type": "application/json" } }
    );
});

function canAllocate(classIndex, roomIndex, time, timetable, data): boolean {
    // Make sure class isn't allocated too early
    if (time % 48 < MIN_HOUR*2) return false;

    for (let i = 0; i < data.classes[classIndex].duration_30mins; i++) {
        // Make sure class isn't allocated too late
        if ((time + i) % 48 >= MAX_HOUR*2) return false;

        // Check if another class is already allocated to this room at this time
        if (timetable[time + i][roomIndex] !== null) return false;

        // Check if the class clashes with another class allocated at this time
        for (let j = 0; j < data.rooms.length; j++) {
            if (timetable[time + i][j] === null) continue;
            if (data.clashes.has(`${classIndex}-${timetable[time + i][j]}`)) return false;
        }
    }
    return true;
}


async function fetchData(campusId) {
    const { data: rooms, roomsError } = await supabase
        .from('Locations')
        .select(`id, campus_id`)
        .eq('campus_id', campusId);
    console.log(rooms);

    if (roomsError) throw new Error('Error fetching rooms: ' + roomsError.message);

    // don't neeed subject and course name 
    const { data: classes, classesError } = await supabase
        .from('Classes')
        .select(`
            id, start_time, duration_30mins, class_type,
            Subjects!inner(
                name,
                Courses!inner(name, campus_id)
            )
        `)
        .eq('Subjects.Courses.campus_id', campusId)
        .order('duration_30mins', { ascending: false });
    console.log(classes);

    const { data: enrolments, enrolmentsError } = await supabase
        .from('StudentSubject')
        .select(`student_id, subject_id`);
    console.log(enrolments);

    if (enrolmentsError) throw new Error('Error fetching classes: ' + classesError.message);
    
    const clashes = new Set();
    // Teaching staff clash
    for (let i = 0; i < classes.length; i++) {
        for (let j = i + 1; j < classes.length; j++) {
            if (classes[i].staff_id == classes[j].staff_id) {
                clashes.add(`${i}-${j}`)
                clashes.add(`${j}-${i}`);
            }
        }
    }
    // Student clash
    for (let i = 0; i < enrolments.length; i++) {
        for (let j = i + 1; j < enrolments.length; j++) {
            if (enrolments[i].student_id == enrolments[j].student_id) {
                clashes.add(`${i}-${j}`)
                clashes.add(`${j}-${i}`);
            }
        }
    }

    return { rooms: rooms, classes: classes, clashes: clashes }
}

function getInitialState(data) {
    const timetable = Array.from({ length: 24*2*5 }, () => new Array(data.rooms.length).fill(null));
    // Attempt to randomly allocate each class.
    // TO DO: attempt limit.
    data.classes.forEach((clazz, classIndex) => {
        while (true) {
            const hour = randomInt(2*MIN_HOUR, 2*MAX_HOUR);
            const day = randomInt(0, 4);
            const time = day * 48 + hour;
            const roomIndex = randomInt(0, data.rooms.length);
            if (canAllocate(classIndex, roomIndex, time, timetable, data)) {
                for (let i = 0; i < clazz.duration_30mins; i++) {
                    timetable[time + i][roomIndex] = classIndex;
                }
                break;
            }
      }
    });
    return timetable;
}

async function updateDatabase(timetable, data) {
    for (let roomIndex = 0; roomIndex < data.rooms.length; roomIndex++) {
        for (let time = 0; time < timetable.length; time++) {
            const classIndex = timetable[time][roomIndex];
            if (classIndex !== null) { 
                await supabase.from("Classes")
                    .update({start_time: time + MIN_HOUR*2, location_id: data.rooms[roomIndex].id})
                    .eq("id", data.classes[classIndex].id);
                time += data.classes[classIndex].duration_30mins - 1;
          }
        }
    }
}

// Utility function to generate a random integer between min and max (exclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Generates a neighbouring state by randomly deallocating and then reallocating K classes
function getNeighbour(timetable, data) {
    const K = Math.ceil(data.classes.length * 0.2)
    const neighbour = JSON.parse(JSON.stringify(timetable));

    // Randomly select K classes to deallocate
    const toDeallocate = new Set<number>();
    while (toDeallocate.size < K) {
        toDeallocate.add(randomInt(0, data.classes.length - 1));
    }

    // Deallocate the classes
    for (let room = 0; room < data.rooms.length; room++) {
        for (let time = 0; time < neighbour.length; time++) {
            if (toDeallocate.has(neighbour[time][room])) neighbour[time][room] = null;
        }
    }

    // Reallocate the classes
    toDeallocate.forEach(classIndex => {
        const clazz = data.classes[classIndex];
        while (true) {
            const time = randomInt(0, 4) * 48 + randomInt(2*MIN_HOUR, 2*MAX_HOUR);
            const roomIndex = randomInt(0, data.rooms.length);
            if (canAllocate(classIndex, roomIndex, time, timetable, data)) {
                for (let i = 0; i < clazz.duration_30mins; i++) {
                    neighbour[time + i][roomIndex] = classIndex;
                }
                break;
            }
        }
    });

    return neighbour;
}

function getFitness(timetable, data) {
    let fitness = 0;
    for (let roomIndex = 0; roomIndex < data.rooms.length; roomIndex++) {
        for (let time = 0; time < timetable.length; time++) {
            const classIndex = timetable[time][roomIndex];
            if (classIndex === null) continue;
            if (time % 2 == 0) fitness += 50;
            fitness -= Math.abs(time % 48 - IDEAL_HOUR*2);
            time += data.classes[classIndex].duration_30mins - 1;
        }
    }
    return fitness;
}

function optimizeTimetable(initialTimetable, data) {
    const K = Math.ceil(data.classes.length * 0.2)
    console.log('K=',K)
    let bestTimetable = initialTimetable;
    let bestFitness = getFitness(initialTimetable, data);
    for (let iter = 0; iter < 1000; iter++) {
        const currTimetable = getNeighbour(bestTimetable, data);
        const currFitness = getFitness(currTimetable, data);
        console.log(currFitness);
        if (currFitness > bestFitness) {
            bestTimetable = currTimetable;
            bestFitness = currFitness;
        }
    }
    console.log('BEST', bestFitness)
    return bestTimetable;
}



  
 