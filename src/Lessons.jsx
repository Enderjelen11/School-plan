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
    const [currentClass,setCurrentClass] = useState({name:'couldn\'t load saved classes',lessons:[]});
   
    const [adder,setAdder] = useState(false);
    
    if(!loadedSaved){
        readFile('Classes.json').then(r=>{
            const savedClasses = r.map(e=>new Object({...e,lessons:[]}))
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
    
    function selectClass(name){
        setAdder(false);
        const classChosen = classes.find(classSEL=>classSEL==name);
        setCurrentClass(classChosen);
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
            <div><font size="+3">{currentClass.name}:</font></div>
            <br></br>
            <LessonsList lessons={currentClass.lessons} selectLesson={selectLesson} plusClicked={toggleAdder}/>
            <Adder>
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
