import React from 'react'

export default function ElementsList({names, onRemove}) {
  return (
      names.map((name,i)=>{
          return <div key={i}>{name}<span onClick={()=>{onRemove(name)}}>❌</span></div>
      })
  )
}
