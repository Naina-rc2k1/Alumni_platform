import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { alumniApi } from '../api/alumniApi';
import { toast } from 'react-toastify';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Building,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import Card from '../components/Card';

const AlumniDirectory = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    graduationYear: '',
    fieldOfStudy: '',
    location: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState(null);
  
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await alumniApi.getAll();
      setAlumni(response.data);
    } catch (error) {
      toast.error('Failed to fetch alumni data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await alumniApi.search(searchTerm);
      setAlumni(response.data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this alumni record?')) {
      try {
        await alumniApi.delete(id);
        toast.success('Alumni record deleted successfully');
        fetchAlumni();
      } catch (error) {
        toast.error('Failed to delete alumni record');
      }
    }
  };

  const filteredAlumni = alumni.filter(alumnus => {
    const matchesSearch = !searchTerm || 
      alumnus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.fieldOfStudy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.currentPosition?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = 
      (!filters.graduationYear || alumnus.graduationYear === filters.graduationYear) &&
      (!filters.fieldOfStudy || alumnus.fieldOfStudy?.toLowerCase().includes(filters.fieldOfStudy.toLowerCase())) &&
      (!filters.location || alumnus.location?.toLowerCase().includes(filters.location.toLowerCase()));

    return matchesSearch && matchesFilters;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alumni Directory</h1>
          <p className="text-gray-600">
            Connect with fellow alumni and explore networking opportunities
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search alumni..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            
            <select
              value={filters.graduationYear}
              onChange={(e) => setFilters({...filters, graduationYear: e.target.value})}
              className="form-select"
            >
              <option value="">All Graduation Years</option>
              {Array.from({length: 20}, (_, i) => 2024 - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Field of Study"
              value={filters.fieldOfStudy}
              onChange={(e) => setFilters({...filters, fieldOfStudy: e.target.value})}
              className="form-input"
            />

            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="form-input"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={handleSearch}
              className="btn btn-primary"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Alumni
              </button>
            )}
          </div>
        </Card>

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumnus) => (
            <Card key={alumnus._id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{alumnus.name}</h3>
                    <p className="text-sm text-gray-500">{alumnus.email}</p>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingAlumni(alumnus)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(alumnus._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {alumnus.graduationYear && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Class of {alumnus.graduationYear}
                  </div>
                )}
                
                {alumnus.fieldOfStudy && (
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    {alumnus.fieldOfStudy}
                  </div>
                )}
                
                {alumnus.currentPosition && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {alumnus.currentPosition}
                  </div>
                )}
                
                {alumnus.company && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    {alumnus.company}
                  </div>
                )}
                
                {alumnus.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {alumnus.location}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex space-x-2">
                  <button className="flex-1 btn btn-outline text-sm py-2">
                    <Mail className="h-4 w-4 mr-1" />
                    Contact
                  </button>
                  <button className="flex-1 btn btn-primary text-sm py-2">
                    <Phone className="h-4 w-4 mr-1" />
                    Connect
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAlumni.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alumni found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDirectory;
