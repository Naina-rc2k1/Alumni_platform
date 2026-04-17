import React from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { GraduationCap, MapPin, Phone } from 'lucide-react';

const AlumniDashboard = () => {
  const { user, loading } = useAuth();

  if (loading || !user) {
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
            <GraduationCap className="h-8 w-8 text-blue-700" /> Alumni Dashboard
          </h1>
          <p className="text-gray-600">Welcome, {user.name}.</p>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div>
              <div className="text-sm font-medium text-gray-500">Full Name</div>
              <div className="text-lg font-semibold text-gray-900">{user.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Email</div>
              <div className="text-lg font-semibold text-gray-900">{user.email}</div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-500">Phone</div>
                <div className="text-gray-900">{user.phone || '-'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-500">Location</div>
                <div className="text-gray-900">{user.location || '-'}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Verification</div>
              <div className="text-gray-900">{user.isVerified ? 'Verified alumni' : 'Not verified yet'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Field of Study</div>
              <div className="text-gray-900">{user.fieldOfStudy || '-'}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AlumniDashboard;

