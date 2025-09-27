# Alumni Platform Backend

A comprehensive backend API for managing alumni data, events, and mentorship programs.

## Features

- **Multi-role Authentication**: Admin, Student, and Alumni roles with different permissions
- **Alumni Management**: CRUD operations for alumni profiles and data
- **Student Management**: Student profile management and tracking
- **Event Management**: Create, manage, and register for alumni events
- **Mentorship Program**: Connect alumni mentors with current students
- **Secure API**: JWT-based authentication with role-based access control
- **Data Validation**: Comprehensive input validation and error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Alumni
- `GET /api/alumni` - Get all alumni (with filters)
- `GET /api/alumni/search` - Search alumni
- `GET /api/alumni/:id` - Get single alumni
- `POST /api/alumni` - Create alumni (Admin only)
- `PUT /api/alumni/:id` - Update alumni
- `DELETE /api/alumni/:id` - Delete alumni (Admin only)
- `GET /api/alumni/stats/overview` - Get alumni statistics (Admin only)

### Students
- `GET /api/students` - Get all students (Admin only)
- `GET /api/students/:id` - Get single student
- `POST /api/students` - Create student (Admin only)
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student (Admin only)
- `GET /api/students/stats/overview` - Get student statistics (Admin only)

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/events/:id/register` - Unregister from event

### Mentorship
- `GET /api/mentorship` - Get all mentorship opportunities
- `GET /api/mentorship/:id` - Get single mentorship opportunity
- `POST /api/mentorship` - Create mentorship opportunity (Alumni/Admin only)
- `PUT /api/mentorship/:id` - Update mentorship opportunity
- `DELETE /api/mentorship/:id` - Delete mentorship opportunity
- `POST /api/mentorship/:id/apply` - Apply for mentorship (Students only)
- `GET /api/mentorship/:id/applications` - Get applications (Mentor/Admin only)
- `PUT /api/mentorship/:id/applications/:applicationId/approve` - Approve application
- `PUT /api/mentorship/:id/applications/:applicationId/reject` - Reject application

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alumni-platform/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/alumni_platform` |
| `JWT_SECRET` | JWT secret key | `your-secret-key` |
| `JWT_EXPIRE` | JWT expiration time | `30d` |

## Database Schema

### User Model
- Basic info: name, email, password, role, phone, location
- Alumni fields: graduationYear, fieldOfStudy, currentPosition, company
- Student fields: studentId, department
- Profile fields: bio, linkedinProfile, githubProfile
- Account status: isActive, isVerified

### Event Model
- Basic info: title, description, date, location, organizer
- Event details: eventType, category, maxAttendees, isOnline
- Management: status, createdBy, registeredUsers

### Mentorship Model
- Basic info: title, description, category, field, duration
- Mentor info: mentor (User reference)
- Applications: applications array with student, message, status
- Management: status, maxMentees, currentMentees

## Authentication & Authorization

### Roles
- **Admin**: Full access to all features
- **Alumni**: Can create mentorship opportunities, view alumni directory
- **Student**: Can apply for mentorship, register for events

### JWT Token
- Contains user ID and role information
- Expires in 30 days (configurable)
- Required for all protected routes

## Error Handling

The API uses consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Database Seeding
```bash
# Create sample data for development
npm run seed
```

## Production Deployment

1. **Set production environment variables**
2. **Use a production MongoDB instance**
3. **Set up proper JWT secrets**
4. **Configure CORS for your frontend domain**
5. **Set up logging and monitoring**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
