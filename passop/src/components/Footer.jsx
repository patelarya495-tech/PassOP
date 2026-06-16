import React from 'react'

const Footer = () => {
    return (
        <footer className="bg-slate-800 text-white py-4 mt-10">
            <div className="container mx-auto px-6 flex justify-between items-center">

                
                <div className="logo font-bold text-lg md:text-2xl">
                    <span className="text-green-500">&lt;</span>
                    <span>Pass</span>
                    <span className="text-green-500">OP/&gt;</span>
                </div>

                
                <div className="text-right text-balance md:inline">
                    <p className="text-sm text-gray-400">
                        © 2026 PassOP. All Rights Reserved.
                    </p>

                    <p className="text-sm text-green-400 md:inline">
                        Protecting your digital life, one password at a time.
                    </p>
                </div>

            </div>
        </footer>

    )
}

export default Footer
