# weRemind - Multi-Channel Reminder Management System

A comprehensive reminder management application that helps users never miss important tasks with smart notifications delivered via WhatsApp, Email, and Phone calls.

![weRemind Logo](https://img.shields.io/badge/weRemind-Smart%20Reminders-blue)
![React](https://img.shields.io/badge/React-18.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-16.0.0-green)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0.0-green)

## 🌟 Features

### 🔔 Multi-Channel Notifications
- **WhatsApp Messages**: Send reminders via WhatsApp
- **Email Notifications**: Receive reminders in your inbox
- **Phone Calls**: Get voice call reminders
- **Real-time Processing**: Automated reminder delivery system

### 🎯 Smart Features
- **Timezone Accuracy**: Precise reminder scheduling across different time zones
- **User Data Isolation**: Secure, private reminder management per user
- **Mobile Responsive**: Optimized for all devices with intuitive navigation
- **Dark Mode Support**: Complete dark theme with proper text visibility
- **Real-time Updates**: Live reminder status and delivery tracking

### 🔐 Security & Privacy
- **User Authentication**: Firebase Authentication integration
- **Data Privacy**: Each user only sees their own reminders
- **Secure API**: Protected endpoints with user verification
- **HTTPS Deployment**: Secure hosting on Vercel and Render

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern UI framework
- **CSS3** - Responsive design with custom styling
- **React Icons** - Beautiful icon library
- **React Router** - Client-side routing

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Mongoose** - MongoDB object modeling

### Authentication & Notifications
- **Firebase Authentication** - User management
- **Twilio API** - SMS and WhatsApp messaging
- **Nodemailer** - Email delivery with Gmail SMTP
- **Node-cron** - Automated reminder processing

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Cloud database

## 🚀 Live Demo

**🌐 Live Application**: [we-remind.vercel.app](https://we-remind.vercel.app)

## 📱 Screenshots

### Homepage
<img width="1915" height="929" alt="image" src="https://github.com/user-attachments/assets/37c97bf7-6eb0-4934-a135-0e32f220fd90" />

- Clean, modern interface with centered navigation
- Hero section with "Never Miss Important Reminders Again"
- Multi-channel notification preview
- Call-to-action buttons for getting started

### Dashboard
<img width="1912" height="929" alt="image" src="https://github.com/user-attachments/assets/b2a4f561-dd30-4d48-b35f-6ec7ecae4f0b" />

- Sidebar navigation with user information
- Reminders management interface
- Add reminder functionality
- Usage statistics and progress tracking

### Notification Channels
<img width="1914" height="928" alt="image" src="https://github.com/user-attachments/assets/4d8b2608-5ee1-45b3-8ccc-1f2aefdc25e4" />

- Email, Phone, and WhatsApp integration
- Channel verification system
- Connection status indicators
- Premium features for WhatsApp

### Settings & Profile
<img width="1915" height="921" alt="image" src="https://github.com/user-attachments/assets/9c466b45-1f8e-44dc-ad65-796cd0e933fe" />

- Account information management
- Profile settings with Google integration
- Account deletion options
- User preferences

### Feedback System
<img width="1916" height="925" alt="image" src="https://github.com/user-attachments/assets/a14e21d4-c827-4c1e-bde1-a66c2a80f758" />

- User feedback submission
- Clean feedback interface
- Direct communication channel

### Mobile Responsive
- Hamburger menu for mobile devices
- Touch-friendly interface
- Optimized for all screen sizes
- Dark mode support

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Twilio account (for SMS/WhatsApp)
- Gmail account (for email notifications)
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/we-remind.git
   cd we-remind
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the backend directory:
   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   PORT=4000
   ```

5. **Start the development servers**

   **Backend:**
   ```bash
   cd backend
   npm start
   ```

   **Frontend:**
   ```bash
   npm start
   ```

## 📖 Usage

### Creating Reminders
1. **Login** to your account
2. **Navigate** to the Dashboard
3. **Click** "+ Add Reminder"
4. **Enter** reminder title and datetime
5. **Select** notification methods (Email/Phone/WhatsApp)
6. **Save** the reminder

### Managing Notifications
1. **Verify** your contact channels in Settings
2. **Receive** OTP verification codes
3. **Confirm** your email, phone, or WhatsApp
4. **Start** receiving reminders

### Dark Mode
- **Toggle** dark mode from the sidebar
- **Enjoy** reduced eye strain in low-light environments

## 🔧 API Endpoints

### Authentication
- `POST /api/otp/send-otp` - Send OTP for verification
- `POST /api/otp/verify-otp` - Verify OTP and activate channel

### Reminders
- `POST /api/reminders` - Create new reminder
- `GET /api/reminders/user/:userId` - Get user's reminders
- `DELETE /api/reminders/:reminderId` - Delete reminder

### User Channels
- `GET /api/otp/user-channels/:userId` - Get user's verified channels
- `DELETE /api/otp/disconnect-channel/:userId/:channelType` - Disconnect channel

## 🚀 Deployment

### Frontend (Vercel)
1. **Connect** your GitHub repository to Vercel
2. **Set** build command: `npm run build`
3. **Set** output directory: `build`
4. **Deploy** automatically on push

### Backend (Render)
1. **Connect** your GitHub repository to Render
2. **Set** environment variables
3. **Set** build command: `npm install`
4. **Set** start command: `npm start`

### Database (MongoDB Atlas)
1. **Create** MongoDB Atlas cluster
2. **Get** connection string
3. **Add** to environment variables

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Twilio** for SMS and WhatsApp integration
- **Firebase** for authentication services
- **Vercel** and **Render** for hosting
- **MongoDB Atlas** for database hosting

## 📞 Support

If you encounter any issues or have questions:

- **Create** an issue on GitHub
- **Email** support at support@weremind.com
- **Check** the documentation for common solutions

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Multi-channel notification system
- ✅ User authentication and data isolation
- ✅ Mobile responsive design
- ✅ Dark mode support
- ✅ Timezone-accurate scheduling
- ✅ Real-time reminder processing

---

**Made with ❤️ by Sarthak Pandey**

*Never miss important reminders again with weRemind!*
