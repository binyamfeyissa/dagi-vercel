# Admin Panel Documentation

## Overview
The admin panel provides a comprehensive interface for managing books and viewing user information in the book review platform.

## Features

### 1. Admin Authentication
- Secure login system for admin users
- JWT-based authentication
- Protected admin routes

### 2. Dashboard
- Overview statistics (total books, users, reviews)
- Tabbed interface for different management sections

### 3. Books Management (CRUD)
- **Create**: Add new books with title, author, description, cover URL, and publication year
- **Read**: View all books with ratings and review counts
- **Update**: Edit existing book information
- **Delete**: Remove books (with cascade deletion of related data)

### 4. Users Management
- View all registered users
- Display user information including:
  - Username and email
  - Role (admin/user)
  - Country
  - Registration date
  - Review and book counts

## Access Information

### Admin Credentials
- **Email**: malon@gmail.com
- **Password**: malon123!

### URLs
- **Admin Login**: `/admin/login`
- **Admin Dashboard**: `/admin/dashboard`

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login

### Books Management
- `GET /api/admin/books` - Get all books
- `POST /api/admin/books` - Create new book
- `PUT /api/admin/books/[id]` - Update book
- `DELETE /api/admin/books/[id]` - Delete book

### Users Management
- `GET /api/admin/users` - Get all users

### Statistics
- `GET /api/admin/stats` - Get dashboard statistics

## Security Features
- JWT token authentication
- Admin role verification
- Protected routes with middleware
- Automatic token validation

## Usage Instructions

1. **Login**: Navigate to `/admin/login` and use the admin credentials
2. **Dashboard**: After login, you'll be redirected to the dashboard
3. **Books Management**: 
   - Click "Add New Book" to create books
   - Use "Edit" button to modify existing books
   - Use "Delete" button to remove books (with confirmation)
4. **Users Management**: Switch to "Users List" tab to view all users
5. **Logout**: Click the logout button to end your session

## Technical Notes
- Built with Next.js App Router
- Uses Prisma ORM for database operations
- Responsive design with Tailwind CSS
- Client-side state management with React hooks
- Automatic token refresh and validation