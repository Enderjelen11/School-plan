import React, {useState} from 'react'
import {BaseDirectory, readTextFile, writeFile} from '@tauri-apps/api/fs';

let loadedSaved = false;

export default function ComponetCheckerList({selected,onChange,title,children}) {
    return (
        <form style={{display:'inline-block'}}>
            <div><font size="+1">
                <b>{title}</b>
            </font></div>
            {children.map((component,i)=>{
                return <div key={`checkbox${i}`}>
                    {component.name}
                    <input type="checkbox" onChange={()=>{onChange(component.name)}} checked={selected?selected.includes(component.name):false}></input>
                </div>
            })}
        </form>
    )
}
