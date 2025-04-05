import React, { useState, useEffect } from "react";
import { Link, usePage, useForm } from "@inertiajs/react";
import { Menu, Home, Box, FileText, Moon, Sun, LogOut, User, BarChart2, Users, Settings, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Dropdown from "@/Components/Dropdown";

export default function AdminLayout({ children }) {
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

    // Sidebar Navigation Links
    const navLinks = [
        { name: "Dashboard", href: route("admin.dashboard"), icon: <Home size={20} /> },
        { name: "Assets", href: route("admin.assets.index"), icon: <Box size={20} /> },
        { name: "Users", href: route("admin.users.index"), icon: <Users size={20} /> },
        { name: "Orders", href: route("admin.orders.index"), icon: <FileText size={20} /> },
        { name: "Reports", href: route("admin.reports.index"), icon: <BarChart2 size={20} /> },
        { name: "Settings", href: route("admin.settings.index"), icon: <Settings size={20} /> },
    ];

    return (
        <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
            {/* Sidebar */}
            <motion.div 
                className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 fixed h-full z-50`}
                initial={{ x: 0 }}
                animate={{ x: 0 }}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    {!sidebarCollapsed && (
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">AssetSoko</h1>
                    )}
                    <button 
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
                        ) : (
                            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        )}
                    </button>
                </div>
                <nav className="mt-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 no-underline ${
                                route().current(link.href) 
                                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-r-4 border-blue-600 dark:border-blue-400' 
                                    : 'text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            <span className="flex-shrink-0">{link.icon}</span>
                            {!sidebarCollapsed && (
                                <span className="ml-4 font-medium">{link.name}</span>
                            )}
                        </Link>
                    ))}
                </nav>
            </motion.div>

            {/* Main Content */}
            <div className={`flex-1 overflow-auto ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
                    <div className="flex items-center justify-between px-6 py-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Dashboard</h2>
                        <div className="flex items-center space-x-6">
                            <button 
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                                {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600" />}
                    </button>

                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative">
                                <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    3
                                </span>
                        </button>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <div className="flex items-center space-x-2 cursor-pointer">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                            {auth.user.name.charAt(0)}
                                        </div>
                                        <div className="hidden md:block">
                                            <div className="text-sm font-medium text-gray-800 dark:text-white">
                                        {auth.user.name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {auth.user.role}
                                            </div>
                                        </div>
                                    </div>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
