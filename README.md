# Sail Kokokahi - Volunteer Management System

[![ci-nextjs-application-template](https://github.com/dport96/sail-kokokahi/actions/workflows/ci.yml/badge.svg)](https://github.com/dport96/sail-kokokahi/actions/workflows/ci.yml)

A comprehensive volunteer management system built with **Next.js**, **React**, **PostgreSQL**, and **Prisma**, featuring event management, hour tracking, and administrative tools for volunteer organizations.

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, Bootstrap, Material-UI
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Credentials Provider)
- **Testing**: Playwright
- **Deployment**: Vercel

## 🚀 Current Features

- **User Management**: Registration, authentication (email/password), role-based access control (USER, ADMIN)
- **Event Management**: Create, update, and manage volunteer events with QR code check-in
- **Hour Tracking**: Automated pending/approved hour management with billing integration
- **Admin Dashboard**: Analytics, settings management, user/event administration
- **Event Analytics**: Track signups and attendance metrics
- **Member Dashboard**: Personal event participation and hour tracking
- **Application Settings**: Configurable parameters including:
  - Hourly Rate
  - Membership Base Amount
  - Hours Required for membership
  - **Time Zone** (with dropdown of common IANA zones)
- **Date/Time Display**: All dates and times respect the configured time zone setting
- **Backup & Restore**: Database backup and restore functionality
- **Password Management**: User password change and reset capabilities

## 📋 Prerequisites

- Node.js 18+ (with npm or yarn)
- PostgreSQL 12+
- Git

## 🛠️ Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/Sail-Kokokahi/sail-kokokahi.git
cd sail-kokokahi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create `.env.local` in the root directory:

```env
# Database
DATABASE_URL="postgresql://sail_user:your_password@localhost:5432/sail_kokokahi"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
# Run migrations
npx prisma migrate deploy

# Seed the database with defaults
npx prisma db seed

# Generate Prisma client
npx prisma generate
```

### 5. Start development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

**Default test users** (created during seed):
- Admin: `admin@foo.com` / `changeme`
- User: `john@foo.com` / `changeme`

## 🧪 Testing

### Run Playwright tests

```bash
npm run test
```

### Run tests in headed mode (see browser)

```bash
npx playwright test --headed
```

## 🏗️ Building for Production

### Build locally

```bash
npm run build
```

This script:
1. Runs Prisma migrations
2. Seeds database with defaults
3. Generates Prisma client
4. Compiles Next.js application

### Start production server

```bash
npm start
```

## 🚀 Deployment to Vercel

The application is configured for seamless Vercel deployment.

### Prerequisites

- Vercel account
- PostgreSQL database (Vercel Postgres or external provider)
- Environment variables configured in Vercel

### Environment Variables (Vercel)

Set these in your Vercel project settings:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Deployment Steps

1. Push to GitHub main branch
2. Vercel will automatically build and deploy
3. The build script automatically:
   - Resolves any failed migrations
   - Runs pending migrations
   - Seeds database with default settings
   - Compiles the application

### Post-Deployment

- Verify application settings are loaded at `/admin-maintenance`
- Check event display respects configured time zone
- Test admin functionality

## 📁 Project Structure

```
sail-kokokahi/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (protected)/        # Protected routes (require auth)
│   │   ├── api/                # API endpoints
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable React components
│   ├── lib/                    # Utility functions
│   │   ├── settings.ts         # Application settings with caching
│   │   ├── dbActions.ts        # Database operations
│   │   └── authOptions.ts      # NextAuth configuration
│   └── pages/                  # Legacy API routes
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Seed script
│   └── migrations/             # Database migrations
├── scripts/
│   ├── dev.sh                  # Development server script
│   └── build.sh                # Build script (migrations + build)
├── tests/                      # Playwright tests
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🔐 Application Settings

Settings are managed in the admin panel at `/admin-maintenance` and stored in the database.

### Available Settings

| Setting | Default | Type | Description |
|---------|---------|------|-------------|
| HOURLY_RATE | 20 | Number | Dollar amount per approved volunteer hour |
| MEMBERSHIP_BASE_AMOUNT | 120 | Number | Base membership cost |
| HOURS_REQUIRED | 6 | Number | Minimum hours required for membership |
| TIME_ZONE | Pacific/Honolulu | String | IANA time zone for all date/time displays |

## ⏰ Time Zone Configuration

The application supports any IANA time zone. All dates and times displayed throughout the application respect the configured time zone setting:

- **Event dates**: Displayed in configured time zone
- **Server time**: Shown in admin pages using configured time zone
- **Current/Past event categorization**: Based on configured time zone

Common time zone options available in the dropdown:
- Pacific/Honolulu (Hawaii)
- America/Anchorage (Alaska)
- America/Los_Angeles (Pacific)
- America/Denver (Mountain)
- America/Chicago (Central)
- America/New_York (Eastern)
- UTC

## 📝 npm Scripts

```bash
npm run dev              # Start development server
npm run dev-network     # Start dev server accessible on network
npm run dev-local       # Start local dev server
npm run dev-https       # Start dev server with HTTPS
npm run build           # Build for production (migrations + seed + build)
npm start               # Start production server
npm run lint            # Run ESLint
npm run test            # Run Playwright tests
npm run playwright-development  # Run tests in headed mode
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally and with Playwright
4. Push to GitHub
5. Create a pull request

## 📦 Database Migrations

Migrations are automatically run during:
- Development (via `npm run dev`)
- Build process (via `npm run build`)
- Server startup on Vercel

To create a new migration:

```bash
npx prisma migrate dev --name <migration-name>
```

## 🛡️ Security Notes

- Passwords are hashed with bcrypt
- Protected routes use NextAuth session verification
- Admin routes are protected with role checks
- Database URL should be kept in environment variables
- NEXTAUTH_SECRET should be a strong random value

## ❓ Troubleshooting

### Database connection issues

```bash
# Check database connection
npx prisma db execute --stdin < /dev/null

# Reset database (development only)
npx prisma migrate reset
```

### Build failures

- Ensure `.env.local` has correct DATABASE_URL
- Run migrations: `npx prisma migrate deploy`
- Seed database: `npx prisma db seed`

### Time zone not updating

- Check Application Settings in admin panel
- Clear browser cache
- Ensure server is reading new settings (no restart needed due to cache invalidation)

## 📞 Support

For issues or questions, please open a GitHub issue.
