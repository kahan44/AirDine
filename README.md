# AirDine - Restaurant Management Platform

A comprehensive full-stack restaurant management platform built with Django and React.

## 🚀 Features

- **User Management**: Customer registration, authentication, and profile management
- **Restaurant Discovery**: Browse restaurants with search and filtering capabilities
- **Menu Management**: Dynamic menu display with categories and pricing
- **Table Booking**: Real-time table reservation system
- **Order Management**: Complete order processing workflow
- **Reviews & Ratings**: Customer feedback and rating system
- **Offers & Promotions**: Discount management with terms and conditions
- **Admin Dashboard**: Comprehensive admin panel for restaurant management
- **Staff Management**: Role-based access control for staff members
- **Inventory Tracking**: Restaurant inventory management system

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 5.2
- **API**: Django REST Framework
- **Database**: SQLite (development)
- **Authentication**: JWT Token-based authentication
- **Timezone**: Asia/Kolkata

### Frontend
- **Framework**: React 19.1
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📁 Project Structure

```
AirDine/
├── backend/
│   ├── manage.py
│   ├── db.sqlite3
│   ├── airdine/          # Project settings
│   └── apps/             # Django apps
│       ├── authentication/
│       ├── bookings/
│       ├── inventory/
│       ├── menu/
│       ├── orders/
│       ├── restaurant/
│       ├── reviews/
│       └── staff/
├── frontend/
│   └── airdine_frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── contexts/
│       │   ├── services/
│       │   └── utils/
│       ├── public/
│       └── package.json
└── ppt/                  # Project presentation materials
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
```

3. Install dependencies:
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Start development server:
```bash
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend/airdine_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🔧 Configuration

### Backend Configuration
- Database settings in `backend/airdine/settings.py`
- CORS settings configured for frontend communication
- JWT token expiration and refresh settings
- Timezone set to Asia/Kolkata

### Frontend Configuration
- API base URL in axios configuration
- Routing setup in main application component
- TailwindCSS configuration for styling

## 📱 Key Features Detail

### User Dashboard
- Profile management
- Restaurant browsing with search
- Table booking interface
- Order history and tracking
- Review and rating system

### Admin Dashboard
- Restaurant management
- Menu item management
- Offer creation and management
- Staff management
- Booking oversight
- Inventory tracking

### Authentication System
- JWT-based secure authentication
- Role-based access control
- Token refresh mechanism
- Protected routes and API endpoints

## 🌟 Special Features

- **Real-time Search**: Debounced restaurant search with smooth UX
- **Timezone Handling**: Proper datetime conversion for offers and bookings
- **Responsive Design**: Mobile-first responsive interface
- **Error Handling**: Comprehensive error handling and validation
- **Admin Tools**: Advanced admin interface for complete platform management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Team

Developed as part of SEM IV project work.

## 📞 Support

For support, email or create an issue in the repository.

---

**Note**: This is a development version. For production deployment, additional configuration for database, security, and performance optimization is recommended.
