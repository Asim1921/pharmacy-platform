# PharmaHub - Community Pharmacies Online Ordering Platform

A modern, full-featured web application for managing and ordering medications from community pharmacies. Built with Next.js, React, TypeScript, Firebase, and Leaflet.

## Features

### User Features
- 🔐 **Authentication**: Secure user registration and login with role-based access
- 🔍 **Advanced Search**: Search products by name, category, or pharmacy location
- 🛒 **Shopping Cart**: Add products to cart with real-time quantity management
- 📦 **Order Management**: View order history and detailed order information
- 🗺️ **Interactive Map**: Find pharmacies on an interactive map using Leaflet
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Admin Features
- 🏥 **Pharmacy Management**: Add, edit, and remove pharmacies
- 💊 **Product Management**: Manage product inventory with detailed information
- 📊 **Order Tracking**: View and manage all customer orders
- 📈 **Inventory Monitoring**: Real-time stock tracking to prevent out-of-stock issues

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion (animations)
- **Backend**: Firebase (Firestore, Authentication)
- **Maps**: Leaflet & React-Leaflet
- **State Management**: Zustand
- **UI Components**: Custom components with Aceternity UI styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pharmacy-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your Firebase configuration

4. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Firebase Setup

### Firestore Collections

The application uses the following Firestore collections:

- **users**: User accounts with role information
- **pharmacies**: Pharmacy information with location data
- **products**: Product inventory with pharmacy references
- **orders**: Customer orders with items and status

### Creating an Admin User

To create an admin user:
1. Register a new account through the UI
2. In Firebase Console, go to Firestore
3. Find the user document in the `users` collection
4. Update the `role` field to `"admin"`

## Project Structure

```
pharmacy-platform/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Admin dashboard
│   ├── products/          # Product listing
│   ├── orders/            # Order history
│   ├── cart/              # Shopping cart
│   └── map/               # Pharmacy map
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── lib/                   # Utilities and configurations
├── store/                 # Zustand state management
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Key Features Implementation

### Search Functionality
- Search by product name
- Filter by category (prescription, OTC, wellness, etc.)
- Filter by pharmacy location

### Order System
- Real-time inventory updates
- Quantity validation
- Order status tracking
- Order cancellation before checkout

### Map Integration
- Interactive Leaflet map
- Pharmacy markers with popups
- Click markers to view pharmacy details and products
- Direct ordering from map view

### Admin Dashboard
- Comprehensive pharmacy management
- Product CRUD operations
- Order monitoring and tracking
- Inventory level monitoring

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to Vercel, Netlify, or your preferred hosting platform

3. Make sure to set environment variables in your hosting platform

## License

This project is created for educational purposes.

## Support

For issues and questions, please open an issue in the repository.
