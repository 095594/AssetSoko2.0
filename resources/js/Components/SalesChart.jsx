import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function SalesChart({ salesData }) {
    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Sales",
                data: salesData,
                borderColor: "rgba(79, 70, 229, 1)", // Indigo
                backgroundColor: "rgba(79, 70, 229, 0.1)", // Lighter indigo
                borderWidth: 2,
                pointBackgroundColor: "rgba(79, 70, 229, 1)",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(79, 70, 229, 1)",
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Prevent chart from overflowing
        plugins: {
            legend: {
                display: false, // Hide legend
            },
            title: {
                display: false, // Hide title
            },
        },
        scales: {
            x: {
                grid: {
                    display: false, // Hide x-axis grid lines
                },
            },
            y: {
                grid: {
                    color: "rgba(0, 0, 0, 0.05)", // Light gray grid lines
                },
            },
        },
    };

    return (
        <div className="overflow-hidden h-64"> {/* Prevents overflow */}
            <Line data={data} options={options} />
        </div>
    );
}
