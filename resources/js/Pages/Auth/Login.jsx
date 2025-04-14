import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Login({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [validationState, setValidationState] = useState({
        email: { isValid: true, message: '' },
        password: { isValid: true, message: '' }
    });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return { isValid: false, message: 'Email is required' };
        if (!emailRegex.test(email)) return { isValid: false, message: 'Please enter a valid email address' };
        return { isValid: true, message: '' };
    };

    const validatePassword = (password) => {
        if (!password) return { isValid: false, message: 'Password is required' };
        if (password.length < 8) return { isValid: false, message: 'Password must be at least 8 characters' };
        return { isValid: true, message: '' };
    };

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setData('email', email);
        setValidationState(prev => ({
            ...prev,
            email: validateEmail(email)
        }));
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setData('password', password);
        setValidationState(prev => ({
            ...prev,
            password: validatePassword(password)
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        const emailValidation = validateEmail(data.email);
        const passwordValidation = validatePassword(data.password);

        setValidationState({
            email: emailValidation,
            password: passwordValidation
        });

        if (!emailValidation.isValid || !passwordValidation.isValid) return;

        post(route('login'), {
            onSuccess: (response) => {
                const role = response.props.auth?.user?.role;
                if (role === 'buyer') window.location.href = route('buyer.dashboard');
                else if (role === 'seller') window.location.href = route('seller.dashboard');
                else if (role === 'admin') window.location.href = route('admin.dashboard');
            },
            onError: (errors) => console.error(errors)
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            <Head title="Login" />
            {/* Hero Background Image or Video */}
            <video
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                src="/videos/hero-background.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-purple-900 to-gray-900 opacity-70"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 max-w-md w-full space-y-8 bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-2xl"
            >
                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 font-medium text-sm text-green-600"
                    >
                        {status}
                    </motion.div>
                )}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to Asset Soko
                    </h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={submit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${!validationState.email.isValid ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 sm:text-sm`}
                                placeholder="Email address"
                                value={data.email}
                                onChange={handleEmailChange}
                            />
                            {(!validationState.email.isValid || errors.email) && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                                    {errors.email || validationState.email.message}
                                </motion.p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className={`mt-4 appearance-none rounded-lg relative block w-full px-4 py-3 border ${!validationState.password.isValid ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 sm:text-sm`}
                                placeholder="Password"
                                value={data.password}
                                onChange={handlePasswordChange}
                            />
                            {(!validationState.password.isValid || errors.password) && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                                    {errors.password || validationState.password.message}
                                </motion.p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center">
                            <input
                                id="remember_me"
                                name="remember"
                                type="checkbox"
                                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors duration-200"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700 select-none">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link href={route('password.request')} className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200 no-underline">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Testimonials / Partners Section */}
            {/* <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="z-10 mt-16 bg-white/80 p-6 rounded-lg shadow-lg backdrop-blur-sm"
            >
                <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Trusted by Top Companies</h3>
                <div className="flex justify-around space-x-6">
                    <img src="/images/partner1.png" alt="Partner 1" className="h-8 object-contain" />
                    <img src="/images/partner2.png" alt="Partner 2" className="h-8 object-contain" />
                    <img src="/images/partner3.png" alt="Partner 3" className="h-8 object-contain" />
                </div>
            </motion.div> */}
        </div>
    );
}
