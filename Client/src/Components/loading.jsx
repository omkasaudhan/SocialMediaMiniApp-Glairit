import React from 'react'

const loading = ({height = "100vh"}) => {
  return (
    <div style={{ height }} className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 rounded-full border-3 border-indigo-500 border-t-transparentanimate-spin">
          loading...
        </div>
    </div>
  )
}

export default loading