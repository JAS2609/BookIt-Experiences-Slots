# BookIt: Experiences & Slots Booking Application  
A full-stack booking application built with Next.js + Prisma for experiences and slot bookings.

## Table of Contents  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Prerequisites](#prerequisites)  
- [Setup](#setup)  
  - [Clone Repository](#clone-repository)  
  - [Install Dependencies](#install-dependencies)  
  - [Configuration](#configuration)  
  - [Database Setup](#database-setup)  
- [Running the Application](#running-the-application)  
  - [Development Mode](#development-mode)  
  - [Production Build](#production-build)  
- [Environment Variables](#environment-variables)  
- [Project Structure](#project-structure)  
- [Deployment](#deployment)  
- [Contributing](#contributing)  
- [License](#license)

## Features  
- List and book experiences (activities, events)  
- Time-slot based booking for each experience  
- User authentication (if implemented)  
- Admin or host panel (if implemented)  
- Real-time updates or schedule management (if implemented)  
- Responsive UI built with Next.js  

## Tech Stack  
- [Next.js](https://nextjs.org/) (React framework) :contentReference[oaicite:2]{index=2}  
- TypeScript  
- [Prisma](https://www.prisma.io/) ORM (folder `prisma/`)  
- PostgreSQL, MySQL or SQLite (choose your database)  
- (Optional) Tailwind CSS / PostCSS / other UI styling tools  
- (Optional) Hosting via Vercel, Netlify, or your preferred platform  

## Prerequisites  
- Node.js (preferably LTS version, e.g. 16.x or 18.x)  
- npm or yarn (or pnpm)  
- A running database server (PostgreSQL, MySQL, SQLite)  
- Git (to clone the repo)  

## Setup  

### Clone Repository  
```bash
git clone https://github.com/JAS2609/BookIt-Experiences-Slots.git  
cd BookIt-Experiences-Slots


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

