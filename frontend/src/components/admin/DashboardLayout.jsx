import React from 'react';

const DashboardLayout = ({ title, subtitle, icon, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            {icon ? <div className="text-blue-600">{icon}</div> : null}
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
          {subtitle ? <p className="text-gray-600">{subtitle}</p> : null}
        </header>

        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;

