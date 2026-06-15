import React from 'react'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton
} from "@clerk/clerk-react";


const Navbar = () => {
  return (
    <nav className='bg-slate-800 text-white'>
      <div className="mycontainer flex justify-between items-center px-4 py-5 h-14">

        <div className="logo font-bold text-white text-xl md:text-2xl">
          <span className='text-green-500'> &lt;</span>

          <span>Pass</span><span className='text-green-500' >OP/&gt;</span>


        </div>
        {/* <ul>
          <li className='flex gap-4'>
            <a className='hover:font-bold' href="#">Home</a>
            <a className='hover:font-bold' href="#">About</a>
            <a className='hover:font-bold' href="#">Contact</a>
          </li>
        </ul> */}
        <button className='text-white bg-green-700 rounded-full flex justify-between items-center ring-white ring-1 px-2 py-1'>
          <img
            className='invert w-8 md:w-10 p-1'
            src="icons/github.svg"
            alt="github logo"
          />
          <span className='font-bold text-sm md:text-base px-2'>
            GitHub
          </span>
        </button>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-green-700 text-white px-4 py-2 rounded-full">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

    </nav>
  )
}

export default Navbar
