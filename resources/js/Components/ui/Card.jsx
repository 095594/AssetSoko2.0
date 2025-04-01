import React from "react";
import clsx from "clsx";

export function Card({ children, className }) {
    return (
        <div className={clsx("bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6", className)}>
            {children}
        </div>
    );
}

export function CardContent({ children }) {
    return <div className="p-4">{children}</div>;
}

export function CardHeader({ children }) {
    return <div className="border-b border-gray-200 dark:border-gray-700 p-4 font-semibold">{children}</div>;
}

export function CardTitle({ children }) {
    return <h2 className="text-lg font-bold">{children}</h2>;
}
