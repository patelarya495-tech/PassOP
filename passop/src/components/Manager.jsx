import React from 'react'
import { useRef, useState, useEffect } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { v4 as uuidv4 } from "uuid";


import 'react-toastify/dist/ReactToastify.css';



const Manager = () => {
    const API_URL = import.meta.env.VITE_API_URL
    const [showSavedPasswords, setShowSavedPasswords] = useState(false)
    const ref = useRef()
    const passwordRef = useRef()
    const [form, setform] = useState({ site: "", username: "", password: "" })
    const [passwordArray, setPasswordArray] = useState([])
    const [errors, setErrors] = useState({})

    useEffect(() => {
        const getPasswords = async () => {
            let req = await fetch("https://passop-production-fff9.up.railway.app")
            let passwords = await req.json()
            setPasswordArray(passwords)
        }
        getPasswords()
    }, [])

    const copyText = (text) => {
        toast('Copied to clipboard!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce
        });
        navigator.clipboard.writeText(text)
    }

    const showPassword = () => {
        if (ref.current.src.includes("icons/eyecross.png")) {
            ref.current.src = "icons/eye.png"
            passwordRef.current.type = "text"
        } else {
            ref.current.src = "icons/eyecross.png"
            passwordRef.current.type = "password"
        }
    }

    const savePassword = async () => {
        const newErrors = {}
        if (!form.site.trim()) newErrors.site = "Website URL is required"
        if (!form.username.trim()) newErrors.username = "Username is required"
        if (!form.password.trim()) newErrors.password = "Password is required"

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }
        setErrors({})

        if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {
            const response = await fetch("https://passop-production-fff9.up.railway.app", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, id: uuidv4() }),
            })
            const data = await response.json()
            console.log("POST RESPONSE:", data)

            let req = await fetch("https://passop-production-fff9.up.railway.app")
            let passwords = await req.json()
            setPasswordArray(passwords)
            setform({ site: "", username: "", password: "" })
            toast('Password saved!')
        } else {
            toast('Error: Password not saved!')
        }
    }

    const deletePassword = async (id) => {
        let c = confirm("Do you really want to delete this password?")
        if (c) {
            await fetch("https://passop-production-fff9.up.railway.app", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            })
            let req = await fetch("https://passop-production-fff9.up.railway.app")
            let passwords = await req.json()
            setPasswordArray(passwords)
            toast('Password Deleted!', {
                position: "top-right",
                autoClose: 5000,
                theme: "dark",
                transition: Bounce
            })
        }
    }

    const editPassword = async (id) => {
        let passwordToEdit = passwordArray.find(item => item.id === id)
        setform(passwordToEdit)
        await fetch("https://passop-production-fff9.up.railway.app", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
        let req = await fetch("https://passop-production-fff9.up.railway.app")
        let passwords = await req.json()
        setPasswordArray(passwords)
    }

    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />

            <div className="absolute inset-0 -z-10 h-full w-full bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-green-400 opacity-20 blur-[100px]"></div>
            </div>

            <div className="mycontainer min-h-[88.2vh] py-6">
                <h1 className='text-2xl md:text-4xl font-bold text-center'>
                    <span className='text-green-500'> &lt;</span>
                    <span>Pass</span><span className='text-green-500'>OP/&gt;</span>
                </h1>
                <p className='text-green-900 text-sm md:text-lg text-center'>Your own Password Manager</p>

                <div className="flex flex-col p-4 text-black gap-8 items-center">
                    <div className="w-full">
                        <input
                            value={form.site}
                            onChange={handleChange}
                            placeholder='Enter website URL'
                            className='rounded-full border border-green-500 w-full p-4 py-1'
                            type="text"
                            name="site"
                            id="site"
                        />
                        {errors.site && (
                            <p className="text-red-500 text-sm mt-1 ml-2">{errors.site}</p>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row w-full gap-8">
                        <div className="w-full md:flex-1">
                            <input
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Enter Username"
                                className="rounded-full border border-green-500 w-full p-4 py-1"
                                type="text"
                                name="username"
                                id="username"
                            />
                            {errors.username && (
                                <p className="text-red-500 text-sm mt-1 ml-2">{errors.username}</p>
                            )}
                        </div>

                        <div className="w-full md:w-[35%]">
                            <div className="relative">
                                <input
                                    ref={passwordRef}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter Password"
                                    className="rounded-full border border-green-500 w-full p-4 py-1"
                                    type="password"
                                    name="password"
                                    id="password"
                                />
                                <span className="absolute right-[3px] top-[4px] cursor-pointer" onClick={showPassword}>
                                    <img ref={ref} className="p-1" width={26} src="icons/eye.png" alt="eye" />
                                </span>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1 ml-2">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={savePassword}
                        className='text-black flex justify-center items-center gap-2 bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-fit border border-green-900'
                    >
                        <lord-icon src="https://cdn.lordicon.com/efxgwrkc.json" trigger="hover"></lord-icon>
                        Save Password
                    </button>
                </div>

                <div className="passwords">
                    <h2 className='font-bold text-2xl py-4'>Your Passwords</h2>
                    <button
                        onClick={() => setShowSavedPasswords(!showSavedPasswords)}
                        className="mb-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        {showSavedPasswords ? "Hide Passwords" : "Show Passwords"}
                    </button>
                    {passwordArray.length === 0 && <div>No passwords to show</div>}
                    {passwordArray.length !== 0 &&
                        <div className="overflow-x-auto rounded-md mb-10">
                            <table className="pass-table table-auto w-full min-w-[500px] rounded-md overflow-hidden text-xs md:text-sm lg:text-base">
                                <thead className='bg-green-800 text-white'>
                                    <tr>
                                        <th className='py-2 px-3 text-left'>Site</th>
                                        <th className='py-2 px-3 text-left'>Username</th>
                                        <th className='py-2 px-3 text-left'>Password</th>
                                        <th className='py-2 px-3 text-center'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='bg-green-100'>
                                    {passwordArray.map((item, index) => (
                                        <tr key={index}>
                                            <td className="py-2 px-3 border border-white">
                                                <div className='pass-cell-content'>
                                                    <a
                                                        href={item.site}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="pass-cell-text text-blue-700 hover:underline"
                                                        title={item.site}
                                                    >
                                                        {item.site}
                                                    </a>
                                                    <div className='lordiconcopy size-7 cursor-pointer flex-shrink-0' onClick={() => copyText(item.site)}>
                                                        <lord-icon
                                                            style={{ width: "22px", height: "22px", paddingTop: "3px", paddingLeft: "3px" }}
                                                            src="https://cdn.lordicon.com/iykgtsbt.json"
                                                            trigger="hover">
                                                        </lord-icon>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='py-2 px-3 border border-white'>
                                                <div className='pass-cell-content'>
                                                    <span className="pass-cell-text" title={item.username}>{item.username}</span>
                                                    <div className='lordiconcopy size-7 cursor-pointer flex-shrink-0' onClick={() => copyText(item.username)}>
                                                        <lord-icon
                                                            style={{ width: "22px", height: "22px", paddingTop: "3px", paddingLeft: "3px" }}
                                                            src="https://cdn.lordicon.com/iykgtsbt.json"
                                                            trigger="hover">
                                                        </lord-icon>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='py-2 px-3 border border-white'>
                                                <div className='pass-cell-content'>
                                                    <span className="pass-cell-text" title={item.password}>
                                                        {showSavedPasswords
                                                            ? item.password
                                                            : "•".repeat(item.password.length)}
                                                    </span>                                                    <div className='lordiconcopy size-7 cursor-pointer flex-shrink-0' onClick={() => copyText(item.password)}>
                                                        <lord-icon
                                                            style={{ width: "22px", height: "22px", paddingTop: "3px", paddingLeft: "3px" }}
                                                            src="https://cdn.lordicon.com/iykgtsbt.json"
                                                            trigger="hover">
                                                        </lord-icon>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='py-2 px-3 border border-white text-center'>
                                                <span className='cursor-pointer mx-1 inline-block' onClick={() => editPassword(item.id)}>
                                                    <lord-icon
                                                        src="https://cdn.lordicon.com/gwlusjdu.json"
                                                        trigger="hover"
                                                        style={{ width: "22px", height: "22px" }}>
                                                    </lord-icon>
                                                </span>
                                                <span className='cursor-pointer mx-1 inline-block' onClick={() => deletePassword(item.id)}>
                                                    <lord-icon
                                                        src="https://cdn.lordicon.com/xyfswyxf.json"
                                                        trigger="hover"
                                                        style={{ width: "22px", height: "22px" }}>
                                                    </lord-icon>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}

export default Manager