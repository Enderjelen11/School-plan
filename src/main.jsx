import React from 'react'
import ReactDOM from 'react-dom/client'
import ComponentAdder from './ComponentAdder.jsx'

const root = ReactDOM.createRoot(document.getElementById('root'));

function renderComponentAdders(names,onFinish){
    function render(name,next){
        root.render(
          <React.StrictMode>
            <ComponentAdder componentName={name} onFinished={next}/>
          </React.StrictMode>,
        )
    }

    let string = "("

    for(let i = 0; i<names.length; i++){
        string=string+`()=>{render(names[${i}],`;
    }

    string = string + '()=>{onFinish()}'

    for(let i = 0; i<names.length; i++){
        string=string+')}';
    }

    eval(string+')()')
}

//going to the end will couse an error for now
renderComponentAdders(['Rooms','Subjects','Teachers'])
