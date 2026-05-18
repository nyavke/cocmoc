import { useState, useEffect } from 'react'
import Loader from './components/Loader'
import CosmosScene from './components/CosmosScene'
import WelcomeScreen from './components/WelcomeScreen'
import Cursor from './components/Cursor'

export default function App() {
  const [ready, setReady] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2400)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <Cursor />
      <Loader done={ready} />
      {ready && <CosmosScene entered={entered} />}
      {ready && !entered && <WelcomeScreen onEnter={() => setEntered(true)} />}
    </>
  )
}
