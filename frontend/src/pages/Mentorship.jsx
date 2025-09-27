import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mentorshipApi } from '../api/mentorshipApi';
import { toast } from 'react-toastify';
import { 
  GraduationCap, 
  Users, 
  Clock, 
  MapPin, 
  Plus,
  Trash2,
  CheckCircle,
  MessageCircle,
  Star
} from 'lucide-react';
import Card from '../components/Card';

const Mentorship = () => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, available, my-mentorships, applications
  
  const { user, isAdmin, isAlumni, isStudent } = useAuth();

  useEffect(() => {
    fetchMentorships();
  }, []);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const response = await mentorshipApi.getAll();
      setMentorships(response.data);
    } catch (error) {
      toast.error('Failed to fetch mentorship opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (mentorshipId) => {
    try {
      await mentorshipApi.apply(mentorshipId);
      toast.success('Application submitted successfully');
      fetchMentorships();
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  const handleDelete = async (mentorshipId) => {
    if (window.confirm('Are you sure you want to delete this mentorship opportunity?')) {
      try {
        await mentorshipApi.delete(mentorshipId);
        toast.success('Mentorship opportunity deleted successfully');
        fetchMentorships();
      } catch (error) {
        toast.error('Failed to delete mentorship opportunity');
      }
    }
  };

  const filteredMentorships = mentorships.filter(mentorship => {
    switch (filter) {
      case 'available':
        return mentorship.status === 'open' && mentorship.mentor._id !== user?._id;
      case 'my-mentorships':
        return mentorship.mentor._id === user?._id;
      case 'applications':
        return mentorship.applications?.some(app => app.student._id === user?._id);
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentorship Program</h1>
          <p className="text-gray-600">Connect with experienced alumni for guidance and career development</p>
        </div>

        {/* Filters & Actions */}
        <Card className="mb-8 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Opportunities
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'available' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Available
            </button>
            {isAlumni && (
              <button
                onClick={() => setFilter('my-mentorships')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'my-mentorships' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                My Mentorships
              </button>
            )}
            {isStudent && (
              <button
                onClick={() => setFilter('applications')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'applications' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                My Applications
              </button>
            )}
          </div>

          {(isAlumni || isAdmin) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Mentorship
            </button>
          )}
        </Card>

        {/* Mentorship Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentorships.map((mentorship) => (
            <Card key={mentorship._id} className="hover:shadow-lg transition-shadow p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <GraduationCap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{mentorship.title}</h3>
                      <p className="text-sm text-gray-500">{mentorship.mentor.name}</p>
                    </div>
                  </div>

                  {(isAdmin || mentorship.mentor._id === user?._id) && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(mentorship._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {mentorship.duration} months
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {mentorship.maxMentees} mentees max
                  </div>
                  {mentorship.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {mentorship.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    {mentorship.applications?.length || 0} applications
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    mentorship.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {mentorship.status}
                  </span>
                </div>

                {mentorship.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{mentorship.description}</p>
                )}
              </div>

              <div className="pt-2 border-t flex flex-col gap-2">
                {isStudent && mentorship.status === 'open' && mentorship.mentor._id !== user?._id && (
                  <button
                    onClick={() => handleApply(mentorship._id)}
                    className="w-full btn btn-primary flex items-center justify-center text-sm py-2"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Apply Now
                  </button>
                )}

                {mentorship.mentor._id === user?._id && (
                  <button
                    className="w-full btn btn-outline flex items-center justify-center text-sm py-2"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    View Applications
                  </button>
                )}

                {isStudent && mentorship.applications?.some(app => app.student._id === user?._id) && (
                  <div className="text-center text-sm text-gray-600">Application Submitted</div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredMentorships.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mentorship opportunities found</h3>
            <p className="text-gray-500">Try adjusting your filter or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentorship;
