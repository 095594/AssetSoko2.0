import React from "react";

const Input = React.forwardRef(({ className = "", ...props }, ref) => {
    return (
        <input
            {...props}
            ref={ref}
            className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        />
    );
});

Input.displayName = "Input";

export { Input }; 