import React, {useState, useRef} from 'react'
import './app.css'
import ClassesList from './ClassesList'
import {BaseDirectory, readTextFile, writeFile} from '@tauri-apps/api/fs';
import LessonsList from './LessonsList'
import ComponetCheckerList from './ComponetCheckerList';
import saveSchoolPlan from './saveSchoolPlan';

const classes = (JSON.parse(await readTextFile(`classes.json`, { dir: BaseDirectory.AppData}))??[]).map(name=>new Object({
    name,
    lessons:[]
}));

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const rooms = (JSON.parse(await readTextFile(`Rooms.json`, { dir: BaseDirectory.AppData}))??[]).map(name=>new Object({
    name,
    color:getRandomColor()
}));

const subjects = (JSON.parse(await readTextFile(`Subjects.json`, { dir: BaseDirectory.AppData}))??[]).map(name=>new Object({
    name,
    color:getRandomColor()
}));

const teachers = (JSON.parse(await readTextFile(`Teachers.json`, { dir: BaseDirectory.AppData}))??[]).map(name=>new Object({
    name,
    color:getRandomColor()
}));



export default function Lessons() {
    const [currentClass,setCurrentClass] = useState(classes[0]);
   
    const [adder,setAdder] = useState(false);
    
    function selectClass(name){
        const classesCopy = [...classes];
        const classChosen = classesCopy.find(classSEL=>classSEL==name);
        setAdder(false);
        const index = classes.findIndex(e=>e.name==currentClass.name);
        classes[index]=currentClass;
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
        if(currentClass.lessons.findIndex(l=>l.subject==currentLesson.subject[0])==-1){
            setCurrentClass({
                name:currentClass.name,
                lessons:[...currentClass.lessons,{
                    name,
                    teacher,
                    rooms,
                    color,
                    amount:lessonsAmountRef.current.value
                }]
            })
        }else{
            const currentClassLessonsCopy = [...currentClass.lessons];
            const withoutCurrentLesson = currentClassLessonsCopy.filter(e=>e.name!=name);
            setCurrentClass({
                name:currentClass.name,
                lessons:[...withoutCurrentLesson,{
                    name,
                    teacher,
                    rooms,
                    color,
                    amount:lessonsAmountRef.current.value

                }]
            })
        }
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
            <button type="button" onClick={saveSchoolPlan}>ready?</button>
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
