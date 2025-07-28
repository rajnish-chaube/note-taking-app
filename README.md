# NoteTaker - Full-Stack Note-Taking Application

A modern, secure note-taking application built with React, TypeScript, and Express. Features user authentication, real-time note management, and a beautiful responsive UI.

## 🚀 Features

- **Secure Authentication**: Email/password signup and login with JWT tokens
- **Email Integration**: Real OTP delivery via SendGrid, Gmail, or custom SMTP
- **Google OAuth**: Complete Google authentication integration
- **Advanced Note Management**: Create, edit, delete, pin, and archive notes
- **Smart Organization**: Tag system with filtering and search capabilities
- **Color Coding**: 8 beautiful colors for visual note organization
- **Full-Text Search**: Instant search across titles, content, and tags
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time UI**: Instant updates with beautiful animations
- **MongoDB Integration**: Production-ready database with proper indexing

## 🛠️ Technology Stack

### Frontend

- **React 18** with TypeScript
- **React Router 6** for navigation
- **TailwindCSS 3** for styling
- **Radix UI** for accessible components
- **Tanstack Query** for data fetching
- **Vite** for development and building

### Backend

- **Express.js** with TypeScript
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

### Development

- **TypeScript** throughout
- **Vitest** for testing
- **ESLint & Prettier** for code quality

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Git

## 🔧 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd note-taking-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:

   ```env
   JWT_SECRET=your-super-secret-jwt-key-here
   PING_MESSAGE=Server is running!
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Setup Database**
   Install and start MongoDB:

   ```bash
   # macOS with Homebrew
   brew install mongodb-community
   brew services start mongodb-community

   # Ubuntu/Debian
   sudo apt install mongodb
   sudo systemctl start mongodb

   # Or use MongoDB Atlas (cloud)
   # Set MONGODB_URI to your Atlas connection string
   ```

6. **Open your browser**
   Navigate to `http://localhost:8080`

## 🏗️ Project Structure

```
├── client/                 # React frontend
│   ├─��� components/ui/      # Reusable UI components
│   ├── contexts/          # React contexts (Auth)
│   ├── pages/             # Route components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── App.tsx            # Main app component
│   └── global.css         # Global styles
├── server/                # Express backend
│   ├─�� routes/           # API route handlers
│   │   ├── auth.ts       # Authentication routes
│   │   ├── notes.ts      # Notes CRUD routes
│   │   └── demo.ts       # Demo/ping routes
│   └── index.ts          # Server setup
├── shared/               # Shared TypeScript types
│   └── api.ts           # API interfaces
└── package.json         # Dependencies and scripts
```

## 📚 Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run tests
- `npm run typecheck` - TypeScript validation

## 🔐 Authentication Flow

### Email/Password Registration

1. User enters email, name, and password
2. Password is hashed with bcryptjs
3. User is stored in memory (replace with database)
4. JWT token is generated and returned

### Login

1. User enters email and password
2. Password is verified against stored hash
3. JWT token is generated and returned

### OTP Flow (Placeholder)

1. User requests OTP for email
2. 6-digit OTP is generated and logged to console
3. User enters OTP for verification
4. On success, user is created/logged in with JWT

### Protected Routes

- All note operations require valid JWT token
- Token is sent in Authorization header: `Bearer <token>`

## 📝 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user info

### Notes (Protected)

- `GET /api/notes` - Get all user notes
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## 📧 Email Setup

The app supports multiple email providers for OTP and welcome emails:

### SendGrid (Recommended for Production)

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key
3. Verify a sender email
4. Set environment variables:
   ```env
   SENDGRID_API_KEY=your-api-key
   FROM_EMAIL=noreply@yourdomain.com
   ```

### Gmail SMTP (Development)

1. Enable 2-factor authentication on your Google account
2. Generate an App Password
3. Set environment variables:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### Custom SMTP

```env
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:8080`
6. Set environment variables:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## 💾 Database Integration

Using MongoDB with Mongoose for production-ready data storage:

### For MongoDB

```bash
npm install mongodb mongoose
```

### For PostgreSQL

```bash
npm install pg @types/pg
```

### For MySQL

```bash
npm install mysql2
```

Update the route handlers in `server/routes/auth.ts` and `server/routes/notes.ts` to use your chosen database.

## 🌍 Deployment

### Netlify (Recommended)

1. Connect your repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist/spa`
4. Set environment variables in Netlify dashboard

### Other Platforms

The app builds to static files and can be deployed to:

- Vercel
- Heroku
- AWS
- DigitalOcean
- Any static hosting service

## 🔧 Customization

### Adding New Features

1. Add API interfaces to `shared/api.ts`
2. Create server routes in `server/routes/`
3. Add React components in `client/components/`
4. Create pages in `client/pages/`
5. Update routing in `client/App.tsx`

### Styling

- Modify `client/global.css` for global styles
- Update `tailwind.config.ts` for theme customization
- Use existing UI components or add new ones

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Kill process on port 8080
   lsof -ti:8080 | xargs kill -9
   ```

2. **TypeScript errors**

   ```bash
   npm run typecheck
   ```

3. **Dependencies issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ using modern web technologies.
