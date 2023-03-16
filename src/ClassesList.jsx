import React from 'react'

export default function ClassesList({classes,onSelect}) {
  return (
      classes.map((classSEL,i)=>{
        return <p key={i} onClick={()=>{onSelect(classSEL)}}>{classSEL.name}</p>
      })
  )
}
