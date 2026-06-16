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
        <div className="flex items-center gap-4">

  <a
    href="https://github.com/patelarya495-tech/PassOP"
    target="_blank"
    rel="noreferrer"
   className='h-11 w-[120px] text-white bg-green-700 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:bg-green-600 hover:scale-105'
  >
    <img
      className='invert w-5 p-0'
      src="icons/github.svg"
      alt="github logo"
    />
    <span className='font-semibold text-sm'>
      GitHub
    </span>
  </a>

  <SignedOut>
    <SignInButton mode="modal">
      <button className="h-11 w-[105px] bg-white text-black rounded-full font-semibold flex items-center justify-center transition-all duration-300 hover:bg-gray-200 hover:scale-105">
        Login
      </button>
    </SignInButton>
  </SignedOut>

  <SignedIn>
    <div className="h-11 w-11 flex items-center justify-center rounded-full overflow-hidden ring-2 ring-green-500">
  <UserButton
    afterSignOutUrl="/"
    appearance={{
      elements: {
        avatarBox: "h-11 w-11"
      }
    }}
  />
</div>
  </SignedIn>

</div>
</div>

    </nav>
  )
}

export default Navbar
