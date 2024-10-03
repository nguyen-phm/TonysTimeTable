// TO DO:
// Handle multiple campuses
// Handle cases where timetable generation is not possible

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const MIN_HOUR = 6; // earliest a class can start 
const MAX_HOUR = 18; // latest a class can finish
const HOURS_PER_DAY = MAX_HOUR - MIN_HOUR;

const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!, 
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
    const data = await fetchData();

    let bestTimetable = getInitialState(data);
    let bestFitness = getFitness(bestTimetable, data);

    // for (let i = 0; i < 100000; i++) {
    //     const currTimetable = getNeighbour(bestTimetable, 1, data);
    //     const currFitness = getFitness(currTimetable, data);
    //     if (currFitness > bestFitness) {
    //         bestTimetable = JSON.parse(JSON.stringify(currTimetable));;
    //         bestFitness = currFitness;
    //     }
    // }

    await updateDatabase(bestTimetable, data);

    return new Response(
        JSON.stringify({bestFitness, bestTimetable}),
        { headers: { "Content-Type": "application/json" } }
      );
});

function canAllocate(classIndex, roomIndex, time, timetable, data): boolean {
    for (let i = 0; i < data.classes[classIndex].duration_30mins; i++) {
        if (time + i >= timetable.length) return false;
        if (time % HOURS_PER_DAY*2 > (time + i) % HOURS_PER_DAY*2) return false;
        if (timetable[time + i][roomIndex] !== null) return false;

        for (let j = 0; j < data.classes.length; j++) {
            if (timetable[time + i][j] == null) continue;
            if (data.clashes.has(`${i}-${j}`)) return false;
        }
    }
    return true;
}

async function fetchData() {
    const { data: rooms, roomsError } = await supabase
        .from("Locations")
        .select(`id`);
    if (roomsError) throw new Error("Error fetching rooms: " + roomsError.message);

    const { data: classes, classesError } = await supabase
        .from("Classes")
        .select(`id, duration_30mins, staff_id`)
        .order('duration_30mins', { ascending: false });
    if (classesError) throw new Error("Error fetching classes: " + classesError.message);

    
    const clashes = new Set();
    for (let i = 0; i < classes.length; i++) {
        for (let j = 1; j < classes.length; j++) {
            if (classes[i].staff_id == classes[j].staff_id_id) {
                // Teaching staff clash
                clashes.add(`${i}-${j}`)
                clashes.add(`${j}-${i}`);
                continue;
            }
        }
    }
    

    return { rooms: rooms, classes: classes, clashes: clashes }
}

function getInitialState(data) {
    const timetable = Array.from({ length: HOURS_PER_DAY*2 }, () => new Array(data.rooms.length).fill(null));

    data.classes.forEach((clazz, classIndex) => {
        while (true) {
            const time = randomInt(0, timetable.length);
            const roomIndex = randomInt(0, data.rooms.length);
    
            // const canAllocate = [...Array(clazz.duration_30mins)].every((_, i) => {
            //     return (time + i) < timetable.length 
            //         && (time % HOURS_PER_DAY*2 <= (time + i) % HOURS_PER_DAY*2) 
            //         && timetable[time + i][roomIndex] === null;
            // });
    
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

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Generates a neighbouring state by randomly deallocating and then reallocating K classes.
function getNeighbour(timetable, K, data) {
    const neighbour = JSON.parse(JSON.stringify(timetable));

    const toDeallocate = new Set<number>();
    while (toDeallocate.size < K) {
        toDeallocate.add(randomInt(0, data.classes.length - 1));
    }

    for (let room = 0; room < data.rooms.length; room++) {
        for (let time = 0; time < neighbour.length; time++) {
            if (toDeallocate.has(neighbour[time][room])) neighbour[time][room] = null;
        }
    }

    toDeallocate.forEach(classIndex => {
        const clazz = data.classes[classIndex];
        while (true) {
            const time = randomInt(0, neighbour.length);
            const roomIndex = randomInt(0, data.rooms.length);

            const canAllocate = [...Array(clazz.duration_30mins)].every((_, i) => {
                return (time + i) < timetable.length 
                    && (time % HOURS_PER_DAY*2 <= (time + i) % HOURS_PER_DAY*2) 
                    && neighbour[time + i][roomIndex] === null;
            });

            if (canAllocate) {
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
            if (classIndex !== null) {
            
                if (time % 4 == 0) fitness += 10;
                if (time % 4 == 2) fitness += 5;

                fitness -= Math.abs(time % HOURS_PER_DAY*2 + MIN_HOUR*2 - 13*2);

                time += data.classes[classIndex].duration_30mins - 1;
            }
        }
     
    }

    return fitness;
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


  
 