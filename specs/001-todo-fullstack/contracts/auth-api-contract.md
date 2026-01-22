# Authentication API Contract

## Base URL
`/api/v1/auth`

## Endpoints

### POST /register
Register a new user account

#### Request
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2023-01-01T00:00:00Z"
    }
  }
}
```

#### Error Responses
- 400: Invalid input data
- 409: Email already exists

### POST /login
Authenticate user and return JWT token

#### Request
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "token": "jwt-token-string"
  }
}
```

#### Error Responses
- 400: Invalid input data
- 401: Invalid credentials

### POST /logout
Invalidate current user session

#### Headers
```
Authorization: Bearer {jwt_token}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Error Responses
- 401: Invalid or expired token

### GET /me
Get current authenticated user details

#### Headers
```
Authorization: Bearer {jwt_token}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_active": true,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  }
}
```

#### Error Responses
- 401: Invalid or expired token