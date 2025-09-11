import React from "react";

const Maintenance: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          🚧 Site Under Maintenance 🚧
        </h1>
        <p className="text-gray-600 mb-2">
          This website is currently unavailable.
        </p>
        <p className="text-gray-600">
          Please contact your developer for more information.
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
