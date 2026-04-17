import React from 'react';

const tabOrder = ['all', 'students', 'alumni', 'admins'];

const labelForTab = (tab) => {
  if (tab === 'all') return 'All';
  if (tab === 'students') return 'Students';
  if (tab === 'alumni') return 'Alumni';
  if (tab === 'admins') return 'Admins';
  return tab;
};

const UserFilterTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-1 bg-white">
      <div className="flex flex-wrap gap-2">
        {tabOrder.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${
                activeTab === tab
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-transparent text-gray-700 hover:bg-gray-100'
              }`}
          >
            {labelForTab(tab)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserFilterTabs;

