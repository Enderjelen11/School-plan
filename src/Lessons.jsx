import React, {useState, useRef} from 'react'
import './app.css'
import ClassesList from './ClassesList'
import {BaseDirectory, readTextFile, writeFile} from '@tauri-apps/api/fs';
import LessonsList from './LessonsList'
import ComponetCheckerList from './ComponetCheckerList';
import generatePlan from './generateSchoolPlan';

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

let loadedSaved = false;

const devPreset = [{"name":"1","maxLessons":"3","lessons":[{"name":"Fizyka","teacher":"Sławomir Borys(Fizyka)","rooms":["1(fizyka)"],"color":"#83627A","amount":"4"},{"name":"Matematyka","teacher":"Dariusz Dziędziel(matematyka)","rooms":["2(matematyka)"],"color":"#D3A23A","amount":"5"},{"name":"Polski","teacher":"Grażyna Jarosz(polski)","rooms":["4(polski)"],"color":"#59B16D","amount":"5"},{"name":"Angielski","teacher":"Agnieszka Majewską(angielski)","rooms":["6(angielski)"],"color":"#E34BD7","amount":"1"}]},{"name":"2","maxLessons":"3","lessons":[{"name":"Fizyka","teacher":"Sławomir Borys(Fizyka)","rooms":["1(fizyka)"],"color":"#83627A","amount":"2"},{"name":"Matematyka","teacher":"Iwona Kozioł(matematyka)","rooms":["3(matematyka)"],"color":"#D3A23A","amount":"5"},{"name":"Polski","teacher":"Kacper Nowak(polski)","rooms":["5(polski)"],"color":"#59B16D","amount":"5"},{"name":"Angielski","teacher":"Mateusz Kwiecień(angielski)","rooms":["7(angielski)"],"color":"#E34BD7","amount":"3"}]},{"name":"3","maxLessons":"3","lessons":[{"name":"Fizyka","teacher":"Sławomir Borys(Fizyka)","rooms":["1(fizyka)"],"color":"#83627A","amount":"1"},{"name":"Matematyka","teacher":"Iwona Kozioł(matematyka)","rooms":["2(matematyka)","3(matematyka)"],"color":"#D3A23A","amount":"6"},{"name":"Polski","teacher":"Grażyna Jarosz(polski)","rooms":["4(polski)"],"color":"#59B16D","amount":"5"},{"name":"Angielski","teacher":"Agnieszka Majewską(angielski)","rooms":["6(angielski)"],"color":"#E34BD7","amount":"3"}]},{"name":"4","maxLessons":"2","lessons":[{"name":"Fizyka","teacher":"Sławomir Borys(Fizyka)","rooms":["1(fizyka)"],"color":"#83627A","amount":"4"},{"name":"Matematyka","teacher":"Dariusz Dziędziel(matematyka)","rooms":["3(matematyka)"],"color":"#D3A23A","amount":"1"},{"name":"Polski","teacher":"Kacper Nowak(polski)","rooms":["5(polski)"],"color":"#59B16D","amount":"1"},{"name":"Angielski","teacher":"Mateusz Kwiecień(angielski)","rooms":["6(angielski)","7(angielski)"],"color":"#E34BD7","amount":"4"}]}];

let classes = [];
let subjects = [];
let rooms = [];
let teachers = [];

async function readFile(filename){
    const contents = await readTextFile(filename, { dir: BaseDirectory.AppData});
    const arr = JSON.parse(contents||'[]');
    return arr.map(name=>new Object({
        name
    }))
}

export default function Lessons() {
    const [currentClass,setCurrentClass] = useState({
        name:'couldn\'t load saved classes',
        maxLessons:0,
        lessons:[]
    });
   
    const [adder,setAdder] = useState(false);

    const maxLessonsInDay = useRef();

    
    if(!loadedSaved){
        readFile('Classes.json').then(r=>{
            const savedClasses = r.map(e=>new Object({...e,maxLessons:3,lessons:[]}))
            setCurrentClass(savedClasses[0]);
            classes=savedClasses;
         });
        readFile('Subjects.json').then(r=>subjects=r.map(e=>new Object({...e,color:getRandomColor()})));
        readFile('Rooms.json').then(r=>rooms=r);
        readFile('Teachers.json').then(r=>teachers=r);
        if((classes&&subjects&&rooms&&teachers).length){
            loadedSaved=true;
        }
    }

    function saveClass(classToBeSaved){
        const classesCopy = [...classes];
        const index = classesCopy.findIndex(e=>e.name==classToBeSaved.name);
        classes[index]=classToBeSaved;
    }
    
    function selectClass(classSelected){
        if(classSelected.name!=currentClass.name){
            saveClass({...currentClass,maxLessons:maxLessonsInDay.current.value});
            setAdder(false);
            setCurrentClass(classSelected);
            maxLessonsInDay.current.value=classSelected.maxLessons;
        }
    }

    const [currentLesson,setLesson] = useState({
            subject:[],
            teacher:[],
            rooms:[]
        });

    const lessonsAmountRef = useRef();

    function toggleAdder(){
        setLesson({
            subject:[],
            teacher:[],
            rooms:[]
        });
        setAdder(true);
        setTimeout(()=>{lessonsAmountRef.current.value=1},50);
    }

    const change = {
        subjects:(name)=>{
            const n = lessonsAmountRef.current.value*1;
            setLesson({
                subject:[name],
                teacher:currentLesson.teacher,
                rooms:currentLesson.rooms,
            })
            setTimeout(()=>{lessonsAmountRef.current.value=n},50);
        },
        teachers:(name)=>{
            const n = lessonsAmountRef.current.value*1;
            setLesson({
                subject:currentLesson.subject,
                teacher:[name],
                rooms:currentLesson.rooms,
            })
            setTimeout(()=>{lessonsAmountRef.current.value=n},50);
        },
        rooms:(name)=>{
            const n = lessonsAmountRef.current.value*1;
            if(currentLesson.rooms.includes(name)){
                const lessonsRoomsCopy = [...currentLesson.rooms];
                const withoutSelected = lessonsRoomsCopy.filter(e=>e!=name);
                setLesson({
                    subject:currentLesson.subject,
                    teacher:currentLesson.teacher,
                    rooms:withoutSelected
                })

            }else{
                setLesson({
                    subject:currentLesson.subject,
                    teacher:currentLesson.teacher,
                    rooms:[...currentLesson.rooms,name]
                })
            }
            setTimeout(()=>{lessonsAmountRef.current.value=n},50);
        }
    }

    function selectLesson(name){
        const lesson = currentClass.lessons.find(e=>e.name==name);
        setLesson({
            subject:[name],
            teacher:[lesson.teacher],
            rooms:lesson.rooms
        });
        if(!adder){
            setAdder(true);
        }
        setTimeout(()=>{lessonsAmountRef.current.value=lesson.amount},50);
    }
    

    function saveCurrentLesson(){
        const name = currentLesson.subject[0];
        const teacher = currentLesson.teacher[0];
        const rooms = currentLesson.rooms;
        const color = subjects.find(e=>e.name==name).color;
        const withoutCurrentLesson = [...currentClass.lessons].filter(e=>e.name!=name);
        const newClass = {
            name:currentClass.name,
            maxLessons:maxLessonsInDay.current.value,
            lessons:[...withoutCurrentLesson,{
                name,
                teacher,
                rooms,
                color,
                amount:lessonsAmountRef.current.value

            }]
        }
        setCurrentClass(newClass);
        saveClass(newClass);
    }

    function Adder({children}){
        if(adder){
            return <div>{children}</div>;
        }else{
            return <div></div>;
        }
    }
    

    return (
      <>
        <div className="sidenav">
            <button type="button" onClick={()=>{generatePlan(classes)}}>ready?</button>
            <ClassesList classes={classes} onSelect={selectClass} />
        </div>

        <div className="main">
            <div><font size="+3"><b>{currentClass.name}:</b></font></div>
            <br></br>
            <div>
                <b>Max lessons in one day:</b>
                <input type="text" ref={maxLessonsInDay}></input>
            </div>

            <LessonsList lessons={currentClass.lessons} selectLesson={selectLesson} plusClicked={toggleAdder}/>
            <Adder>
                <div><font size="+1"><b>{currentLesson.subject}:</b></font></div>
                <div>
                    <b>How many lessons will there be in one week</b>
                    <input type="text" ref={lessonsAmountRef}></input>
                </div>
                </Adder>
                <Adder>
                <div>
                    <ComponetCheckerList onChange={change.subjects} selected={currentLesson.subject} title="Subjects">{subjects}</ComponetCheckerList>
                    <ComponetCheckerList onChange={change.teachers} selected={currentLesson.teacher} title="Teachers">{teachers}</ComponetCheckerList>
                    <ComponetCheckerList onChange={change.rooms} selected={currentLesson.rooms} title="Rooms">{rooms}</ComponetCheckerList>
                </div>
                <button onClick={saveCurrentLesson}>save</button>
            </Adder>
        </div>
      </>
    )
}
