import React from 'react';
import RoleBadge from './RoleBadge';
import DeleteButton from './DeleteButton';

const UsersTable = ({ users, onDelete, userId, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Created At</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => {
              const created = u.createdAt ? new Date(u.createdAt) : null;
              const isSelf = userId && u._id && userId.toString() === u._id.toString();
              return (
                <tr
                  key={u._id}
                  className={`border-b transition
                    ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{created ? created.toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    {isSelf ? (
                      <span className="text-xs text-gray-400 font-medium">Current user</span>
                    ) : (
                      <DeleteButton onDelete={() => onDelete(u._id)} disabled={loading} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;

