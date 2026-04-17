import React from 'react';

const RoleBadge = ({ role }) => {
  const normalized = role === 'student' ? 'Student' : role === 'alumni' ? 'Alumni' : role === 'admin' ? 'Admin' : role;

  const badgeClass =
    role === 'admin'
      ? 'bg-red-100 text-red-700'
      : role === 'alumni'
        ? 'bg-blue-100 text-blue-700'
        : role === 'student'
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${badgeClass}`}>
      {normalized}
    </span>
  );
};

export default RoleBadge;

