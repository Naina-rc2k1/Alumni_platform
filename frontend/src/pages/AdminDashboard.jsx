import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Shield, GraduationCap, Users as UsersIcon } from 'lucide-react';
import { adminApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/admin/DashboardLayout';
import StatsCard from '../components/admin/StatsCard';
import UserFilterTabs from '../components/admin/UserFilterTabs';
import SearchBar from '../components/admin/SearchBar';
import UsersTable from '../components/admin/UsersTable';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // all|students|alumni|admins
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getUsers();
      setUsers(response.data?.data || []);
    } catch (err) {
      setUsers([]);
      setError(err?.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const students = users.filter((u) => u.role === 'student').length;
    const alumni = users.filter((u) => u.role === 'alumni').length;
    return {
      total: users.length,
      students,
      alumni,
    };
  }, [users]);

  const computedFilteredUsers = useMemo(() => {
    let list = users;

    if (activeTab === 'students') list = list.filter((u) => u.role === 'student');
    if (activeTab === 'alumni') list = list.filter((u) => u.role === 'alumni');
    if (activeTab === 'admins') list = list.filter((u) => u.role === 'admin');

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [users, activeTab, searchTerm]);

  // Keep filteredUsers state as requested (in addition to memo).
  useEffect(() => {
    setFilteredUsers(computedFilteredUsers);
  }, [computedFilteredUsers]);

  const handleDeleteUser = async (userId) => {
    try {
      await adminApi.deleteUser(userId);
      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  const empty = !loading && filteredUsers.length === 0;

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Manage and monitor platform users"
      icon={<Shield className="h-8 w-8 text-blue-700" />}
    >
      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Users" value={counts.total} icon={<UsersIcon className="h-5 w-5" />} />
        <StatsCard title="Students" value={counts.students} icon={<GraduationCap className="h-5 w-5" />} />
        <StatsCard title="Alumni" value={counts.alumni} icon={<GraduationCap className="h-5 w-5" />} />
      </section>

      {/* Tabs + Search */}
      <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <UserFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="w-full lg:w-80">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by name or email" />
        </div>
      </section>

      {/* Error */}
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      ) : null}

      {/* Users */}
      {loading ? (
        <div className="bg-white shadow-sm rounded-xl p-6">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/6 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : empty ? (
        <div className="bg-white shadow-sm rounded-xl p-10 text-center">
          <div className="text-sm text-gray-600 font-medium">No users found</div>
        </div>
      ) : (
        <UsersTable users={filteredUsers} onDelete={handleDeleteUser} userId={user?._id} loading={loading} />
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;

