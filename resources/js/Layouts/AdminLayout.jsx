import React, { useState, useEffect } from "react";
import { Link, usePage, useForm } from "@inertiajs/react";
import { Menu, Home, Box, Eye, FileText, ShoppingCart, Moon, Sun, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import Dropdown from "@/Components/Dropdown";

export default function BuyerLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });

    const { auth } = usePage().props;
    const { post } = useForm();

    // Toggle Dark Mode and persist preference
    const toggleDarkMode = () => {
        setDarkMode((prev) => {
            localStorage.setItem("darkMode", !prev);
            document.documentElement.classList.toggle("dark", !prev);
            return !prev;
        });
    };

    // Logout Function
    const handleLogout = () => {
        post(route("logout"));
    };

    // Sidebar Navigation Links
    const navLinks = [
        { name: "Dashboard", href: route("buyer.dashboard"), icon: <Home size={24} /> },
        { name: "Browse Assets", href: route("buyer.assets.index"), icon: <ShoppingCart size={24} /> },
        { name: "Watchlist", href: "/api/watchlist", icon: <Eye size={24} /> },
        { name: "Transactions", href: "/api/transactions", icon: <FileText size={24} /> },
    ];

    return (
        <div className={`flex h-screen ${darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
            {/* Sidebar */}
            <motion.aside
                animate={{ width: sidebarCollapsed ? 80 : 250 }}
                transition={{ duration: 0.3 }}
                className={`fixed h-screen bg-white shadow-md flex flex-col border-r transition-all ${
                    darkMode ? "border-gray-800 bg-gray-800 text-white" : "border-gray-200"
                }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-4 py-4">
                    {!sidebarCollapsed && <h1 className="text-lg font-bold">Asset Soko</h1>}
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-md hover:bg-gray-200 transition">
                        <Menu size={24} />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="mt-4 flex flex-col space-y-2">
                    {navLinks.map(({ name, href, icon }) => (
                        <Link
                            key={name}
                            href={href}
                            className="flex items-center px-4 py-3 rounded-md hover:bg-gray-200 transition"
                        >
                            {icon}
                            {!sidebarCollapsed && <span className="ml-3">{name}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Dark Mode Toggle */}
                <button onClick={toggleDarkMode} className="mt-auto px-4 py-3 flex items-center">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    {!sidebarCollapsed && <span className="ml-3">Dark Mode</span>}
                </button>
            </motion.aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
                {/* Navbar */}
                <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
                    {/* Left Side: Toggle Button */}
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-md hover:bg-gray-200 transition">
                        <Menu size={24} />
                    </button>

                    {/* Right Side: User Profile */}
                    <div className="flex items-center space-x-4">
                        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 transition">
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* User Profile Dropdown */}
                        {auth?.user && (
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-200 transition">
                                        <User size={20} className="mr-2" />
                                        {auth.user.name}
                                        <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route("profile.edit")}>
                                        <User size={16} className="mr-2" /> Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route("logout")} method="post" as="button">
                                        <LogOut size={16} className="mr-2" /> Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        )}
                    </div>
                </nav>

                {/* Page Content */}
                <div className="mt-16 p-6 overflow-y-auto h-[calc(100vh-64px)]">
                    {children}
                </div>
            </div>
        </div>
    );
}
