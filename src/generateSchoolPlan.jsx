import { save } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";

function shuffle(array) {
  let copy = [];
    let n = array.length; 
    let i;

  // While there remain elements to shuffle…
  while (n) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * n--);

    // And move it to the new array.
    copy.push(array.splice(i, 1)[0]);
  }

  return copy;
}

export default async function generatePlan(classes){
    const input = [...classes].map(e=>new Object({
                    class:e.name,
                    maxLessons:e.maxLessons,
                    lessons:e.lessons.map(l=>new Object({
                        name:l.name,
                        teacher:l.teacher,
                        rooms:l.rooms,
                        goal:parseInt(l.amount),
                        n:0
                    }))
                }));

    const days = [];
    for(let i = 0; i<5; i++){
        const shuffled = shuffle([...input]);
        //maximum lesson number during the day
        const lastLesson = shuffled.map(e=>parseInt(e.maxLessons)).sort()[shuffled.length-1];

        let day = [];
        
        for(let j = 0; j<lastLesson; j++){
            const hours = [];
            
            const busyTeachers = [];
            const busyRooms = [];

            for(let k = 0; k<shuffled.length; k++){
                const rClass = shuffled[k];

                const filtered = rClass.lessons.filter(l=>(!busyTeachers.includes(l.teacher))&&l.n<l.goal).map(e=>new Object({
                    ...e,
                    rooms:e.rooms.filter(room=>!busyRooms.includes(room))
                }))
                if(j<rClass.maxLessons&&filtered.length>0){
                    const rLesson = filtered[Math.floor(Math.random()*filtered.length)];
                    const rRoom = rLesson.rooms[Math.floor(Math.random()*rLesson.rooms.length)];
                    
                    const classIndex = input.findIndex(c=>c.class==rClass.class);
                    const lessonsIndex = input[classIndex].lessons.findIndex(l=>l.name==rLesson.name);
                    input[classIndex].lessons[lessonsIndex].n = input[classIndex].lessons[lessonsIndex].n + 1;
                    busyTeachers.push(rLesson.teacher);
                    busyRooms.push(rLesson.room);

                    hours.push({
                        class:rClass.class,
                        teacher:rLesson.teacher,
                        name:rLesson.name,
                        room:rRoom
                    });
                }
            }
            hours.sort((a,b)=>a.class.localeCompare(b.class));
            day.push(hours);
        }

        days.push(day);
    }
    savePlanToFile(input.map(e=>e.class),days);
}


function filter3dimArr(byClassName,array){
    const x = [];

    for(let i = 0; i<array.length; i++){
        const y = [];
        for(let j = 0; j<array[i].length; j++){
            y.push(array[i][j].filter(e=>e.class==byClassName)); 
        }
        x.push(y);
    }

    return x;
}

function ThreeDimArrToText(array){
    let string = "";

    for(let i = 0; i<array.length; i++){
        for(let j = 0; j<array[i].length; j++){
            const l = array[i][j][0]||{name:"",teacher:"",room:""};
            string=string+`${l.name} ${l.teacher} ${l.room}\t`;
        }
        string=string+`\n`
    }
    
    return string;
}


async function savePlanToFile(names,plan){
    try {
        const savePath = await save();
        if (!savePath) return;
        invoke("create_dir",{path:savePath});
        for(name of names){
            const contents = ThreeDimArrToText(filter3dimArr(name,plan));
            const path = savePath + `/${name}.txt`;
            await invoke("save_file", { path, contents });
        }
  } catch (err) {
    console.error(err);
  }
}
