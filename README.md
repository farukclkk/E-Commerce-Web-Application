# E-Commerce Web Application

This is an e-commerce web application built with Next.js, TypeScript, and MongoDB Atlas. The application allows users to browse items, rate and review products, and includes admin capabilities for managing items and users.

## Features

- User Authentication (Admin and Regular Users)
- Item Browsing with Category Filtering
- Item Rating and Review System
- Admin Dashboard for Managing Items and Users
- Responsive Design with Tailwind CSS

## Categories

- Vinyls
- Antique Furniture
- GPS Sport Watches
- Running Shoes

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_atlas_uri
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Admin Access

To access the admin dashboard:
- Username: admin
- Password: admin123

## Regular User Access

You can create new users through the admin dashboard or use the registration page.

## Database Schema

The application uses a flexible NoSQL schema with the following main collections:
- Users
- Items
- Reviews

## Deployment

The application is deployed on Vercel. You can access it at: [Your Vercel Deployment URL]

## Design Decisions

1. **Next.js**: Chosen for its server-side rendering capabilities, API routes, and excellent developer experience.
2. **TypeScript**: Implemented for better type safety and improved development experience.
3. **MongoDB Atlas**: Selected for its flexibility with NoSQL schema and cloud hosting capabilities.
4. **Tailwind CSS**: Used for rapid UI development and responsive design.
5. **NextAuth.js**: Implemented for secure authentication and session management.

## User Guide

1. **Browsing Items**:
   - Use the category filters on the homepage
   - Click on items to view details
   - View ratings and reviews

2. **User Features**:
   - Register/Login to access user features
   - Rate items (1-10 scale)
   - Write and update reviews
   - View your profile and rating history

3. **Admin Features**:
   - Add/Remove items
   - Manage users
   - View all ratings and reviews 