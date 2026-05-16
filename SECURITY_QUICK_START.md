# ⚡ Quick Start - Security Implementation Checklist

## 🎯 Step-by-Step Integration Guide

### Phase 1: Setup (30 mins)

- [ ] **1. Read Documentation**
  - Review `SECURITY_SUMMARY.md`
  - Review `SECURITY_IMPLEMENTATION.md`

- [ ] **2. Database Migrations**
  ```bash
  php artisan migrate
  ```
  This creates necessary security fields in:
  - `work_sessions` (ip_address, user_agent, paused_at)
  - `screenshots` (file_path, idle_detected, access_token, etc.)
  - `activity_logs` (new table)

- [ ] **3. Sanctum Setup**
  ```bash
  composer require laravel/sanctum
  php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
  ```

- [ ] **4. Environment Configuration**
  Update `.env`:
  ```env
  VITE_API_URL=http://localhost:8000/api
  SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5176
  SANCTUM_ENCRYPT_COOKIES=false
  ```

### Phase 2: Testing (30 mins)

- [ ] **5. Start Backend Server**
  ```bash
  php artisan serve
  ```

- [ ] **6. Test Auth Endpoints**
  ```bash
  # Register
  curl -X POST http://localhost:8000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","password":"password","password_confirmation":"password"}'

  # Login
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}'
  ```

- [ ] **7. Test Protected Routes**
  ```bash
  # Without token (should fail)
  curl http://localhost:8000/api/session/current

  # With token
  curl -H "Authorization: Bearer YOUR_TOKEN" \
    http://localhost:8000/api/session/current
  ```

- [ ] **8. Build React App**
  ```bash
  npm run build
  ```

- [ ] **9. Start Frontend Dev Server**
  ```bash
  npm run dev
  ```

### Phase 3: Integration (30 mins)

- [ ] **10. Verify React Components**
  - Check `AuthContext` is working
  - Check `ProtectedRoute` component exists
  - Check `useAuthContext` hook is available

- [ ] **11. Verify API Client**
  - Check `apiClient` is properly configured
  - Verify token injection works
  - Test logout on 401

- [ ] **12. Test Login Flow**
  - Open React app
  - Try accessing protected route (should redirect to login)
  - Register new user
  - Verify token is stored in sessionStorage
  - Try accessing protected route (should work)

- [ ] **13. Test Session Management**
  - Start a session
  - Verify activity log is created
  - Upload screenshot
  - Verify screenshot is stored securely
  - Stop session

- [ ] **14. Test Electron App**
  ```bash
  npm run electron
  ```
  - Verify DevTools open in dev mode
  - Try using app without logging in (should not work)
  - Login and verify all features work
  - Try IPC commands (should require auth)

### Phase 4: Security Validation (30 mins)

- [ ] **15. Test Route Protection**
  - Try accessing `/api/session/current` without token → 401
  - Try accessing with invalid token → 401
  - Try accessing with expired token → 401
  - Try accessing other user's sessions → 404

- [ ] **16. Test Screenshot Security**
  - Verify file_path is not in API response
  - Verify download requires valid token
  - Try downloading other user's screenshot → 404
  - Verify access token expires

- [ ] **17. Test Activity Logging**
  - Verify LOGIN action is logged
  - Verify SESSION_START action is logged
  - Verify SCREENSHOT_CAPTURED action is logged
  - Check IP address and user agent are recorded

- [ ] **18. Test IPC Security**
  - Open browser devtools
  - Try `window.electron.captureScreenshot()` without auth → Error
  - Login first
  - Try again → Should work

- [ ] **19. Test Electron Hardening**
  - Verify DevTools opens in dev mode
  - Build production: `npm run build:prod`
  - Run prod build: `NODE_ENV=production npm run electron`
  - Verify DevTools does NOT open

- [ ] **20. Test Token Management**
  - Login with User A
  - Verify token in sessionStorage
  - Close browser
  - Reopen app
  - Verify user is logged out (token cleared)
  - Login with User B
  - Verify User A's token is revoked

---

## 🧪 Test Cases by Feature

### Authentication
```javascript
// Register
POST /api/auth/register
{ name, email, password, password_confirmation }
// Response: { token, user, expires_in }

// Login
POST /api/auth/login
{ email, password }
// Response: { token, user, expires_in }

// Logout
POST /api/auth/logout
Headers: { Authorization: Bearer TOKEN }
// Response: { message: "Logout successful" }
```

### Session Management
```javascript
// Get current
GET /api/session/current
// Requires: token
// Response: { session }

// Start
POST /api/session/start
// Requires: token
// Response: { session }

// Pause/Resume/Stop
POST /api/session/pause/{id}
POST /api/session/resume/{id}
POST /api/session/stop/{id}
// Requires: token and ownership
```

### Screenshot Management
```javascript
// Upload
POST /api/screenshot
{ session_id, image_data (base64), idle_detected }
// Requires: token
// Response: { screenshot }

// List
GET /api/screenshots?limit=50&session_id=1
// Requires: token
// Response: { data: [screenshots] }

// Download
GET /api/screenshot/{id}/download
// Requires: token and ownership
// Response: file stream

// Delete
DELETE /api/screenshot/{id}
// Requires: token and ownership
```

### Activity Logs
```javascript
// Get user's logs
GET /api/activities?limit=50
// Requires: token
// Response: { data: [logs] }

// Get session summary
GET /api/session/{id}/activities/summary
// Requires: token and session ownership
// Response: { session, summary }

// Admin view
GET /api/activities/admin?user_id=1&limit=50
// Requires: token + admin role
```

---

## 📊 Verification Checklist

### Backend
- [ ] All migrations applied successfully
- [ ] Sanctum tokens are being created on login
- [ ] api.token middleware validates tokens
- [ ] Activity logs are being recorded
- [ ] Screenshots are stored in private disk

### Frontend
- [ ] AuthContext provides auth state
- [ ] ProtectedRoute redirects unauthenticated users
- [ ] API client injects token automatically
- [ ] Token is cleared on logout
- [ ] App redirects to login on 401

### Electron
- [ ] Context isolation is enabled
- [ ] IPC calls validate authentication
- [ ] DevTools disabled in production
- [ ] Navigation limited to localhost

### Security
- [ ] No tokens exposed in network requests (except Authorization header)
- [ ] No file paths visible in API responses
- [ ] Session storage cleared on logout
- [ ] Activity logs created for all actions
- [ ] Rate limiting working

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized errors | Verify token is in sessionStorage after login |
| CORS errors | Check SANCTUM_STATEFUL_DOMAINS in .env |
| Screenshots not uploading | Check storage/app/screenshots permissions |
| Activity logs not created | Run migrations and check database |
| IPC calls failing | Ensure auth token exists in sessionStorage |
| DevTools showing in prod | Verify NODE_ENV=production is set |

---

## 📝 Final Checklist

Before declaring security implementation complete:

- [ ] All 20 steps completed
- [ ] All test cases pass
- [ ] All verification items checked
- [ ] No console errors or warnings
- [ ] Existing functionality works normally
- [ ] Security features working as expected
- [ ] Documentation reviewed and understood
- [ ] Team training completed
- [ ] Deployment plan approved
- [ ] Monitoring/alerting configured

---

## 🎉 You're Done!

Your application now has:
- ✅ Secure API authentication
- ✅ Protected routes
- ✅ Secure screenshot storage
- ✅ Activity logging
- ✅ Electron security hardening
- ✅ IPC protection

**All while maintaining existing functionality!**

---

For detailed information, see:
- `SECURITY_IMPLEMENTATION.md` - Complete guide
- `SECURITY_SUMMARY.md` - Overview of all changes
