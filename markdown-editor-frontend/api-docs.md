# Markdown Editor API Documentation

> **Base URL**: `http://localhost:3000/api/v1`
>
> **Interactive Documentation**: `http://localhost:3000/api/docs` (Swagger UI)

---

## Overview

The Markdown Editor API is a RESTful backend service built with NestJS. 

It provides authentication, document management, tagging, and statistics features for a markdown editing application.

### Tech Stack

- **Framework**: NestJS 10.x
- **Database**: SQLite with TypeORM
- **Authentication**: JWT (Passport)
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator with class-transformer

### Architecture

```
src/
├── main.ts                    # Application bootstrap
├── app.module.ts              # Root module
├── common/
│   ├── decorators/           # @Public(), @CurrentUser()
│   ├── filters/              # AllExceptionsFilter
│   ├── guards/                # JwtAuthGuard
│   └── interceptors/          # ResponseFormatInterceptor
└── modules/
    ├── auth/                 # Authentication
    ├── users/                # User management
    ├── documents/            # Document CRUD
    ├── tags/                 # Tag management
    └── statistics/           # Analytics
```

---

## Global Configuration

### Response Format

All successful responses are wrapped in a standard format:

```json
{
  "code": 0,
  "data": { ... },
  "message": "success"
}
```

### Error Response Format

```json
{
  "code": 400,
  "message": "Error description",
  "data": null
}
```

### Rate Limiting

- **Limit**: 5 requests per 60 seconds
- **Applied via**: ThrottlerGuard (global)
- **Exemptions**: Login and Register endpoints (still limited, not exempt)

### CORS

- **Origin**: Configurable via `FRONTEND_URL` env var (default: `http://localhost:5173`)
- **Credentials**: Enabled

---

## Authentication

All authenticated endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Endpoints

| Method | Path | Auth Required | Public | Rate Limited |
|--------|------|---------------|--------|--------------|
| POST | `/auth/login` | No | Yes | Yes |
| POST | `/auth/register` | No | Yes | Yes |
| GET | `/auth/profile` | Yes | No | No |
| POST | `/auth/logout` | Yes | No | No |
| PUT | `/auth/password` | Yes | No | No |

---

## Auth Module

### POST `/auth/register`

Register a new user account.

**Rate Limit**: 5 requests per 60 seconds

**Request Body**:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| username | string | Yes | 3-20 chars, alphanumeric + underscore only | Unique username |
| email | string | Yes | Valid email format | Unique email |
| password | string | Yes | 8-50 chars, must contain letter and number | Hashed with bcrypt |

**Response** (201 Created):

```json
{
  "code": 0,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    }
  },
  "message": "success"
}
```

**Error Responses**:

| Status | Message | Condition |
|--------|---------|----------|
| 409 | Username or email already exists | Duplicate username or email |

---

### POST `/auth/login`

Authenticate user and obtain access token.

**Rate Limit**: 5 requests per 60 seconds

**Request Body**:

```json
{
  "username": "john_doe",
  "password": "password123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | User's username |
| password | string | Yes | User's password |

**Response** (200 OK):

```json
{
  "code": 0,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    }
  },
  "message": "success"
}
```

**Error Responses**:

| Status | Message | Condition |
|--------|---------|----------|
| 401 | Invalid credentials | Wrong username or password |

---

### GET `/auth/profile`

Retrieve the current authenticated user's profile.

**Auth Required**: Yes (JWT Bearer Token)

**Response** (200 OK):

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "success"
}
```

---

### PUT `/auth/password`

Update the current user's password.

**Auth Required**: Yes (JWT Bearer Token)

**Request Body**:

```json
{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| oldPassword | string | Yes | - | Current password |
| newPassword | string | Yes | Min 6 chars | New password |

**Response** (200 OK):

```json
{
  "code": 0,
  "data": {
    "message": "Password updated successfully"
  },
  "message": "success"
}
```

**Error Responses**:

| Status | Message | Condition |
|--------|---------|----------|
| 401 | Invalid old password | Incorrect current password |

---

### POST `/auth/logout`

Logout the current user (client-side token invalidation).

**Auth Required**: Yes (JWT Bearer Token)

**Response** (200 OK):

```json
{
  "code": 0,
  "data": {
    "message": "登出成功"
  },
  "message": "success"
}
```

---

## Documents Module

> **Base Path**: `/documents`
>
> **Auth Required**: Yes (JWT Bearer Token)

### Document Entity

```typescript
{
  id: number;              // Primary key
  title: string;           // Max 255 chars, nullable
  content: string;         // Full text content
  userId: number;          // Owner user ID
  user: User;              // Related user object
  tags: Tag[];             // Many-to-many relation
  createdAt: Date;         // Creation timestamp
  updatedAt: Date;         // Last update timestamp
  deletedAt: Date | null;  // Soft delete timestamp
}
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/documents` | Create a new document |
| GET | `/documents` | List documents with filters |
| GET | `/documents/:id` | Get single document |
| PATCH | `/documents/:id` | Update document |
| DELETE | `/documents/:id` | Soft delete document |
| POST | `/documents/:id/restore` | Restore deleted document |
| POST | `/documents/:id/tags` | Add tags to document |
| DELETE | `/documents/:id/tags` | Remove tags from document |

---

### POST `/documents`

Create a new markdown document.

**Request Body**:

```json
{
  "title": "My Document",
  "content": "# Hello World\n\nThis is my document content..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Document title |
| content | string | Yes | Document markdown content |

**Response** (201 Created):

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "My Document",
    "content": "# Hello World\n\nThis is my document content...",
    "userId": 1,
    "tags": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "deletedAt": null
  },
  "message": "success"
}
```

---

### GET `/documents`

List all documents for the current user with optional filters.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| keyword | string | - | Search in document title |
| startDate | string | - | Filter by created date (ISO 8601) |
| endDate | string | - | Filter by created date (ISO 8601) |
| tags | string | - | Comma-separated tag IDs (e.g., `1,2,3`) |
| tagMode | string | "OR" | Tag filter mode: "AND" or "OR" |
| page | number | 1 | Page number |
| pageSize | number | 50 | Items per page (max 50) |

**Response** (200 OK):

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "title": "My Document",
      "preview": "This is the first 3 lines of content, truncated to 200 chars...",
      "tags": [
        { "id": 1, "name": "work" },
        { "id": 2, "name": "important" }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "message": "success"
}
```

**Notes**:
- `preview` is generated from the first 3 non-empty lines of content, truncated to 200 characters
- Results are sorted by `updatedAt` descending (most recent first)
- Soft-deleted documents are excluded

---

### GET `/documents/:id`

Retrieve a single document by ID.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Document ID |

**Response** (200 OK):

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "My Document",
    "content": "# Hello World\n\nThis is my document content...",
    "userId": 1,
    "tags": [
      { "id": 1, "name": "work", "color": "#3B82F6" }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "deletedAt": null
  },
  "message": "success"
}
```

**Error Responses**:

| Status | Message | Condition |
|--------|---------|----------|
| 404 | 文档不存在或已删除 | Document not found or soft-deleted |

---

### PATCH `/documents/:id`

Update an existing document.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Document ID |

**Request Body**:

```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | New document title |
| content | string | No | New document content |

**Response** (200 OK):

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "Updated Title",
    "content": "Updated content...",
    "userId": 1,
    "tags": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z",
    "deletedAt": null
  },
  "message": "success"
}
```

---

### DELETE `/documents/:id`

Soft delete a document (can be restored).

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Document ID |

**Response** (200 OK):

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "My Document",
    // ... full document object with deletedAt set
  },
  "message": "success"
}
```

**Notes**:
- Soft delete sets `deletedAt` timestamp instead of removing the record
- Use `POST /documents/:id/restore` to recover

---

### POST `/documents/:id/restore`

Restore a soft-deleted document.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Document ID |

**Response** (200 OK):

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "My Document",
    // ... full document object with deletedAt = null
  },
  "message": "success"
}
```

**Error Responses**:

| Status | Message | Condition |
|--------|---------|----------|
| 404 | 文档不存在或未删除 | Document not found or not deleted |

---

### POST `/documents/:id/tags`

Add tags to a document.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Document ID |

**Request Body**:

```json
{
  "tagIds": [1, 2, 3]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tagIds | number[] | Yes | Array of tag IDs to add |

**Response** (200 OK):

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "My Document",
    "tags": [
      { "id": 1, "name": "work" },
      { "id": 2, "name": "important" },
      { "id": 3, "name": "personal" }
    ],
    // ... other fields
  },
  "message": "success"
}
```

**Notes**:
- Only tags belonging to the user are added
- Duplicate tags are ignored

---

### DELETE `/documents/:id/tags`

Remove tags from a document.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Document ID |

**Request Body**:

```json
{
  "tagIds": [1, 2]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tagIds | number[] | Yes | Array of tag IDs to remove |

**Response** (200 OK):

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "My Document",
    "tags": [],
    // ... other fields
  },
  "message": "success"
}
```

---

## Tags Module

> **Base Path**: `/tags`
>
> **Auth Required**: Yes (JWT Bearer Token)

### Tag Entity

```typescript
{
  id: number;           // Primary key
  name: string;         // Tag name (max 50 chars)
  userId: number;        // Owner user ID
  user: User;           // Related user object
  documents: Document[]; // Many-to-many relation
}
```

**Constraints**:
- Unique constraint on `(name, userId)` - tag names must be unique per user

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/tags` | Create a new tag |
| GET | `/tags` | List all tags |
| PATCH | `/tags/:id` | Rename a tag |
| DELETE | `/tags/:id` | Delete a tag |

---

### POST `/tags`

Create a new tag.

**Request Body**:

```json
{
  "name": "work",
  "color": "#3B82F6"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Tag name |
| color | string | No | Hex color code (e.g., "#3B82F6") |

**Response** (201 Created):

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "work",
    "userId": 1
  },
  "message": "success"
}
```

---

### GET `/tags`

List all tags for the current user.

**Response** (200 OK):

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "work",
      "userId": 1
    },
    {
      "id": 2,
      "name": "personal",
      "userId": 1
    }
  ],
  "message": "success"
}
```

---

### PATCH `/tags/:id`

Rename a tag.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Tag ID |

**Request Body**:

```json
{
  "name": "personal"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | New tag name |

**Response** (200 OK):

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "personal",
    "userId": 1
  },
  "message": "success"
}
```

---

### DELETE `/tags/:id`

Delete a tag.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Tag ID |

**Response** (200 OK):

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "work",
    "userId": 1
  },
  "message": "success"
}
```

**Notes**:
- Deleting a tag removes it from all associated documents

---

## Statistics Module

> **Base Path**: `/statistics`
>
> **Auth Required**: Yes (JWT Bearer Token)

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/statistics/monthly` | Get monthly document counts |
| GET | `/statistics/yearly` | Get yearly document counts |
| GET | `/statistics/tags` | Get tag usage statistics |

---

### GET `/statistics/monthly`

Get daily document creation counts for a specific month or date range.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | string | Yes | Target year (e.g., "2024") |
| month | string | No | Specific month (1-12). If provided, returns daily counts |
| startMonth | string | No | Start month for range (e.g., "01"). Use with `endMonth` |
| endMonth | string | No | End month for range (e.g., "06"). Use with `startMonth` |

**Example Requests**:

```
GET /statistics/monthly?year=2024&month=3
GET /statistics/monthly?year=2024&startMonth=01&endMonth=06
```

**Response - Single Month** (200 OK):

```json
{
  "code": 0,
  "data": [
    { "date": "2024-03-01", "count": 5 },
    { "date": "2024-03-02", "count": 3 },
    { "date": "2024-03-03", "count": 8 }
  ],
  "message": "success"
}
```

**Response - Date Range** (200 OK):

```json
{
  "code": 0,
  "data": [
    { "month": "2024-01", "count": 45 },
    { "month": "2024-02", "count": 52 },
    { "month": "2024-03", "count": 38 }
  ],
  "message": "success"
}
```

---

### GET `/statistics/yearly`

Get monthly document creation counts for a specific year.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | string | Yes | Target year (e.g., "2024") |

**Response** (200 OK):

```json
{
  "code": 0,
  "data": [
    { "month": "2024-01", "count": 45 },
    { "month": "2024-02", "count": 52 },
    { "month": "2024-03", "count": 38 },
    { "month": "2024-04", "count": 61 },
    { "month": "2024-05", "count": 55 },
    { "month": "2024-06", "count": 48 },
    { "month": "2024-07", "count": 70 },
    { "month": "2024-08", "count": 65 },
    { "month": "2024-09", "count": 58 },
    { "month": "2024-10", "count": 72 },
    { "month": "2024-11", "count": 64 },
    { "month": "2024-12", "count": 49 }
  ],
  "message": "success"
}
```

---

### GET `/statistics/tags`

Get tag usage statistics for a specific month.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | string | Yes | Target year (e.g., "2024") |
| month | string | Yes | Target month (1-12) |

**Response** (200 OK):

```json
{
  "code": 0,
  "data": [
    { "tagId": 1, "tagName": "work", "count": 15 },
    { "tagId": 2, "tagName": "important", "count": 12 },
    { "tagId": 3, "tagName": "personal", "count": 8 }
  ],
  "message": "success"
}
```

**Notes**:
- Results are sorted by `count` descending (most used first)

---

## User Entity

```typescript
{
  id: number;           // Primary key
  username: string;     // Unique, max 50 chars
  email: string;        // Unique, max 100 chars
  password: string;     // Hashed with bcrypt
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| JWT_SECRET | - | JWT signing secret (required in production) |
| DB_PATH | `data/database.sqlite` | SQLite database file path |
| PORT | `3000` | Server listening port |
| FRONTEND_URL | `http://localhost:5173` | CORS allowed origin |
| NODE_ENV | `development` | Environment mode |

---

## HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Invalid or missing authentication |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting Details

- **Algorithm**: Token bucket
- **Limit**: 5 requests per 60 seconds per IP
- **Scope**: Applied globally via `ThrottlerGuard`
- **Headers**: None returned (transparent limiting)
- **Exemptions**: None (login/register are still rate-limited but pass through)

When rate limit is exceeded, a `429 Too Many Requests` response is returned.

---

## Database Schema

### Tables

**users**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| username | VARCHAR(50) | UNIQUE NOT NULL |
| email | VARCHAR(100) | UNIQUE NOT NULL |
| password | VARCHAR(255) | NOT NULL |
| createdAt | DATETIME | NOT NULL |
| updatedAt | DATETIME | NOT NULL |

**documents**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| title | VARCHAR(255) | NULLABLE |
| content | TEXT | NOT NULL |
| userId | INTEGER | FOREIGN KEY (users.id) NOT NULL |
| createdAt | DATETIME | NOT NULL |
| updatedAt | DATETIME | NOT NULL |
| deletedAt | DATETIME | NULLABLE (soft delete) |

**tags**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | VARCHAR(50) | NOT NULL |
| userId | INTEGER | FOREIGN KEY (users.id) NOT NULL |

**document_tags** (junction table)
| Column | Type | Constraints |
|--------|------|-------------|
| documentId | INTEGER | FOREIGN KEY (documents.id) NOT NULL |
| tagId | INTEGER | FOREIGN KEY (tags.id) NOT NULL |

---

## Example Usage

### Register and Login

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"password123"}'
```

### Create and Manage Documents

```bash
# Save the token from login response
TOKEN="your-jwt-token-here"

# Create a document
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Doc","content":"# Hello\n\nWorld"}'

# List documents
curl -X GET "http://localhost:3000/api/v1/documents?keyword=Hello" \
  -H "Authorization: Bearer $TOKEN"

# Update document
curl -X PATCH http://localhost:3000/api/v1/documents/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"# Updated\n\nContent"}'

# Delete document
curl -X DELETE http://localhost:3000/api/v1/documents/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Tag Management

```bash
TOKEN="your-jwt-token-here"

# Create a tag
curl -X POST http://localhost:3000/api/v1/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"work","color":"#3B82F6"}'

# Add tag to document
curl -X POST http://localhost:3000/api/v1/documents/1/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tagIds":[1]}'
```

### Get Statistics

```bash
TOKEN="your-jwt-token-here"

# Yearly stats
curl -X GET "http://localhost:3000/api/v1/statistics/yearly?year=2024" \
  -H "Authorization: Bearer $TOKEN"

# Monthly tag stats
curl -X GET "http://localhost:3000/api/v1/statistics/tags?year=2024&month=3" \
  -H "Authorization: Bearer $TOKEN"
```
