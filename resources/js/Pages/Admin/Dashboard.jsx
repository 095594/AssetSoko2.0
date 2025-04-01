import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import SalesChart from "@/Components/SalesChart";
import { motion } from "framer-motion";

export default function Dashboard({ totalUsers, totalAssets, totalTransactions, recentActivities }) {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <motion.h1 
                className="text-3xl font-bold mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Dashboard Overview
            </motion.h1>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {[
                    { label: "Total Users", value: totalUsers },
                    { label: "Total Assets", value: totalAssets },
                    { label: "Total Transactions", value: totalTransactions }
                ].map((stat, index) => (
                    <motion.div 
                        key={index} 
                        className="p-6 rounded-xl bg-white shadow-md"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <h2 className="text-lg font-semibold">{stat.label}</h2>
                        <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md mt-6">
                <h3 className="text-xl font-semibold mb-4">Sales Overview</h3>
                <SalesChart salesData={[12000, 19000, 3000, 5000, 2000, 3000]} />
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-md mt-6">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                {recentActivities.length > 0 ? (
                    <ul>
                        {recentActivities.map((activity, index) => (
                            <li key={index} className="border-b py-2">{activity.description}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No recent activity</p>
                )}
            </div>
        </AdminLayout>
    );
}
