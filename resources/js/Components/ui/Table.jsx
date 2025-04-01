import React from "react";

export const Table = ({ children, className = "" }) => {
  return (
    <div className="w-full overflow-x-auto"> {/* Fix horizontal scrolling */}
      <table className={`w-full text-sm text-left text-gray-900 ${className}`}>{children}</table>
    </div>
  );
};

export const TableHeader = ({ children }) => {
  return <thead className="bg-gray-100 text-gray-700 uppercase text-xs">{children}</thead>;
};

export const TableHead = ({ children, className = "" }) => {
  return <th className={`px-4 py-3 text-left font-medium ${className}`}>{children}</th>;
};

export const TableRow = ({ children, className = "" }) => {
  return <tr className={`border-b hover:bg-gray-50 ${className}`}>{children}</tr>;
};

export const TableBody = ({ children }) => {
  return <tbody className="divide-y">{children}</tbody>;
};

export const TableCell = ({ children, className = "" }) => {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
};
