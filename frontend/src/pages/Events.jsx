import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventApi } from '../api/eventApi';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Card from '../components/Card';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, registered
  
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventApi.getAll();
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await eventApi.register(eventId);
      toast.success('Successfully registered for the event');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to register for event');
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      await eventApi.unregister(eventId);
      toast.success('Successfully unregistered from the event');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to unregister from event');
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventApi.delete(eventId);
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEvents = events.filter(event => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    switch (filter) {
      case 'upcoming':
        return eventDate >= now;
      case 'past':
        return eventDate < now;
      case 'registered':
        return event.registeredUsers?.includes(user?._id);
      default:
        return true;
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
          <p className="text-gray-600">
            Stay connected with alumni events, reunions, and networking opportunities
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'upcoming' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'past' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Past Events
              </button>
              <button
                onClick={() => setFilter('registered')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'registered' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                My Events
              </button>
            </div>
            
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </button>
            )}
          </div>
        </Card>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event._id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">{event.organizer}</p>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(event.date)}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatTime(event.date)}
                </div>
                
                {event.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {event.registeredUsers?.length || 0} registered
                </div>
              </div>

              {event.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {event.description}
                </p>
              )}

              <div className="pt-4 border-t">
                {event.registeredUsers?.includes(user?._id) ? (
                  <button
                    onClick={() => handleUnregister(event._id)}
                    className="w-full btn btn-outline text-sm py-2"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Unregister
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegister(event._id)}
                    className="w-full btn btn-primary text-sm py-2"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Register
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">Try adjusting your filter or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
