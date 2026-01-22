# Todo Full-Stack Web Application

A full-stack web application for managing personal tasks with secure JWT authentication, enabling multi-user support with isolated task management.

## Features

- User registration and authentication with JWT tokens
- Create, read, update, and delete personal tasks
- Task categorization by status and priority
- Responsive UI design for desktop and mobile
- Secure user data isolation
- Modern web technologies stack

## Tech Stack

- **Backend**: Python FastAPI with SQLModel ORM
- **Frontend**: Next.js 16+ with TypeScript and Tailwind CSS
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: JWT-based with secure session management
- **Containerization**: Docker and docker-compose

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL (or Docker for containerized setup)
- Docker and docker-compose (optional, for containerized deployment)

## Setup Instructions

### Option 1: Local Development

1. Clone the repository
2. Navigate to the project directory

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Update .env with your database credentials
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Update .env with your API URL
```

### Option 2: Docker Compose (Recommended)
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Build and start services
docker-compose up --build
```

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Secret key for JWT signing
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiry time

### Frontend (.env)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

## Running the Application

### Local Development
1. Start the backend server:
```bash
cd backend
source venv/bin/activate  # Activate virtual environment if using one
uvicorn src.main:app --port 8001  # Use port 8001 to avoid conflicts
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
```

### Docker
```bash
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001 (or 8000 if using Docker)
- API Documentation: http://localhost:8001/docs (or 8000 if using Docker)

### Database Configuration
- By default, the application uses SQLite for development (no database setup required)
- For PostgreSQL, update the DATABASE_URL in backend/.env and ensure PostgreSQL is running

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Tasks
- `GET /api/v1/tasks` - Get all user tasks
- `POST /api/v1/tasks` - Create a new task
- `GET /api/v1/tasks/{task_id}` - Get a specific task
- `PUT /api/v1/tasks/{task_id}` - Update a task
- `DELETE /api/v1/tasks/{task_id}` - Delete a task

## Security Features

- JWT-based authentication with secure token handling
- User data isolation - users can only access their own tasks
- Input validation and sanitization
- Password hashing with bcrypt
- Secure session management

## Development

### Backend Development
The backend follows a service-oriented architecture:
- Models in `src/models/`
- Business logic in `src/services/`
- API endpoints in `src/api/`
- Utilities in `src/utils/`

### Frontend Development
The frontend uses a component-based architecture:
- Pages in `src/pages/`
- Components in `src/components/`
- API services in `src/services/`
- Shared utilities in `src/utils/`

## Testing

TODO: Add testing instructions once test suites are implemented.

## Deployment

TODO: Add deployment instructions for production environments.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
