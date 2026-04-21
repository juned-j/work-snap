# WorkSnap - Employee Time Tracking System

## Phase 1 MVP - Technical Implementation

### Overview
WorkSnap is a desktop application for employee activity monitoring and time tracking. This MVP focuses on basic time tracking, screenshot capture, and admin visibility.

### Architecture
- **Frontend**: Electron desktop app with React
- **Backend**: Supabase (PostgreSQL + Storage)
- **Admin Dashboard**: Laravel + Filament (future phase)

### Database Schema (Supabase)

Create these tables in your Supabase project:

#### employees
```sql
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### work_sessions
```sql
CREATE TABLE work_sessions (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active', -- active, paused, stopped
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### screenshots
```sql
CREATE TABLE screenshots (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  session_id INTEGER REFERENCES work_sessions(id),
  image_url TEXT NOT NULL,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Setup
1. Create a storage bucket named `screenshots`
2. Set bucket to public access
3. Configure CORS for your domain

### Environment Setup

#### Frontend (.env.local)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Supabase Configuration
- Enable Row Level Security (RLS) if needed
- Create storage policies for screenshot uploads

### Installation & Setup

1. **Install Dependencies**
   ```bash
   cd electron/renderer
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials

3. **Setup Database**
   - Create tables as shown above
   - Add sample employee data:
   ```sql
   INSERT INTO employees (name, email) VALUES
   ('John Doe', 'john@company.com'),
   ('Jane Smith', 'jane@company.com');
   ```

4. **Run Application**
   ```bash
   npm run dev
   ```

### Features Implemented

#### Desktop Application
- ✅ Employee login (email + simple password)
- ✅ Start/Pause/Stop work session
- ✅ Real-time timer display
- ✅ Idle detection (5-second threshold)
- ✅ Automatic screenshot capture (every 60 seconds)
- ✅ Session data storage in Supabase

#### Screenshot System
- ✅ Full screen capture using Electron desktopCapturer
- ✅ PNG format conversion
- ✅ Upload to Supabase Storage
- ✅ Database record creation

#### Session Management
- ✅ Session creation with employee association
- ✅ Status tracking (active/paused/stopped)
- ✅ Time calculation and storage

### Usage

1. **Login**: Use any email with password "password" (demo)
2. **Start Work**: Click "START TRACKING" to begin session
3. **Activity Monitoring**: System detects mouse/keyboard activity
4. **Auto Pause**: Pauses after 5 seconds of inactivity
5. **Screenshots**: Captured every 60 seconds during active sessions
6. **Stop Work**: Ends session and saves final data

### Success Criteria Met ✅
- Employee login works
- Sessions can start and stop
- Screenshots captured every 60 seconds
- Uploads successful to Supabase
- Admin can view sessions and hours (via Supabase dashboard)

### Future Enhancements (Phase 2+)
- Proper authentication system
- Laravel admin dashboard
- Advanced idle detection
- Time reporting and analytics
- Multi-platform support

### Development Notes
- No keyboard/mouse tracking implemented (as per constraints)
- Simple password authentication for MVP
- All data stored in Supabase for easy admin access
- Electron app captures full screen screenshots
- Real-time session status updates
