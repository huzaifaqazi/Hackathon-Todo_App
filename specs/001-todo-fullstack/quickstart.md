# Quickstart Guide: Todo Full-Stack Web Application

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL-compatible database (Neon Serverless recommended)

## Setup Instructions

### 1. Clone and Initialize Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Environment Configuration
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

#### Database Setup
```bash
# Run database migrations
alembic upgrade head
```

#### Start Backend Server
```bash
uvicorn src.main:app --reload --port 8000
```

### 3. Frontend Setup

#### Install Node Dependencies
```bash
cd frontend
npm install
```

#### Environment Configuration
```bash
cp .env.example .env.local
# Edit .env.local with your backend API URL
```

#### Start Frontend Development Server
```bash
npm run dev
```

## Development Workflow

### Running Both Servers

Use Docker Compose for local development:

```bash
docker-compose up --build
```

Backend will be available at `http://localhost:8000`
Frontend will be available at `http://localhost:3000`

### Running Tests

#### Backend Tests
```bash
cd backend
pytest
```

#### Frontend Tests
```bash
cd frontend
npm test
```

## API Documentation

- Backend API docs available at `http://localhost:8000/docs`
- Contract definitions in `specs/001-todo-fullstack/contracts/`

## Key Features Access

1. **Registration**: Navigate to `/register` on the frontend
2. **Login**: Navigate to `/login` on the frontend
3. **Dashboard**: Available after login at `/dashboard`
4. **Task Management**: Create, read, update, delete tasks in the dashboard

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret for JWT token signing
- `JWT_ALGORITHM`: Algorithm for JWT (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiry duration

### Frontend (.env.local)
- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL
- `NEXT_PUBLIC_APP_NAME`: Application name

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Verify DATABASE_URL in backend .env
2. **Authentication Failures**: Check JWT_SECRET_KEY matches between frontend and backend
3. **API Call Failures**: Verify NEXT_PUBLIC_API_BASE_URL points to running backend
4. **Migration Issues**: Run `alembic revision --autogenerate` and `alembic upgrade head`

### Reset Development Environment

```bash
# Stop all services
docker-compose down

# Remove volumes (will delete all data)
docker-compose down -v

# Start fresh
docker-compose up --build
```