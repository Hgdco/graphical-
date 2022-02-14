import { useState } from 'react'
import './App.css'
import GraphicalRender from './componets/graphical'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <GraphicalRender />
    </div>
  )
}

export default App
