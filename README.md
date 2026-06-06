# ISKCON Juhu IPP LMS

A full-stack dynamic LMS web application for ISKCON Juhu IPP with a public website, student learning area, teacher dashboard, and main admin panel.

## Features

- React + Vite + Tailwind responsive frontend
- Node.js + Express.js backend
- MongoDB with Mongoose models for all dynamic content
- JWT authentication with bcrypt password hashing
- Roles: Main Admin, Teacher, Student
- Student enrollment, lesson completion, PDF/resource downloads, and progress tracking
- Teacher dashboard for assigned courses, students, lessons, and permitted content creation
- Dynamic admin CRUD for users, sections, pages, courses, lessons, blogs, video blogs, preachers, media, legal pages, subscribers, messages, footer, and site settings
- File upload support via Multer and `/uploads`
- YouTube, Vimeo, external URL, and uploaded video support
- Traffic tracking and dashboard statistics
- Seed data for immediate local testing

## Tech Stack

- Frontend: React.js, Vite, Tailwind CSS, React Router, React Helmet Async, Lucide icons
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Auth: JWT, bcryptjs
- Uploads: Multer
- Security: Helmet, CORS, rate limiting, role middleware

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

Backend runs at `http://localhost:5055`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

Panel URLs:

- Main admin panel: `/admin`
- Teacher panel: `/teacher`
- Student dashboard: `/student/dashboard`

## Default Logins

- Admin: `admin@iskconlms.com` / `Admin@123`
- Teacher: `teacher@iskconlms.com` / `Teacher@123`
- Student: `student@iskconlms.com` / `Student@123`

## Folder Structure

```text
backend/
  src/
    models.js
    seed.js
    server.js
  uploads/
  .env.example
  package.json

frontend/
  public/
  src/
    api.js
    App.jsx
    AuthContext.jsx
    components.jsx
    fallback.js
    index.css
    main.jsx
    pages.jsx
  .env.example
  package.json
```

## API Summary

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/profile`, `/api/auth/logout`
- Public: `/api/courses`, `/api/blogs`, `/api/video-blogs`, `/api/preachers`, `/api/gallery/images`, `/api/gallery/videos`, `/api/page-sections/:pageName`
- Student: `/api/courses/:courseId/enroll`, `/api/student/my-courses`, `/api/student/progress/complete`, `/api/student/progress/:courseId`
- Teacher: `/api/teacher/dashboard`, `/api/teacher/courses`, `/api/teacher/lessons`, `/api/teacher/blogs`
- Admin: `/api/admin/:resource`, `/api/admin/dashboard/stats`, `/api/admin/traffic`, `/api/admin/footer`, `/api/admin/site-settings`

## Notes

Every major public-facing section is represented in MongoDB and can be enabled, disabled, reordered, and edited from the admin panel. If the API is not running, the frontend uses graceful sample fallback data so the design remains visible during development.
