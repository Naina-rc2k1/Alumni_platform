import React from 'react';

const StatsCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500 font-medium">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      {icon ? <div className="text-blue-600">{icon}</div> : null}
    </div>
  );
};

export default StatsCard;

