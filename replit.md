# My Pregnancy Passport

## Overview

My Pregnancy Passport is a comprehensive digital healthcare application designed to manage pregnancy health records for both patients and healthcare providers. The platform serves as a centralized system where pregnant patients can track their pregnancy journey, manage appointments, store medical records, and access educational resources, while clinicians can monitor multiple patients, review medical data, and provide care coordination. The application features role-based access control with separate interfaces for patients and clinicians, ensuring appropriate data access and functionality for each user type.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, utilizing Wouter for client-side routing and Vite as the build tool. The UI framework is based on Radix UI components with shadcn/ui styling, providing a modern and accessible interface. The application uses TanStack Query for server state management and React Hook Form with Zod for form validation. The frontend implements responsive design with Tailwind CSS for styling and supports both mobile and desktop interfaces.

### Backend Architecture
The server is built with Express.js and TypeScript, following a RESTful API design pattern. The backend implements session-based authentication using Passport.js with local strategy, supporting role-based access control (patient, clinician, admin). The application uses middleware for request logging, error handling, and authentication verification. Route handlers are organized by functionality with separate modules for general routes, clinician-specific routes, and authentication.

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for database interactions and schema management. The database is configured to work with Neon serverless PostgreSQL, with connection pooling and migration support. The schema includes comprehensive tables for users, pregnancies, appointments, vital statistics, test results, scans, messages, and educational content. Session data is stored using connect-pg-simple when a database is available, with fallback to in-memory storage.

### Authentication and Authorization
User authentication is handled through a dual approach: Passport.js for session management and Firebase Authentication for additional security features like password reset. The system supports role-based access control with three primary roles (patient, clinician, admin). Security features include session timeout monitoring, security audit logging, password hashing using Node.js crypto module, and protected routes with role-based redirection.

## External Dependencies

- **Database**: PostgreSQL via Neon serverless with connection pooling
- **Authentication Services**: Firebase Authentication for password management and user verification
- **Email Services**: SendGrid for transactional emails and notifications
- **UI Components**: Radix UI primitives for accessible component foundation
- **Development Tools**: Replit integration with cartographer and runtime error overlay plugins
- **Session Storage**: PostgreSQL-backed session store with in-memory fallback
- **File Upload**: Placeholder integration for medical document and scan image storage