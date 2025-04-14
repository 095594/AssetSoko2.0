import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
    });

    const [validationState, setValidationState] = useState({
        name: { isValid: true, message: '' },
        email: { isValid: true, message: '' },
        password: { isValid: true, message: '' },
        password_confirmation: { isValid: true, message: '' },
        company_name: { isValid: true, message: '' }
    });

    // Validation functions
    const validateName = (name) => {
        if (!name) {
            return { isValid: false, message: 'Name is required' };
        }
        if (name.length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters long' };
        }
        return { isValid: true, message: '' };
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return { isValid: false, message: 'Email is required' };
        }
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }
        return { isValid: true, message: '' };
    };

    const validatePassword = (password) => {
        if (!password) {
            return { isValid: false, message: 'Password is required' };
        }
        if (password.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters' };
        }
        if (!/[A-Z]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!/[a-z]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one lowercase letter' };
        }
        if (!/[0-9]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one number' };
        }
        return { isValid: true, message: '' };
    };

    const validatePasswordConfirmation = (confirmation, password) => {
        if (!confirmation) {
            return { isValid: false, message: 'Please confirm your password' };
        }
        if (confirmation !== password) {
            return { isValid: false, message: 'Passwords do not match' };
        }
        return { isValid: true, message: '' };
    };

    const validateCompanyName = (name) => {
        if (!name) {
            return { isValid: false, message: 'Company name is required' };
        }
        if (name.length < 2) {
            return { isValid: false, message: 'Company name must be at least 2 characters long' };
        }
        return { isValid: true, message: '' };
    };

    // Handle input changes with validation
    const handleChange = (field, value) => {
        setData(field, value);
        
        let validation;
        switch (field) {
            case 'name':
                validation = validateName(value);
                break;
            case 'email':
                validation = validateEmail(value);
                break;
            case 'password':
                validation = validatePassword(value);
                // Also validate password confirmation when password changes
                const confirmValidation = validatePasswordConfirmation(data.password_confirmation, value);
                setValidationState(prev => ({
                    ...prev,
                    password_confirmation: confirmValidation
                }));
                break;
            case 'password_confirmation':
                validation = validatePasswordConfirmation(value, data.password);
                break;
            case 'company_name':
                validation = validateCompanyName(value);
                break;
            default:
                validation = { isValid: true, message: '' };
        }

        setValidationState(prev => ({
            ...prev,
            [field]: validation
        }));
    };

    const submit = (e) => {
        e.preventDefault();

        // Validate all fields before submission
        const validations = {
            name: validateName(data.name),
            email: validateEmail(data.email),
            password: validatePassword(data.password),
            password_confirmation: validatePasswordConfirmation(data.password_confirmation, data.password),
            company_name: validateCompanyName(data.company_name)
        };

        setValidationState(validations);

        // Check if all validations pass
        if (Object.values(validations).some(v => !v.isValid)) {
            return;
        }

        post(route('register'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Register" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-xl">
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4"
                    >
                        <span className="text-white font-bold text-xl">A</span>
                    </motion.div>
                    <h2 className="text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Create your Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join Asset Soko and start managing your assets
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={submit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="sr-only">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className={`block w-full px-4 py-3 rounded-lg border ${!validationState.name.isValid ? 'border-red-500 bg-red-50' : 'border-gray-300'} placeholder-gray-500 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 sm:text-sm`}
                                placeholder="Full Name"
                                value={data.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                            {(!validationState.name.isValid || errors.name) && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm mt-1"
                                >
                                    {errors.name || validationState.name.message}
                                </motion.p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`mt-4 block w-full px-4 py-3 rounded-lg border ${!validationState.email.isValid ? 'border-red-500 bg-red-50' : 'border-gray-300'} placeholder-gray-500 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 sm:text-sm`}
                                placeholder="Email address"
                                value={data.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                            {(!validationState.email.isValid || errors.email) && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm mt-1"
                                >
                                    {errors.email || validationState.email.message}
                                </motion.p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="company_name" className="sr-only">
                                Company Name
                            </label>
                            <input
                                id="company_name"
                                name="company_name"
                                type="text"
                                autoComplete="organization"
                                required
                                className={`mt-4 block w-full px-4 py-3 rounded-lg border ${!validationState.company_name.isValid ? 'border-red-500 bg-red-50' : 'border-gray-300'} placeholder-gray-500 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 sm:text-sm`}
                                placeholder="Company Name"
                                value={data.company_name}
                                onChange={(e) => handleChange('company_name', e.target.value)}
                            />
                            {(!validationState.company_name.isValid || errors.company_name) && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm mt-1"
                                >
                                    {errors.company_name || validationState.company_name.message}
                                </motion.p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className={`mt-4 block w-full px-4 py-3 rounded-lg border ${!validationState.password.isValid ? 'border-red-500 bg-red-50' : 'border-gray-300'} placeholder-gray-500 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 sm:text-sm`}
                                placeholder="Password"
                                value={data.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                            />
                            {(!validationState.password.isValid || errors.password) && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm mt-1"
                                >
                                    {errors.password || validationState.password.message}
                                </motion.p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password_confirmation" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                autoComplete="new-password"
                                required
                                className={`mt-4 block w-full px-4 py-3 rounded-lg border ${!validationState.password_confirmation.isValid ? 'border-red-500 bg-red-50' : 'border-gray-300'} placeholder-gray-500 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 sm:text-sm`}
                                placeholder="Confirm Password"
                                value={data.password_confirmation}
                                onChange={(e) => handleChange('password_confirmation', e.target.value)}
                            />
                            {(!validationState.password_confirmation.isValid || errors.password_confirmation) && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm mt-1"
                                >
                                    {errors.password_confirmation || validationState.password_confirmation.message}
                                </motion.p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:-translate-y-0.5"
                            disabled={processing}
                        >
                            {processing ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </div>

                    <div className="text-sm text-center mt-4">
                        <Link 
                            href={route('login')} 
                            className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200 no-underline"
                        >
                            Already have an account? Login
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}