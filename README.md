# Sail Kokokahi - Volunteer Management System

[![ci-nextjs-application-template](https://github.com/dport96/sail-kokokahi/actions/workflows/ci.yml/badge.svg)](https://github.com/dport96/sail-kokokahi/actions/workflows/ci.yml)

A comprehensive volunteer management system built with Next.js, featuring hour tracking, event management, and administrative tools for volunteer organizations.

## 🚀 Current Features

- **User Management**: Registration, authentication, and role-based access control
- **Event Management**: Create, manage, and track volunteer events
- **Hour Tracking**: Automated pending/approved hour management system
- **QR Code Check-in**: Mobile-friendly event check-in system
- **Admin Dashboard**: Comprehensive admin tools for user and event management
- **Reporting**: Export capabilities and progress tracking
- **Event Attendance**: Add/remove users from events with automatic hour adjustments

## 🎯 Future Improvements & Suggestions

### User Experience Enhancements

#### 1. **Enhanced Dashboard Analytics**

- Monthly/weekly hour completion trends
- User progress visualization with charts (Chart.js or D3.js)
- Completion rate statistics
- Event attendance heatmaps

#### 2. **Real-time Notifications**

- Live notifications for hour approvals/denials
- Real-time event updates
- Push notifications for upcoming events
- Admin alerts for pending approvals

#### 3. **Mobile-First Responsive Design**

- Touch-friendly QR code scanning
- Optimized mobile navigation
- Swipe gestures for quick actions
- Progressive Web App (PWA) capabilities

### Core Functionality Enhancements

#### 4. **Advanced User Management**

- Volunteer coordinators (intermediate admin role)
- Team leaders with limited admin access
- Bulk user import/export functionality
- User profile pictures and bio sections

#### 5. **Event Management Improvements**

- Recurring events support
- Event categories and tags
- Capacity limits and waitlists
- Event reminders and notifications
- Pre-event registration requirements

#### 6. **Hour Tracking Enhancements**

- Time-based check-in/check-out system
- GPS location verification for events
- Photo uploads for event participation proof
- Automatic hour calculations based on actual attendance time
- Hour dispute resolution workflow

### Reporting & Analytics

#### 7. **Advanced Reporting Dashboard**

- Custom date range reports
- Export to multiple formats (PDF, Excel, CSV)
- Volunteer leaderboards
- Event success metrics
- Attendance patterns analysis

#### 8. **Automated Compliance Tracking**

- Certification expiration alerts
- Training completion requirements
- Background check status tracking
- Automated compliance reports

### Technical Improvements

#### 9. **Database Optimization**

- Database indexing optimization
- Query performance monitoring
- Connection pooling improvements
- Caching strategy implementation (Redis)

#### 10. **API Enhancements**

- API versioning
- Rate limiting
- Comprehensive API documentation (OpenAPI/Swagger)
- Webhook support for external integrations

#### 11. **Security Hardening**

- Two-factor authentication (2FA)
- Password strength requirements
- Session management improvements
- Audit logging for admin actions
- CSRF protection enhancements

### Integration & Automation

#### 12. **Third-Party Integrations**

- Google Calendar sync for events
- Slack/Teams notifications
- Email marketing integration (Mailchimp)
- Payment processing for donations
- Background check service integration

#### 13. **Automation Features**

- Automated hour approvals based on rules
- Scheduled reports generation
- Automatic user status updates
- Event reminder automation

### Communication Features

#### 14. **Enhanced Communication**

- In-app messaging system
- Event discussion forums
- Announcement broadcast system
- Team collaboration spaces

#### 15. **Feedback System**

- Event feedback forms
- User experience surveys
- Feature request system
- Bug report integration

### UI/UX Improvements

#### 16. **Modern Interface Updates**

- Dark mode support
- Customizable themes
- Accessibility improvements (WCAG compliance)
- Drag-and-drop interfaces
- Keyboard navigation enhancements

#### 17. **Search and Filtering**

- Global search across all content
- Advanced filtering options
- Saved search preferences
- Quick action shortcuts

### Gamification & Engagement

#### 18. **Volunteer Recognition**

- Achievement badges and rewards
- Volunteer spotlight features
- Milestone celebrations
- Peer recognition system
- Volunteer of the month program

#### 19. **Social Features**

- Volunteer profiles with achievements
- Team formations and competitions
- Social sharing of accomplishments
- Mentorship matching system

### Data Management

#### 20. **Backup and Recovery**

- Automated database backups
- Point-in-time recovery options
- Data export/import tools
- GDPR compliance features

## 📈 Implementation Priority

### **Phase 1 (High Impact, Low Effort)**

1. Enhanced dashboard analytics
2. Mobile responsiveness improvements
3. Real-time notifications
4. Advanced reporting

### **Phase 2 (Medium Impact, Medium Effort)**

1. GPS location verification
2. Automated compliance tracking
3. Third-party integrations
4. Enhanced security features

### **Phase 3 (High Impact, High Effort)**

1. Complete UI/UX overhaul
2. Advanced automation workflows
3. Full mobile app development
4. Comprehensive API ecosystem

## 💡 Quick Wins

Immediate improvements that can be implemented:

1. **Add event capacity limits** - Prevent over-registration
2. **Implement user avatars** - Upload profile pictures
3. **Add event categories** - Better organization
4. **Create volunteer certificates** - PDF generation for completed hours
5. **Add event reminders** - Email/SMS notifications
6. **Implement search functionality** - Find users, events quickly
7. **Add export functionality** - Download reports as Excel/PDF
8. **Create volunteer leaderboards** - Motivate participation

## 🛠️ Technical Stack

- **Frontend**: Next.js 14, React, TypeScript, React Bootstrap
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: CSS Modules, React Bootstrap
- **QR Code**: QR code generation and scanning
- **Notifications**: SweetAlert for user feedback

## � Installation

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL (v12 or later)
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone https://github.com/dport96/sail-kokokahi.git
cd sail-kokokahi
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. PostgreSQL Database Setup

#### Option A: Local PostgreSQL Installation

1. **Install PostgreSQL** (if not already installed):
   - **macOS**: `brew install postgresql`
   - **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`
   - **Windows**: Download from [PostgreSQL website](https://www.postgresql.org/download/)

2. **Start PostgreSQL service**:
   - **macOS**: `brew services start postgresql`
   - **Ubuntu/Debian**: `sudo systemctl start postgresql`
   - **Windows**: Start via Services or PostgreSQL installer

3. **Create database and user**:

   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE sail_kokokahi;
   
   # Create user (optional, for better security)
   CREATE USER sail_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE sail_kokokahi TO sail_user;
   
   # Exit psql
   \q. 
   ```

#### Option B: Using Docker

```bash
# Create and run PostgreSQL container
docker run --name sail-postgres \
  -e POSTGRES_DB=sail_kokokahi \
  -e POSTGRES_USER=sail_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14
```

### 4. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://sail_user:your_password@localhost:5432/sail_kokokahi"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Optional: For production
NODE_ENV="development"
```

### 5. Database Migration

Run Prisma migrations to set up the database schema:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Optional: Seed the database with sample data
npx prisma db seed
```

### 6. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### 7. Initial Setup

1. **Create Admin User**: Register a new account through the application
2. **Database Setup**: The admin user will need to be manually set in the database:

   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';
   ```

### 8. Verify Installation

- Navigate to `http://localhost:3000`
- Register a new account
- Test QR code functionality
- Verify database connectivity in admin dashboard

## 🔧 Development Tools

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: This will delete all data)
npx prisma migrate reset

# Create new migration after schema changes
npx prisma migrate dev --name your_migration_name
```

### Useful Commands

```bash
# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
NODE_ENV="production"
```

### Deployment Platforms

- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Build command: `npm run build`, Publish directory: `.next`
- **Docker**: Use the included Dockerfile for containerized deployments

## �📚 Getting Started

For development setup and detailed documentation, please see [NextJS Application Template](http://ics-software-engineering.github.io/nextjs-application-template/).
