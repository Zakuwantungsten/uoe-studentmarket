# Student Marketplace Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
   - [Use Case Diagram](#use-case-diagram)
   - [Data Flow Diagrams](#data-flow-diagrams)
   - [Entity-Relationship Diagram](#entity-relationship-diagram)
3. [Technology Stack](#technology-stack)
   - [Frontend](#frontend)
   - [Backend](#backend)
   - [Database](#database)
4. [Project Structure](#project-structure)
   - [Backend Structure](#backend-structure)
   - [Frontend Structure](#frontend-structure)
5. [Features](#features)
   - [Authentication](#authentication)
   - [Service Management](#service-management)
   - [Booking System](#booking-system)
   - [Review System](#review-system)
   - [Messaging System](#messaging-system)
   - [Payment Processing](#payment-processing)
   - [Community Features](#community-features)
   - [Admin Dashboard](#admin-dashboard)
6. [Database Schema](#database-schema)
7. [Setup & Installation](#setup--installation)
8. [API Overview](#api-overview)
9. [Deployment Guide](#deployment-guide)

---

## Project Overview

The Student Marketplace is a comprehensive platform designed to connect students offering services with those seeking services within an educational institution. The platform enables students to monetize their skills and knowledge by offering services such as tutoring, design work, programming help, content creation, and more.

The system features service listings, bookings, reviews, secure messaging, and payment processing. It also includes community features like discussions, events, and groups to foster collaboration and networking among students.

The platform is built with a modern tech stack including Next.js for the frontend and Node.js/Express for the backend, with MongoDB as the database.

---

## System Architecture

### Use Case Diagram

The system is designed around several key use cases:

1. **Authentication**
   - Register Account
   - Login/Logout
   - Update Profile
   - Delete Account
   - View Dashboard

2. **Service Management**
   - Create Service
   - Update Service
   - Delete Service
   - Manage Features
   - Browse/Search Services
   - Filter Services
   - View Service Details

3. **Booking Management**
   - Create Booking
   - View Booking
   - Update Status
   - Cancel Booking
   - Check Availability
   - View History

4. **Review System**
   - Submit Review
   - View Reviews
   - Manage Reviews

5. **Payment Processing**
   - Process Payment
   - View Transactions
   - Refund Payment
   - Track Earnings

6. **Communication**
   - Send/Receive Messages
   - Manage Conversations

7. **Community Features**
   - Create/Join Groups
   - Create/Attend Events
   - Post/View Discussions
   - Comment on Discussions

8. **Admin Functions**
   - Manage Users
   - Manage Services
   - Handle Disputes
   - Generate Reports
   - Send Announcements
   - Manage Support Tickets
   - Monitor Finances

The main actors in the system include:
- Guest User (unregistered visitor)
- User (registered student)
- Provider (student offering services)
- Admin (system administrator)
- Payment System (external payment processing)

### Data Flow Diagrams

The data flow in the system is organized around these main processes:

1. **Authentication System**
   - Handles user registration and login
   - Interacts with User Database for storing and verifying credentials

2. **Service Management**
   - Manages service listings, categories, and searches
   - Stores service information in Service Database

3. **Booking System**
   - Processes service bookings
   - Interacts with Services, Users, and Payment Processing
   - Stores booking information in Booking Database

4. **Notification System**
   - Manages system notifications for bookings, messages, etc.
   - Delivers notifications to relevant users

5. **Communication System**
   - Handles messaging between users
   - Stores message data

6. **Review System**
   - Manages service reviews and ratings
   - Updates service ratings based on reviews

7. **Admin Dashboard**
   - Provides administrative controls and monitoring
   - Generates reports and analytics

8. **Community System**
   - Manages discussions, comments, groups, and events
   - Enables student interaction and collaboration

### Entity-Relationship Diagram

The system's data model is organized around these primary entities and their relationships:

1. **User-Related Entities**
   - User has many UserSkills, Education records, and Certifications
   - User provides many Services as a Provider
   - User makes many Bookings as a Customer
   - User receives many Bookings as a Provider
   - User gives and receives many Reviews
   - User sends and receives many Messages
   - User authors many Discussions and Comments

2. **Service-Related Entities**
   - Service belongs to one Category
   - Service has many ServiceFeatures
   - Service has many Bookings
   - Service has many Reviews

3. **Booking-Related Entities**
   - Booking has one Transaction
   - Booking has one Review

4. **Community-Related Entities**
   - Discussion has many Comments
   - Events and Groups for student activities

---

## Technology Stack

### Frontend

The frontend is built with:

- **Next.js 15.1.0** - React framework for server-side rendering and static site generation
- **React 19** - UI library for building component-based interfaces
- **TypeScript** - Typed JavaScript for better development experience
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **NextAuth.js** - Authentication for Next.js applications
- **React Query** - Data fetching and state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Recharts** - Charting library
- **date-fns** - Date utility library
- **next-themes** - Theme management for Next.js

### Backend

The backend is built with:

- **Node.js** - JavaScript runtime
- **Express** - Web framework for Node.js
- **Prisma** - ORM for database access
- **MongoDB** - Database
- **TypeScript** - For type safety
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **WebSockets** - Real-time communication
- **Multer** - File uploads
- **dotenv** - Environment variables

### Database

The project uses:

- **MongoDB** - NoSQL database
- **Prisma ORM** - Type-safe database client
- **Prisma Schema** - Database schema definition

---

## Project Structure

### Backend Structure

```
backend/
├── controllers/          # Request handlers
│   ├── admin.controller.js
│   ├── auth.controller.js
│   ├── booking.controller.js
│   └── ...
├── middleware/           # Express middleware
│   └── auth.middleware.js
├── models/               # MongoDB/Mongoose models
│   ├── booking.model.js
│   ├── category.model.js
│   └── ...
├── prisma/               # Prisma ORM
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── routes/               # API routes
│   ├── admin.routes.js
│   ├── auth.routes.js
│   └── ...
├── .env                  # Environment variables
├── package.json          # Dependencies
├── server.js             # Express server
└── websocket-server.js   # WebSocket server
```

### Frontend Structure

```
frontend/
├── app/                  # Next.js App Router
│   ├── globals.css
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   ├── about/
│   ├── admin/
│   ├── api/              # API routes
│   ├── bookings/
│   ├── categories/
│   └── ...
├── components/           # React components
│   ├── admin-dashboard.tsx
│   ├── booking-calendar.tsx
│   ├── ui/               # UI components
│   └── ...
├── contexts/             # React contexts
│   └── auth-context.tsx
├── hooks/                # Custom hooks
│   └── use-mobile.ts
├── lib/                  # Utility functions
│   ├── api-client.ts
│   ├── auth.ts
│   ├── services/         # Service modules
│   └── ...
├── public/               # Static files
├── .env.local            # Environment variables
└── package.json          # Dependencies
```

---

## Features

### Authentication

- **User Registration**: Students can create accounts with email, password, and additional details
- **Login/Logout**: Secure authentication with JWT and NextAuth
- **Profile Management**: Users can update their profiles, add skills, education, and certifications
- **Role-Based Access**: Different roles (User, Provider, Admin) with specific permissions

### Service Management

- **Service Creation**: Providers can create detailed service listings with title, description, price, etc.
- **Service Categories**: Services are organized by categories
- **Service Features**: Providers can add specific features to their services
- **Service Search**: Users can search and filter services by various criteria
- **Service Details**: Detailed view of services with all relevant information

### Booking System

- **Booking Creation**: Users can book services by selecting date, time, and providing notes
- **Booking Management**: Providers can accept/reject booking requests
- **Booking Status**: Tracking of booking status (pending, confirmed, in progress, completed, canceled)
- **Booking History**: Users can view their booking history

### Review System

- **Review Submission**: Users can rate and review services they've booked
- **Rating System**: Star-based rating system
- **Review Management**: Admin can moderate reviews

### Messaging System

- **Direct Messaging**: Users can communicate directly with service providers
- **Message History**: Users can view their message history
- **Read Status**: Tracking of read/unread messages

### Payment Processing

- **Secure Payments**: Integration with payment gateway
- **Transaction History**: Users can view their transaction history
- **Refunds**: Support for refunds when necessary
- **Earnings Tracking**: Providers can track their earnings

### Community Features

- **Discussions**: Users can create and participate in discussions
- **Comments**: Users can comment on discussions
- **Groups**: Users can create and join groups based on interests
- **Events**: Users can create and attend events

### Admin Dashboard

- **User Management**: Admin can view and manage user accounts
- **Service Management**: Admin can review and moderate service listings
- **Booking Overview**: Admin can view and manage bookings
- **Report Generation**: Admin can generate various reports
- **Announcement System**: Admin can send announcements to users
- **Support Ticket Management**: Admin can handle user support tickets
- **Financial Monitoring**: Admin can monitor platform finances

---

## Database Schema

The database schema is defined using Prisma and includes these main models:

### User Model
```prisma
model User {
  id            String     @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  email         String     @unique
  emailVerified DateTime?
  password      String
  image         String?
  phone         String?
  studentId     String?    @unique
  bio           String?
  title         String?
  role          Role       @default(USER)
  status        Status     @default(ACTIVE)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relations
  providedServices Service[]
  bookingsAsCustomer Booking[]
  bookingsAsProvider Booking[]
  reviewsGiven      Review[]
  reviewsReceived   Review[]
  sentMessages      Message[]
  receivedMessages  Message[]
  skills            UserSkill[]
  education         Education[]
  certification     Certification[]
  transactions      Transaction[]
}
```

### Service Model
```prisma
model Service {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  description String
  price       Float
  priceType   String?
  location    String
  image       String?
  featured    Boolean   @default(false)
  discount    Int?
  availability String?
  deliveryTime String?
  status      Status    @default(ACTIVE)
  providerId  String    @db.ObjectId
  categoryId  String    @db.ObjectId
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  provider    User      @relation("ServiceProvider", fields: [providerId], references: [id])
  category    Category  @relation(fields: [categoryId], references: [id])
  bookings    Booking[]
  reviews     Review[]
  features    ServiceFeature[]
}
```

### Booking Model
```prisma
model Booking {
  id          String        @id @default(auto()) @map("_id") @db.ObjectId
  customerId  String        @db.ObjectId
  providerId  String        @db.ObjectId
  serviceId   String        @db.ObjectId
  date        DateTime
  startTime   DateTime?
  endTime     DateTime?
  status      BookingStatus @default(PENDING)
  totalAmount Float
  notes       String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  customer    User          @relation("BookingCustomer", fields: [customerId], references: [id])
  provider    User          @relation("BookingProvider", fields: [providerId], references: [id])
  service     Service       @relation(fields: [serviceId], references: [id])
  review      Review?
  transaction Transaction?
}
```

Additional models include Review, Message, Transaction, Discussion, Comment, Event, and more. The schema defines relationships between these models to represent the complex interactions within the system.

---

## Setup & Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Git

### Backend Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd student-marketplace
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/student_marketplace
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Generate Prisma client, push the schema, and seed the database
   ```bash
   npm run prisma:generate
   npm run prisma:push
   npm run prisma:seed
   ```

5. Start the backend server
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

2. Create a `.env.local` file in the frontend directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

3. Start the frontend development server
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:3000`

---

## API Overview

The API is organized around RESTful principles. The main API endpoints include:

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user info

### User Endpoints
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Service Endpoints
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create a new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Booking Endpoints
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Review Endpoints
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get review by ID
- `POST /api/reviews` - Create a new review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Message Endpoints
- `GET /api/messages` - Get user's messages
- `POST /api/messages` - Send a message
- `PUT /api/messages/:id` - Mark message as read

### Admin Endpoints
- `GET /api/admin/dashboard` - Get admin dashboard data
- `GET /api/admin/users` - Get all users
- `GET /api/admin/services` - Get all services
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/transactions` - Get all transactions
- `GET /api/admin/reports` - Generate reports

---

## Deployment Guide

### Backend Deployment

1. Prepare the backend for production
   ```bash
   cd backend
   npm install --production
   ```

2. Set up environment variables for production
   ```
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_production_jwt_secret
   NODE_ENV=production
   PORT=5000
   ```

3. Start the server
   ```bash
   npm start
   ```

### Frontend Deployment

1. Prepare the frontend for production
   ```bash
   cd frontend
   npm install --production
   ```

2. Set up environment variables for production
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.com/api
   NEXTAUTH_URL=https://your-frontend-url.com
   NEXTAUTH_SECRET=your_production_nextauth_secret
   ```

3. Build the Next.js application
   ```bash
   npm run build
   ```

4. Start the production server
   ```bash
   npm start
   ```

Alternatively, deploy the frontend to Vercel:
1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Configure environment variables in the Vercel dashboard
4. Deploy

---

## Conclusion

The Student Marketplace is a robust platform enabling students to offer and book services within their educational institution. The documentation provides a comprehensive overview of the system architecture, technology stack, features, and setup instructions. For further assistance or to report issues, please contact the development team.