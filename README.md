# E-Commerce Application

A full-featured e-commerce platform built with Next.js, TypeScript, and MongoDB Atlas, supporting item ratings, reviews, and administrative functionalities.

## Overview

This application provides a complete e-commerce experience with user authentication, item browsing, rating system, and an admin interface for managing items and users. The platform is designed to be responsive and user-friendly.

## Deployment

The application is deployed on Vercel. You can access it at: [Vercel](https://e-commerce-web-application-farukclk.vercel.app/)

---

## Features

- **User Authentication**
  - Secure login and session management
  - Role-based access control (Admin/Regular users)
  - Profile management

- **Item Management**
  - Browse items by category
  - Detailed item pages with specifications
  - Category-based filtering

- **Rating & Review System**
  - Rate items (1-10 scale)
  - Write and manage item reviews
  - View user ratings history

- **Admin Dashboard**
  - User management (create, view, delete)
  - Item management (create, view, delete)
  - System monitoring

- **Responsive Design**
  - Mobile-friendly interface
  - Tailwind CSS styling
 
---

## Item Categories

The application supports various item categories, each with specific attributes:

- **Vinyls** - Age, Material
- **Antique Furniture** - Age, Material
- **GPS Sport Watches** - Battery Life
- **Running Shoes** - Size, Material

---

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js
- **Password Hashing**: bcryptjs
- **Deployment**: Vercel

## Framework & Tech Stack Choices

### Frontend
**Next.js 14 + React 18**
 - Full-stack framework with server-side rendering
 - Fast performance and improved loading states
 - Latest React features including Server Components

**TypeScript**
 - Strong typing for improved code quality
 - Enhanced developer experience with better autocomplete
 - Reduced runtime errors through compile-time checking

**Tailwind CSS**
 - Utility-first approach for rapid UI development
 - Responsive design out of the box
 - Customizable design system with minimal CSS

### Backend & Data
**Next.js API Routes**
 - Seamless backend integration within the same codebase
 - Simplified development workflow
 - Eliminates need for separate server infrastructure

**MongoDB Atlas** *(required by homework assignment)*
 - Cloud-hosted NoSQL database with flexible schema
 - Easy scaling for growing applications
 - Built-in data redundancy and backups

### Authentication & Security
**NextAuth.js**
 - Comprehensive authentication solution for Next.js
 - Multiple provider support (Google, GitHub, etc.)
 - Secure, production-ready implementation

**bcryptjs**
 - Secure password hashing and verification
 - Lightweight implementation optimized for JavaScript

### Deployment
**Vercel** *(required by homework assignment)*
 - Zero-configuration deployments optimized for Next.js
 - Automatic preview deployments for each commit
 - Global CDN for optimal performance

---

## Admin Access

To access the admin dashboard:
- Username: admin1
- Password: admin1
- Username: admin2
- Password: admin2

## Regular User Access

You can create new users through the admin dashboard or use the registration page. These are the users I created:
- Username: testuser1
- Password: testuser1
- Username: testuser2
- Password: testuser2
- Username: testuser3
- Password: testuser3

---

## Main Sections

- **Home Page**: Explore all items or filter by category.  
- **Item Details**: Click a item to see full information and user reviews.  
- **User Profile**: Viewable from the navigation bar after logging in.  
- **Admin Dashboard**: Accessible only after logging in as an admin.

---

## Regular User Features

### Logging In
- Sign in using your existing account credentials.

### Browsing & Interacting
- Browse or filter items on the **Home Page**.
- Click an item to view detailed information and user reviews.
- Leave your own ratings and reviews on item pages.

### Your Profile
- View your review history and personal information in your **User Profile**.
- Explore other users' profiles to see their review activity.

---

## Administrator Capabilities

### Admin Access
- Log in using **admin credentials**.
- Open the **Admin Dashboard** from the top navigation bar.

### Item Management

- **View** the full list of items.  
- **Add items** using the "Add New Item" button (available on the **Home Page** and **Admin Dashboard**).  
- **Fill in item details** based on the selected category.  
- **Delete items** directly from the Admin Dashboard.


### User Management

- **View all registered users**.  
- **Add new users**, assigning either regular or admin privileges.  
- **Delete users** from their profile page or through the Admin Dashboard.
  
