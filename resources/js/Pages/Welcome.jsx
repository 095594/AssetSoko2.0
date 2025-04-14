import React from 'react';
import { Link } from '@inertiajs/inertia-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Welcome() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-gray-800 font-['Inter']">
            {/* Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 70 }}
                className={`fixed w-full top-0 z-50 transition-all duration-300 ${
                    scrolled 
                    ? 'bg-white/80 backdrop-blur-lg shadow-lg' 
                    : 'bg-transparent'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center space-x-2"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <h1 className={`text-xl font-bold ${scrolled ? 'text-gray-800' : 'text-white'}`}>Asset Soko</h1>
                    </motion.div>
                    <div className="flex items-center space-x-6">
                        <Link
                            href="/login"
                            className={`font-medium transition-colors no-underline ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/90 hover:text-white'}`}
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 no-underline"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
                    <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                
                {/* Floating Elements */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                    className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, -5, 5, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                    className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"
                />

                {/* Content */}
                <div className="relative z-10 container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200">
                            Welcome to Asset Soko
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            A trusted marketplace for smart asset disposal, procurement, and bidding.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/register"
                                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-indigo-500/50 transition-all duration-200 transform hover:-translate-y-0.5 w-full sm:w-auto no-underline"
                            >
                                Get Started Now
                            </Link>
                            <Link
                                href="#learn-more"
                                className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/20 transition-all duration-200 w-full sm:w-auto no-underline"
                            >
                                Learn More
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 bg-white/80 backdrop-blur-sm" id="learn-more">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                        >
                            Our Services
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-gray-600"
                        >
                            Discover how we can help transform your asset management experience
                        </motion.p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                title: "Asset Management",
                                desc: "Track and manage your corporate assets efficiently with our comprehensive dashboard and analytics tools.",
                                icon: "fas fa-chart-bar",
                                gradient: "from-blue-500 to-indigo-500"
                            },
                            {
                                title: "Smart Procurement",
                                desc: "Streamline purchasing with our intelligent bidding engine and automated vendor management system.",
                                icon: "fas fa-gavel",
                                gradient: "from-purple-500 to-pink-500"
                            },
                            {
                                title: "Secure Platform",
                                desc: "Enterprise-grade security with end-to-end encryption, audit trails, and compliance monitoring.",
                                icon: "fas fa-shield-alt",
                                gradient: "from-indigo-500 to-purple-500"
                            }
                        ].map((service, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 * i }}
                                whileHover={{ y: -8 }}
                                className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="mb-6">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${service.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <i className={`${service.icon} text-2xl`} />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">{service.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{service.desc}</p>
                                <div className="mt-6">
                                    <Link 
                                        href="#" 
                                        className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors no-underline"
                                    >
                                        Learn more
                                        <i className="fas fa-arrow-right ml-2 text-sm transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-900">
                    <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-30"></div>
                </div>
                <div className="absolute -left-1/4 -top-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
                <div className="absolute -right-1/4 -bottom-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"></div>

                <div className="relative container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                            Ready to Transform Your Asset Management?
                        </h2>
                        <p className="text-xl text-gray-200 mb-10">
                            Join thousands of businesses that trust Asset Soko for their asset disposal and procurement needs.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/register"
                                className="px-8 py-4 bg-white text-indigo-700 font-semibold rounded-lg shadow-lg hover:shadow-white/20 transition-all duration-200 transform hover:-translate-y-1 w-full sm:w-auto no-underline"
                            >
                                Start Free Trial
                            </Link>
                            <Link
                                href="#contact"
                                className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200 w-full sm:w-auto no-underline"
                            >
                                Contact Sales
                    </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        {/* Brand */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">A</span>
                                </div>
                                <h3 className="text-xl font-bold">Asset Soko</h3>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Transforming asset management through innovative technology solutions.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="text-gray-400 hover:text-white transition no-underline">About Us</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-white transition no-underline">Services</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-white transition no-underline">Contact</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="text-gray-400 hover:text-white transition no-underline">Privacy Policy</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-white transition no-underline">Terms of Service</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-white transition no-underline">Cookie Policy</Link></li>
                            </ul>
                        </div>

                        {/* Social */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
                            <div className="flex space-x-4">
                                <a href="#twitter" className="text-gray-400 hover:text-white transition">
                                    <i className="fab fa-twitter text-xl"></i>
                                </a>
                                <a href="#linkedin" className="text-gray-400 hover:text-white transition">
                                    <i className="fab fa-linkedin text-xl"></i>
                                </a>
                                <a href="#facebook" className="text-gray-400 hover:text-white transition">
                                    <i className="fab fa-facebook text-xl"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-400 text-sm">
                                &copy; {new Date().getFullYear()} Asset Soko. All rights reserved.
                            </p>
                            <div className="flex space-x-4 mt-4 md:mt-0">
                                <Link href="#" className="text-gray-400 hover:text-white text-sm transition no-underline">Privacy</Link>
                                <Link href="#" className="text-gray-400 hover:text-white text-sm transition no-underline">Terms</Link>
                                <Link href="#" className="text-gray-400 hover:text-white text-sm transition no-underline">Support</Link>
                            </div>
                        </div>
                </div>
            </div>
            </footer>
        </div>
    );
}