# Restaurant POS CMS System

A comprehensive Point of Sale and Content Management System for restaurants built with modern technologies.

## 🚀 Tech Stack

- **Backend**: Node.js + TypeScript + NestJS
- **Database**: PostgreSQL
- **Real-time**: WebSocket (Socket.io)
- **CMS Dashboard**: React + TypeScript + TailwindCSS
- **POS App**: React + TypeScript

## 📁 Project Structure

```
cms_pos_restaurant/
├── backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── auth/          # Authentication & Authorization
│   │   ├── users/         # User Management
│   │   ├── roles/         # Role-based Access Control
│   │   ├── menu/          # Menu Management
│   │   ├── orders/         # Order Processing
│   │   ├── kitchen/        # Kitchen Display System
│   │   ├── payments/       # Payment Processing
│   │   ├── promotions/     # Promotions & Discounts
│   │   ├── reports/        # Analytics & Reporting
│   │   ├── branches/       # Multi-branch Support
│   │   ├── settings/       # System Settings
│   │   └── websocket/      # Real-time Features
│   └── package.json
├── frontend/
│   ├── cms/               # Admin Dashboard
│   └── pos/               # POS Mobile App
└── README.md
```

## ✨ Features

### User Roles & Access Control
- 👤 Owner, Manager, Cashier, Kitchen, Admin roles
- 🔐 JWT Authentication
- 🛡️ Role-based permissions

### Menu Management
- 📋 Categories (Ramen, Sushi, Drinks, etc.)
- 🍽️ Menu items with variants & add-ons
- 🖼️ Image management
- 📦 Stock availability toggle

### Order Management
- 🛒 Create orders (Dine-in, Takeaway, Delivery)
- 📊 Order status tracking (New → Cooking → Ready → Completed)
- 🧾 Order notes & special requests

### Kitchen Display System (KDS)
- 📺 Real-time order display
- 🔔 Sound notifications
- 👆 Bump screen functionality
- ⏱️ Preparation time tracking

### Payment Processing
- 💵 Cash, QRIS, E-wallet support
- 💳 Credit/Debit cards
- 🔄 Split payment
- ↩️ Refund support

### Promotions
- 💰 Percentage & fixed discounts
- ⏰ Time-based promos (Happy Hour)
- 🎯 Menu-specific promotions

### Reports & Analytics
- 📈 Daily/Monthly sales reports
- 🏆 Best-selling items
- 💳 Payment breakdowns
- ❌ Cancelled orders analysis

### Multi-Branch Support
- 🏪 Multiple restaurant locations
- 📍 Branch-specific menus & pricing
- 📊 Branch-level reporting

## 🎨 Color Theme

**Warm Minimal Japanese**
- Primary: Warm Red (#C0392B)
- Background: Rice White (#FAF7F2)
- Text: Charcoal Black (#2C2C2C)
- Secondary: Matcha Green (#6B8E23), Wood Brown (#8B5E3C)

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup
```bash
cd backend
cp .env.example .env
# Configure your database and JWT settings
npm install
npm run start:dev
```

### Frontend Setup
```bash
cd frontend/cms
npm install
npm run dev
```

## 📡 API Documentation

Access Swagger documentation at: `http://localhost:3000/docs`

## 🔌 WebSocket Events

- `order:created` - New order notification
- `order:updated` - Order status changes
- `kitchen:newOrder` - Kitchen display update
- `kitchen:orderReady` - Order ready notification
- `payment:completed` - Payment confirmation

## 📄 License

MIT License

## 👨‍💻 Developed with ❤️ for Restaurant POS
