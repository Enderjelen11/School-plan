import React from 'react'

function invertColor(hex, bw) {
    function padZero(str, len) {
        len = len || 2;
        var zeros = new Array(len).join('0');
        return (zeros + str).slice(-len);
    }
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

function LessonBox({color,children,onClick}){
    const boxstyle={
        background:color,
        color:invertColor(color,true),
        borderRadius: '15px',
        padding: '10px',
        display:'inline-block'
    }
    return <button onClick={onClick} style={boxstyle}>{children}</button>
}

export default function LessonsList({lessons, selectLesson, plusClicked}) {
    return (
        <div>{[...lessons.map((lesson,i)=>{
            return  <LessonBox key={`b${i}`} onClick={()=>{selectLesson(lesson.name)}} color={lesson.color}>{lesson.name}</LessonBox>
        }),
            <LessonBox key="add" onClick={plusClicked} color="#aa42f5">+</LessonBox>
        ]}</div>
    )
}