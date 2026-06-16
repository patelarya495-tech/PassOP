import React from 'react'
import { useRef, useState, useEffect } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/clerk-react";

import 'react-toastify/dist/ReactToastify.css';

const getPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1)
        return { text: "Weak", color: "bg-red-500", width: "w-1/3" };

    if (score <= 3)
        return { text: "Medium", color: "bg-yellow-500", width: "w-2/3" };

    return { text: "Strong", color: "bg-green-500", width: "w-full" };
};

const checkBreach = async (password) => {
    if (!password) return "Not Checked";

    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();

    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await res.text();

    return text.includes(suffix)
        ? "⚠ Breached Password"
        : "✅ Safe Password";
};



const Manager = () => {
    const { user } = useUser();
    const API_URL = import.meta.env.VITE_API_URL
    console.log("API_URL =", API_URL)
    const [showSavedPasswords, setShowSavedPasswords] = useState(false)
    const ref = useRef()
    const [showPasswordState, setShowPasswordState] = useState(false)
    const passwordRef = useRef()
    const [form, setform] = useState({ site: "", username: "", password: "", id: "" })
    const [passwordArray, setPasswordArray] = useState([])
    const [errors, setErrors] = useState({})
    const [breachStatus, setBreachStatus] = useState("");

    // ✅ FIX: editId alag state mein rakho taaki savePassword mein closure issue na ho
    const [editId, setEditId] = useState("")

    useEffect(() => {
        const getPasswords = async () => {
            if (!user) return

            let req = await fetch(
                `https://passop-production-fff9.up.railway.app?userId=${user.id}`
            )
            let passwords = await req.json()
            setPasswordArray(passwords)
        }
        getPasswords()
    }, [user])

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

    const savePassword = async () => {
        if (!user) {
            toast.error("Please login first");
            return;
        }
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

            // ✅ FIX: editId state se lo (form.id se nahi) — closure issue avoid hota hai
            // Agar edit mode mein hai to wahi purana id use karo, warna naya banao
            const passwordId = editId ? editId : uuidv4()
            console.log("CURRENT editId:", editId)
            console.log("FORM:", form)
            const isEditing = Boolean(editId)

            const payload = {
                site: form.site,
                username: form.username,
                password: form.password,
                id: passwordId,
                userId: user.id,
                updatedAt: new Date().toLocaleString()
            }

            console.log("SAVING PAYLOAD:", payload)
            console.log("IS EDITING:", isEditing, "| passwordId:", passwordId)

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            console.log("POST RESPONSE:", data)

            let req = await fetch(
                `${API_URL}?userId=${user.id}`
            )
            let passwords = await req.json()
            setPasswordArray(passwords)

            // ✅ FIX: Form aur editId dono reset karo
            setform({ site: "", username: "", password: "", id: "" })
            setEditId("")

            toast(isEditing ? 'Password updated!' : 'Password saved!')
        } else {
            toast('Error: Password not saved!')
        }
    }

    const deletePassword = async (id) => {
        let c = confirm("Do you really want to delete this password?")
        if (c) {
            await fetch(API_URL, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            })
            let req = await fetch(
                `${API_URL}?userId=${user?.id}`
            )
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

    // ✅ FIX: editId alag state mein set karo
    const editPassword = async (id) => {
        let passwordToEdit = passwordArray.find(item => item.id === id)
        if (!passwordToEdit) return

        console.log("EDIT DATA:", passwordToEdit)

        // MongoDB ka _id field hata do, baaki sab rakho
        const { _id, ...formData } = passwordToEdit

        setform({
            site: formData.site,
            username: formData.username,
            password: formData.password,
            id: formData.id
        })

        // ✅ FIX: editId alag se set karo — yahi ensure karega ki update hoga, naya record nahi banega
        setEditId(formData.id)
        console.log("EDIT ID SET:", formData.id)

        // Page ke upar scroll karo
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const generatePassword = () => {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

        let password = "";

        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        setform({ ...form, password });
    };

    const handleChange = async (e) => {
        const updatedForm = {
            ...form,
            [e.target.name]: e.target.value,
        };

        setform(updatedForm);

        if (e.target.name === "password") {
            const result = await checkBreach(e.target.value);
            setBreachStatus(result);
        }
    };

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
                                    type={showPasswordState ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    maxLength={64}
                                />

                                <div className="mt-2">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`${getPasswordStrength(form.password).color} ${getPasswordStrength(form.password).width} h-full transition-all duration-300`}
                                        ></div>
                                    </div>

                                    <p className="text-sm mt-1 font-medium">
                                        Strength: {getPasswordStrength(form.password).text}
                                    </p>

                                    <p
                                        className={`text-sm font-medium mt-1 ${breachStatus.includes("Breached")
                                            ? "text-red-500"
                                            : "text-green-600"
                                            }`}
                                    >
                                        {breachStatus}
                                    </p>

                                </div>

                                <span className="absolute right-[3px] top-[4px] cursor-pointer" onClick={() => setShowPasswordState(!showPasswordState)}>
                                    <img ref={ref} className="p-1" width={26} src={showPasswordState ? "icons/eye.png" : "icons/eyecross.png"} alt="eye" />
                                </span>

                                <div className="flex justify-center mt-3">
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="px-5 py-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-all duration-300"
                                    >
                                        Generate Password
                                    </button>
                                </div>

                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1 ml-2">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={savePassword}
                        disabled={!user}
                        className={`text-black flex justify-center items-center gap-2 rounded-full px-8 py-2 w-fit border border-green-900 ${user
                            ? "bg-green-400 hover:bg-green-300"
                            : "bg-gray-300 cursor-not-allowed"
                            }`}
                    >
                        <lord-icon
                            src="https://cdn.lordicon.com/efxgwrkc.json"
                            trigger="hover">
                        </lord-icon>

                        {user ? (editId ? "Update Password" : "Save Password") : "Login Required"}
                    </button>
                </div>

                <div className="passwords">
                    {!user && (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-lg mb-4">
                            Please login to view and manage your passwords.
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
                        <h2 className='font-bold text-2xl'>
                            Your Passwords
                            <span className='text-green-600 text-base ml-2'>
                                ({passwordArray.length})
                            </span>
                        </h2>

                    </div>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search passwords..."
                            className="w-[400px] border border-green-400 rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />

                        <button
                            onClick={() => setShowSavedPasswords(!showSavedPasswords)}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300 whitespace-nowrap"
                        >
                            {showSavedPasswords ? "Hide Passwords" : "Show Passwords"}
                        </button>
                    </div>
                    {passwordArray.length === 0 && <div>No passwords to show</div>}
                    {user && passwordArray.length !== 0 &&
                        <div className="overflow-x-auto rounded-md mb-10">
                            <table className="pass-table table-auto w-full min-w-[500px] rounded-md overflow-hidden text-xs md:text-sm lg:text-base">
                                <thead className='bg-green-800 text-white'>
                                    <tr>
                                        <th className='py-2 px-3 text-left'>Site</th>
                                        <th className='py-2 px-3 text-left'>Username</th>
                                        <th className='py-2 px-3 text-left'>Password</th>
                                        <th className='py-2 px-3 text-left'>Updated</th>
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
                                                    </span>
                                                    <div className='lordiconcopy size-7 cursor-pointer flex-shrink-0' onClick={() => copyText(item.password)}>
                                                        <lord-icon
                                                            style={{ width: "22px", height: "22px", paddingTop: "3px", paddingLeft: "3px" }}
                                                            src="https://cdn.lordicon.com/iykgtsbt.json"
                                                            trigger="hover">
                                                        </lord-icon>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='py-2 px-3 border border-white'>
                                                {item.updatedAt || "N/A"}
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