# 🎓 Event Registration Tracker - Role-Based Access

## 📁 Updated Project Structure
```
event-registration-tracker/
├── backend/
│   ├── server.js
│   ├── models/Registration.js
│   ├── routes/
│   │   ├── registrations.js
│   │   └── admin.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── home.html         ← NEW: Landing page
    ├── register.html     ← NEW: Participant registration
    ├── login.html        ← Admin login
    ├── index.html        ← Admin dashboard
    ├── style.css
    └── script.js
```

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd backend
npm start
```

### 2. Access the Application
- **Home Page**: Open `frontend/home.html` in your browser
- **Server**: http://localhost:5000

## 👥 User Roles & Access

### 🧍‍♀ Participant Access
- **Entry Point**: `home.html` → Click "Participant"
- **Page**: `register.html`
- **Capabilities**: 
  - ✅ Submit registration for events
  - ✅ See success/error messages
  - ❌ Cannot view other registrations
  - ❌ Cannot edit or delete

### 👨‍💼 Admin Access
- **Entry Point**: `home.html` → Click "Admin"
- **Login**: `login.html` (admin/admin123)
- **Dashboard**: `index.html`
- **Capabilities**: 
  - ✅ View all registrations
  - ✅ Add/Edit/Delete registrations
  - ✅ Export to Excel
  - ✅ Full CRUD operations

## 🛡️ Security Features

### Duplicate Prevention
- Same roll number + same event = ❌ Blocked
- Same roll number + different event = ✅ Allowed

### Route Protection
```
/api/public/*     → Open to everyone (participants)
/api/admin/*      → Authentication handled internally
/api/*           → Requires admin login (protected)
```

## 🧪 Testing

### Test Role-Based Access
```bash
node test-role-access.js
```

### Test Individual Features
```bash
node test-backend.js        # Basic backend functionality
node test-duplicates.js     # Duplicate prevention
```

## 🌐 API Endpoints

### Public (No Authentication)
- `POST /api/public/register` - Participant registration

### Admin Only (Requires Login)
- `GET /api/getAll` - View all registrations
- `POST /api/register` - Admin create registration
- `PUT /api/update/:id` - Edit registration
- `DELETE /api/delete/:id` - Delete registration
- `GET /api/export` - Export to Excel

### Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin/check` - Check login status
- `POST /api/admin/logout` - Admin logout

## 📝 Usage Examples

### Participant Flow
1. Open `home.html`
2. Click "Participant" 
3. Fill registration form
4. Submit → See success message
5. Done ✅

### Admin Flow
1. Open `home.html`
2. Click "Admin"
3. Login with admin/admin123
4. Access full dashboard
5. Manage all registrations ✅

## 🎯 Key Features

✅ **Role Separation**: Clear participant vs admin access  
✅ **Duplicate Prevention**: Roll + Event uniqueness  
✅ **Responsive Design**: Works on all devices  
✅ **Error Handling**: Clear user feedback  
✅ **Security**: Protected admin routes  
✅ **Export**: Excel download for admins  

## 🔧 Environment Variables (.env)
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
ADMIN_USER=admin
ADMIN_PASS=admin123
```

---
🎉 **Ready to use!** Start with `home.html` and enjoy the role-based access system.