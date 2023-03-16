import React, {useState} from 'react'
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

    function toggleAdder(){
        setLesson({
            subject:[],
            teacher:[],
            rooms:[]
        })
        setAdder(true);
    }

    const change = {
        subjects:(name)=>{
            setLesson({
                subject:[name],
                teacher:currentLesson.teacher,
                rooms:currentLesson.rooms
            })
        },
        teachers:(name)=>{
            setLesson({
                subject:currentLesson.subject,
                teacher:[name],
                rooms:currentLesson.rooms
            })
        },
        rooms:(name)=>{
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
        }
    }

    function selectLesson(name){
        const lesson = currentClass.lessons.find(e=>e.name==name);
        setLesson({
            subject:[name],
            teacher:[lesson.teacher],
            rooms:lesson.rooms
        })
        setAdder(true);
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
                    color
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
                    color
                }]
            })
        }
    }

    function ComponentMenu(){
        if(adder){
            return <div>
                <div>
                    <ComponetCheckerList onChange={change.subjects} selected={currentLesson.subject} title="Subjects">{subjects}</ComponetCheckerList>
                    <ComponetCheckerList onChange={change.teachers} selected={currentLesson.teacher} title="Teachers">{teachers}</ComponetCheckerList>
                    <ComponetCheckerList onChange={change.rooms} selected={currentLesson.rooms} title="Rooms">{rooms}</ComponetCheckerList>
                </div>
                <button onClick={saveCurrentLesson}>save</button>
                </div>
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
            <ComponentMenu/>
        </div>
      </>
    )
}
