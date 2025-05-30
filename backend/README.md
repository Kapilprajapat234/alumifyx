# AlumifyX Backend

This is the backend server for the AlumifyX platform, built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup Instructions

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/alumifyxDB
   SESSION_SECRET=your-secret-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-specific-password
   FRONTEND_URL=http://localhost:3001
   ADMIN_EMAILS=admin@example.com
   ```

   Note: For Gmail, you'll need to use an App Password. Generate one in your Google Account settings.

5. Create the uploads directory:
   ```bash
   mkdir uploads
   ```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password
- POST `/api/auth/logout` - Logout user

### User Profile
- GET `/api/user` - Get user profile
- PUT `/api/user` - Update user profile
- DELETE `/api/user` - Delete user account

## Error Handling

The server includes comprehensive error handling for:
- Invalid requests
- Authentication failures
- File upload errors
- Database errors
- Server errors

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- CORS protection
- Secure cookie settings
- Environment variable validation
- File upload restrictions

## Testing

Run tests with:
```bash
npm test
```

## Production Deployment

1. Set `NODE_ENV=production` in your `.env` file
2. Update `FRONTEND_URL` to your production frontend URL
3. Use a strong `SESSION_SECRET`
4. Configure proper MongoDB connection string
5. Set up proper email credentials

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 