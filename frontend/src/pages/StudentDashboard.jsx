import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { studentDashboardApi } from '../api/authApi';
import Card from '../components/Card';
import { GraduationCap, MapPin, Mail } from 'lucide-react';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const response = await studentDashboardApi.getMe();
      setProfile(response.data?.user || null);
    } catch (error) {
      toast.error('Failed to load your profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-blue-700" /> Current Student Dashboard
          </h1>
          <p className="text-gray-600">Welcome, {profile.name}.</p>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div>
              <div className="text-sm font-medium text-gray-500">Full Name</div>
              <div className="text-lg font-semibold text-gray-900">{profile.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Email</div>
              <div className="text-lg font-semibold text-gray-900">{profile.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Student ID</div>
              <div className="text-gray-900">{profile.studentId || '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Department</div>
              <div className="text-gray-900">{profile.department || '-'}</div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-500">Location</div>
                <div className="text-gray-900">{profile.location || '-'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-500">Role</div>
                <div className="text-gray-900">{profile.role}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;

