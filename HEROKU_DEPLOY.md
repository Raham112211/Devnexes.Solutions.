# 🚀 Heroku Deployment Guide - DevNexes Solutions

## Step 1: Heroku Setup
```bash
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create Heroku app
heroku create devnexes-solutions

# Add MySQL addon (ClearDB)
heroku addons:create cleardb:ignite
```

## Step 2: Get Database URL
```bash
# Get database connection string
heroku config:get CLEARDB_DATABASE_URL

# Example output:
# mysql://username:password@hostname/database_name?reconnect=true
```

## Step 3: Set Environment Variables
```bash
# Set all environment variables
heroku config:set DB_HOST=your_mysql_host
heroku config:set DB_PORT=3306
heroku config:set DB_USER=your_mysql_user
heroku config:set DB_PASSWORD=your_mysql_password
heroku config:set DB_NAME=your_database_name
heroku config:set JWT_SECRET=devnex_secure_key_2024_raham_encrypted
heroku config:set NODE_ENV=production
```

## Step 4: Deploy
```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial deployment"

# Add Heroku remote
heroku git:remote -a devnexes-solutions

# Deploy to Heroku
git push heroku main
```

## Step 5: Open Website
```bash
heroku open
```

## Admin Portal Access:
- **URL:** https://your-app-name.herokuapp.com/admin
- **Admin ID:** Devnexes
- **Company Code:** 1973
- **Password:** King12@4

## Troubleshooting:
```bash
# View logs
heroku logs --tail

# Restart app
heroku restart
```

## Database Management:
```bash
# Access database
heroku run mysql -h hostname -u username -p database_name
```

✅ **Your website is now LIVE on Heroku!**