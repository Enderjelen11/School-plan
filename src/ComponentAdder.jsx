import React, { useRef, useState } from 'react'
import ElementsList from './ElementsList.jsx'
import {BaseDirectory, readTextFile, writeFile} from '@tauri-apps/api/fs';

let loadedSaved = false;

function ComponentAdder({ onFinished, componentName}) {    
    const [elements, changeElements] = useState([]);
    
    if(!loadedSaved){
        readTextFile(`${componentName}.json`, { dir: BaseDirectory.AppData}).then(r=>{
            changeElements(JSON.parse(r));
            loadedSaved=true;
        });
    }
    
    const inputRef = useRef();

    function addElement(){
        const input = inputRef.current.value;
        changeElements(p=>[...p,input]);
        inputRef.current.value = null;
    }

    function removeElement(byName){
        changeElements(p=>p.filter(e=>e!=byName));
    }

    function finish(){
        writeFile(
            {
                contents: JSON.stringify(elements),
                path: `${componentName}.json`,
            },
            {
                dir: BaseDirectory.AppData,
            }
        );
        loadedSaved = false;
        onFinished();
    }

    return (
        <>
            <div><font size="+2">{componentName}:</font></div>
            <ElementsList names={elements} onRemove={removeElement}/>
            <input ref={inputRef} type="text"></input>
            <button onClick={addElement}>Add</button>
            <br></br>    
            <button onClick={finish}>Save</button>
        </>
    )
}

export default ComponentAdder; 
