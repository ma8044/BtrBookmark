# BtrBookmark

A collaborative bookmark management application built with Django that allows users to organize, categorize, and share bookmarks with other users.

## Overview

BtrBookmark is a web-based bookmark manager designed to help users efficiently organize and share their bookmarks. Unlike simple browser bookmarks, BtrBookmark provides a full-featured platform where users can:

- **Organize Bookmarks**: Create a hierarchical folder structure to organize bookmarks by category or project
- **Categorize Links**: Tag bookmarks with categories for easy searching and filtering
- **Share with Others**: Invite other users to view and use your bookmark collections
- **Receive Notifications**: Get notified when others share folders with you
- **Collaborative Bookmarking**: Accept or reject shared bookmark collections from other users

## How It Works

1. **User Registration**: Create an account with a unique username and email
2. **Folder Management**: Each user gets a personal folder hierarchy starting with `_USER_{username}`
3. **Bookmark Organization**: Add bookmarks (links) to folders with name, category, and URL
4. **Sharing**: Share your folders with other users by username
5. **Notifications**: Receive and manage notifications for shared folders

### Key Features

- **Hierarchical Organization**: Create nested folders within folders for better organization
- **Link Management**: Each bookmark stores a name, URL, and category for organization
- **User Sharing**: Share specific folders with other users
- **Notification System**: Accept/reject shared folder requests
- **Dynamic UI**: Real-time updates as you create, edit, and delete bookmarks

## Tech Stack

- **Backend**: Django 3.2.25 - Python web framework
- **Frontend**: HTML5, CSS3, JavaScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: Django's built-in authentication system
- **Deployment**: Gunicorn + Render (configured in Procfile)
- **Server**: ASGI (Asynchronous Server Gateway Interface) support

### Dependencies

- Django 3.2.25
- Gunicorn 23.0.0
- WhiteNoise 6.5.0 (static file serving)
- dj-database-url 2.2.0 (database configuration)
- Python 3.7+

## Installation & Setup

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- Git

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd BtrBookmark
```

### Step 2: Create a Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Environment Setup

Create a `.env` file in the project root (same directory as `manage.py`):

```bash
# Generate a strong secret key (only for development)
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Then create `.env`:

```env
SECRET_KEY=<your-generated-secret-key>
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Step 5: Initialize the Database

```bash
# Run migrations
python manage.py migrate

# Create a superuser account (optional, for admin panel)
python manage.py createsuperuser
```

### Step 6: Run the Development Server

```bash
python manage.py runserver
```

The application will be available at `http://localhost:8000`

## Usage

1. **Register**: Go to `/register` and create a new account
2. **Login**: Use your credentials at `/login`
3. **Dashboard**: You'll be taken to your bookmark dashboard
4. **Create Folders**: Organize your bookmarks in folders
5. **Add Bookmarks**: Add links with names, categories, and URLs
6. **Share**: Share folders with other users
7. **Notifications**: Check notifications to accept/reject shared folders

## Project Structure

```
BtrBookmark/
├── BtrBookmark/              # Main app directory
│   ├── models.py             # Database models (User, Folder, Link, Notification)
│   ├── views.py              # View logic and API endpoints
│   ├── urls.py               # URL routing
│   ├── admin.py              # Django admin configuration
│   ├── migrations/           # Database migration files
│   ├── static/               # Static files (CSS, JavaScript)
│   └── templates/            # HTML templates
├── FinalProj/                # Django project settings
│   ├── settings.py           # Project settings
│   ├── urls.py               # Root URL configuration
│   └── wsgi.py               # WSGI configuration
├── requirements.txt          # Python dependencies
├── manage.py                 # Django management script
├── Procfile                  # Deployment configuration
└── db.sqlite3               # SQLite database (development only)
```

## API Endpoints

### Authentication
- `GET /` - Index/Dashboard
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout

### Bookmarks & Folders
- `POST /create/` - Create new bookmark or folder
- `POST /create/<path>/` - Create in specific folder
- `GET /display/` - Get root folder contents
- `GET /display/<path>/` - Get folder contents at path

### Management
- `POST /delete/<type>/<id>` - Delete bookmark or folder
- `POST /rename/<type>/<id>` - Rename bookmark or folder
- `POST /share` - Share folder with user

### Notifications
- `GET /notif_count` - Get notification count
- `GET /notifs_display` - Get all notifications
- `POST /notif_respond/<id>` - Accept/reject shared folder
- `POST /remove/<id>` - Remove shared folder access

## Security Notes

⚠️ **Important Security Information**

The `.gitignore` file has been configured to exclude:
- `venv/` - Virtual environment (should never be committed)
- `db.sqlite3` - Database file with user data
- `.vscode/` - IDE configuration files
- `.env` - Environment variables and secrets

**For Production Deployment:**

1. Generate a strong `SECRET_KEY` in production (never use the development key)
2. Set `DEBUG = False` in production
3. Use environment variables for sensitive configuration
4. Use PostgreSQL or another production database instead of SQLite
5. Set `ALLOWED_HOSTS` to your production domain
6. Keep all dependencies updated

## Troubleshooting

### Database Issues
```bash
# Reset database (development only)
rm db.sqlite3
python manage.py migrate
```

### Virtual Environment Issues
```bash
# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Port Already in Use
```bash
# Run on a different port
python manage.py runserver 8001
```

## Development

### Running in Development Mode

```bash
# With auto-reload
python manage.py runserver

# Access Django admin panel (if superuser created)
python manage.py createsuperuser
# Then visit http://localhost:8000/admin
```

### Making Database Changes

When you modify models in `models.py`:

```bash
# Create migration file
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test the application locally
4. Create a pull request

## Deployment

The project is configured for deployment on Render.com (see `Procfile`).

For other platforms, ensure:
- Environment variables are properly set
- Database is configured (use `DATABASE_URL` environment variable)
- Static files are collected: `python manage.py collectstatic`
- Use a production WSGI server like Gunicorn

## License

[Add your license here]

## Support

For issues or questions, please open an issue in the repository.
