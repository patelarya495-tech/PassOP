import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Manager from './components/Manager'
import Footer from './components/Footer'
import { Analytics } from '@vercel/analytics/react'

function App() {


  return (
    <>
      <Navbar />
      <div className="bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">

      <Manager />
      </div>
      <Footer />
      <Analytics />
    </>
  )
}

export default App
