# TrackOps

TrackOps is a RESTful backend API for a project management system. It supports user authentication, project membership with roles, project-scoped tasks, subtasks, file attachments, and email-based account workflows.

The project is built with Node.js, Express, MongoDB, and Mongoose.

## Features

- User registration and login
- JWT access token and refresh token authentication
- Email verification
- Forgot password and reset password flow
- Project CRUD
- Project member management
- Role-based project authorization
- Task CRUD inside projects
- Subtask CRUD inside tasks
- File attachments for tasks using Multer
- Request validation using `express-validator`
- Standardized API responses and errors
- MongoDB aggregation for joined response data

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- Nodemailer
- Mailgen
- express-validator
- cookie-parser
- cors

## Project Structure

```txt
TrackOps/
├── index.js
├── package.json
├── public/
│   └── images/
└── src/
    ├── controllers/
    │   ├── auth.controllers.js
    │   ├── healthcheck.controller.js
    │   ├── project.controllers.js
    │   └── task.controllers.js
    ├── db/
    │   └── index.js
    ├── middlewares/
    │   ├── auth.middleware.js
    │   ├── multer.middleware.js
    │   └── validator.middleware.js
    ├── models/
    │   ├── project.models.js
    │   ├── projectmember.models.js
    │   ├── subtask.models.js
    │   ├── task.models.js
    │   └── user.models.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── healthcheck.router.js
    │   ├── project.routes.js
    │   └── task.routes.js
    ├── utils/
    │   ├── api-error.js
    │   ├── api-response.js
    │   ├── async-handler.js
    │   ├── constants.js
    │   └── mail.js
    └── validators/
        ├── app.js
        └── index.js
```

## Data Model Overview

TrackOps uses MongoDB references for relationships between users, projects, tasks, and subtasks.

```txt
User
  └── created projects

Project
  ├── createdBy -> User
  └── members through ProjectMember

ProjectMember
  ├── user -> User
  ├── project -> Project
  └── role

Task
  ├── project -> Project
  ├── assignedTo -> User
  ├── assignedBy -> User
  └── attachments[]

Subtask
  ├── task -> Task
  └── createdBy -> User
```

`ProjectMember` acts like a join collection. It supports the many-to-many relationship between users and projects while also storing each user's role inside a project.

## Roles

Project permissions are based on roles stored in `ProjectMember`.

```txt
admin
project_admin
member
```

## Task Statuses

Tasks support the following statuses:

```txt
todo
in_progress
done
```

## Authentication Flow

TrackOps uses JWT-based authentication.

1. A user registers with email, username, password, and optional full name.
2. The password is hashed using bcrypt before it is stored in MongoDB.
3. On login, the server compares the submitted password with the stored hash.
4. If valid, the server generates an access token and refresh token.
5. The refresh token is saved in the user document.
6. Tokens are sent to the client as HTTP-only cookies and in the response body.
7. Protected routes use `verifyJWT` to validate the access token.
8. When the access token expires, the refresh token can be used to issue a new access token.
9. On logout, the refresh token is removed from the database and cookies are cleared.

## API Routes

Base URL:

```txt
/api/v1
```

### Health Check

```txt
GET /healthcheck
```

### Authentication

```txt
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/current-user
POST /auth/change-password
POST /auth/refresh-token
GET  /auth/verify-email/:verificationToken
POST /auth/forgot-password
POST /auth/reset-password/:resetToken
POST /auth/resend-email-verification
```

### Projects

```txt
GET    /projects
POST   /projects
GET    /projects/:projectId
PUT    /projects/:projectId
DELETE /projects/:projectId
```

### Project Members

```txt
GET    /projects/:projectId/members
POST   /projects/:projectId/members
PUT    /projects/:projectId/members/:userId
DELETE /projects/:projectId/members/:userId
```

### Tasks

Tasks are mounted under projects because tasks are project-scoped resources.

```txt
GET    /projects/:projectId/tasks
POST   /projects/:projectId/tasks
GET    /projects/:projectId/tasks/:taskId
PUT    /projects/:projectId/tasks/:taskId
DELETE /projects/:projectId/tasks/:taskId
```

### Subtasks

```txt
POST   /projects/:projectId/tasks/:taskId/subtasks
PUT    /projects/:projectId/tasks/:taskId/subtasks/:subTaskId
DELETE /projects/:projectId/tasks/:taskId/subtasks/:subTaskId
```

## Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

SERVER_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173

MAILTRAP_SMTP_HOST=your_mailtrap_host
MAILTRAP_SMTP_PORT=your_mailtrap_port
MAILTRAP_SMTP_USER=your_mailtrap_user
MAILTRAP_SMTP_PASS=your_mailtrap_password
```

## Installation

```bash
npm install
```

## Running The Project

Start the server:

```bash
node index.js
```

For development with nodemon:

```bash
npx nodemon index.js
```

The server starts only after MongoDB connects successfully.

## Request Validation

The project uses `express-validator` for request validation.

Validation rules are defined in:

```txt
src/validators/index.js
```

The shared validation middleware is:

```txt
src/middlewares/validator.middleware.js
```

If validation fails, the middleware throws an `ApiError` with status code `422`.

## Error And Response Format

Successful responses use `ApiResponse`:

```json
{
    "statusCode": 200,
    "data": {},
    "message": "Success",
    "success": true
}
```

Errors use `ApiError`:

```json
{
    "statusCode": 404,
    "data": null,
    "message": "Resource not found",
    "success": false,
    "errors": []
}
```

## Aggregation Usage

The project uses MongoDB aggregation when the API needs joined or shaped data.

For example, `getProjectMembers` starts from the `ProjectMember` collection, filters members by `projectId`, joins user details from the `users` collection using `$lookup`, selects safe user fields using `$project`, and flattens the joined user array using `$arrayElemAt`.

This allows the API to return project members with user details and roles in a single database operation.

## File Uploads

Task attachments are handled using Multer.

Files are stored in:

```txt
public/images
```

Attachment metadata is stored on the task document:

```js
{
    url: String,
    mimetype: String,
    size: Number
}
```

## Current Notes

- Task routes are mounted under `/api/v1/projects/:projectId/tasks`.
- Notes are described in the product requirements, but note routes/controllers are not currently mounted in the application.
- The Express app currently lives at `src/validators/app.js`, which works but would be clearer as `src/app.js` in a future cleanup.
- The `package.json` scripts may need to be adjusted to run `index.js` directly.

## License

ISC
