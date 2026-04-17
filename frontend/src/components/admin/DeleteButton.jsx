import React from 'react';
import { Trash2 } from 'lucide-react';

const DeleteButton = ({ onDelete, disabled }) => {
  const handleClick = () => {
    const confirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
    if (!confirmed) return;
    onDelete();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      aria-label="Delete user"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </button>
  );
};

export default DeleteButton;

