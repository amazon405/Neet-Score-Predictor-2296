# NEET Predictor - Admin Backend System

## Admin Access Setup

### Quick Setup (Recommended)

1. **Visit Admin Setup Page**: Go to `http://localhost:5173/#/admin/setup`
2. **Create Admin User**: Use the setup form with these default credentials:
   - **Email**: `admin@neetpredictor.com`
   - **Password**: `AdminNEET2024!`
   - **Full Name**: `NEET Admin`
3. **Login**: After creation, go to `http://localhost:5173/#/admin` and login

### Manual Setup (Alternative)

If you prefer to create the admin user manually:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to Authentication**: Go to your project → Authentication → Users
3. **Create New User**:
   - Email: `admin@neetpredictor.com`
   - Password: `AdminNEET2024!`
   - Email Confirmed: ✅ (check this)
4. **Add Admin Role**: The admin_users table should automatically include this user

## Admin Panel Features

### 📊 Dashboard Overview
- **Student Statistics**: Total students, today's predictions, email stats
- **Quick Metrics**: Average scores, success rates
- **Visual Analytics**: Charts and graphs for data visualization

### 👥 Student Data Management
- **View All Students**: Complete list with search and filtering
- **Export Data**: CSV, Excel, JSON formats
- **Student Details**: Individual student prediction reports
- **Bulk Operations**: Mass email sending, data exports

### 📧 Email Service Integration
- **Provider Support**: SendGrid, Mailgun, Amazon SES, Custom SMTP
- **Email Templates**: Automated prediction reports
- **Delivery Tracking**: Success rates, failed emails, logs
- **Test Email**: Send test emails to verify configuration

### 📋 Google Sheets Integration
- **Auto Sync**: Automatic data synchronization
- **Real-time Updates**: Sync student data to Google Sheets
- **Custom Mapping**: Configure which fields to sync
- **Sync Logs**: Track synchronization history

### 📤 Export Manager
- **Multiple Formats**: CSV, Excel, JSON export options
- **Advanced Filtering**: Date ranges, categories, states
- **Field Selection**: Choose which data to include
- **Quick Templates**: Pre-configured export settings

### ⚙️ Configuration Management
- **Email Settings**: Configure email providers and templates
- **Sync Settings**: Google Sheets integration setup
- **User Management**: Admin user permissions
- **System Settings**: General application configuration

## Database Schema

The system includes these tables:
- `admin_users` - Admin user management
- `student_predictions` - Student data and predictions
- `email_logs` - Email delivery tracking
- `email_config` - Email service configuration
- `sheets_config` - Google Sheets integration settings
- `sync_logs` - Synchronization history
- `export_logs` - Export activity tracking

## Security Features

- **Row Level Security (RLS)**: All tables protected with RLS
- **Admin Authentication**: Supabase Auth integration
- **Role-based Access**: Admin-only access to sensitive data
- **Secure APIs**: All database operations through Supabase

## Getting Started

1. **Setup Admin Account**: Use `/admin/setup` route
2. **Configure Email**: Set up email service in admin panel
3. **Setup Google Sheets** (Optional): Configure sheet integration
4. **Start Managing**: View students, send emails, export data

## Default Admin Credentials

- **Email**: `admin@neetpredictor.com`
- **Password**: `AdminNEET2024!`

⚠️ **Important**: Change the default password after first login for security.

## Support

For technical support or questions about the admin system, please contact the development team.