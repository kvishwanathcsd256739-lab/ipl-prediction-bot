# Deployment Guide — IPL Prediction Bot

Complete guide for deploying the bot to production.

## Table of Contents

- [Deployment Options](#deployment-options)
- [VPS Deployment (Recommended)](#vps-deployment)
- [Heroku Deployment](#heroku-deployment)
- [Railway Deployment](#railway-deployment)
- [Docker Deployment](#docker-deployment)
- [SSL & Domain Setup](#ssl--domain-setup)
- [Production Checklist](#production-checklist)

---

## Deployment Options

| Platform | Cost | Difficulty | Best For |
|----------|------|-----------|---------|
| DigitalOcean VPS | $6/month | Medium | Production, full control |
| AWS EC2 | $8-15/month | Hard | Enterprise, scalability |
| Heroku | $7/month | Easy | Quick start |
| Railway | $5/month | Easy | Modern alternative |
| Render | Free tier / $7 | Easy | Budget-friendly |

---

## VPS Deployment

Recommended for production use. Example uses DigitalOcean, but steps apply to any Ubuntu VPS.

### Step 1: Create Server

1. Sign up at [DigitalOcean](https://digitalocean.com)
2. Create a new **Droplet**:
   - **Image:** Ubuntu 22.04 LTS
   - **Size:** Basic, 1GB RAM ($6/month)
   - **Region:** Closest to India (Bangalore/Singapore)
3. Add your SSH key or use root password

### Step 2: Connect to Server

```bash
ssh root@your-server-ip
```

### Step 3: Install Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify
node --version
npm --version
```

### Step 4: Install PM2

```bash
npm install -g pm2
```

### Step 5: Deploy Code

```bash
# Install git
apt install git -y

# Clone repository
git clone https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot.git
cd ipl-prediction-bot

# Install dependencies
npm install --production

# Create .env file
nano .env
# Paste your environment variables
```

### Step 6: Start with PM2

```bash
# Start the application
pm2 start server.js --name ipl-bot

# Save PM2 configuration
pm2 save

# Set PM2 to start on server reboot
pm2 startup
# Follow the command it outputs (copy and run it)
```

### Step 7: Verify Deployment

```bash
pm2 list
pm2 logs ipl-bot
curl http://localhost:8000/health
```

---

## Heroku Deployment

### Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu
curl https://cli-assets.heroku.com/install.sh | sh

# Windows: Download installer from https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login and Create App

```bash
heroku login
heroku create ipl-prediction-bot-app
```

### Step 3: Set Environment Variables

```bash
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set RAZORPAY_KEY_ID=your_key_id
heroku config:set RAZORPAY_KEY_SECRET=your_key_secret
heroku config:set ADMIN_USER_ID=your_telegram_id
heroku config:set PAYMENT_AMOUNT=4900
heroku config:set NODE_ENV=production
heroku config:set WEBHOOK_URL=https://ipl-prediction-bot-app.herokuapp.com
```

### Step 4: Create Procfile

```bash
echo "web: node server.js" > Procfile
git add Procfile
git commit -m "Add Procfile"
```

### Step 5: Deploy

```bash
git push heroku main
heroku ps:scale web=1
heroku logs --tail
```

---

## Railway Deployment

[Railway](https://railway.app) is a modern, simple platform.

### Step 1: Connect GitHub

1. Go to https://railway.app
2. Sign in with GitHub
3. Click **New Project → Deploy from GitHub repo**
4. Select `ipl-prediction-bot`

### Step 2: Add Environment Variables

In Railway dashboard → Your project → **Variables**:

Add all variables from `.env.example` with your real values.

### Step 3: Deploy

Railway automatically deploys on every GitHub push.

Set start command in Railway settings:
```
node server.js
```

---

## Docker Deployment

### Create Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8000

CMD ["node", "server.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'
services:
  ipl-bot:
    build: .
    ports:
      - "8000:8000"
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - MONGODB_URI=${MONGODB_URI}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
      - ADMIN_USER_ID=${ADMIN_USER_ID}
      - PORT=8000
      - NODE_ENV=production
    restart: unless-stopped
```

### Deploy with Docker

```bash
# Build image
docker build -t ipl-prediction-bot .

# Run container
docker run -d --name ipl-bot --env-file .env -p 8000:8000 ipl-prediction-bot

# Or with docker-compose
docker-compose up -d
```

---

## SSL & Domain Setup

Telegram webhooks require HTTPS. Set up SSL with Let's Encrypt:

### Install Nginx & Certbot

```bash
apt install nginx certbot python3-certbot-nginx -y
```

### Configure Nginx

```bash
nano /etc/nginx/sites-available/ipl-bot
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/ipl-bot /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Get SSL Certificate

```bash
certbot --nginx -d your-domain.com
```

Your bot now has HTTPS at `https://your-domain.com`.

---

## Production Checklist

Before going live, verify:

### Environment
- [ ] `NODE_ENV=production` is set
- [ ] All `.env` values are production values (not test)
- [ ] Razorpay live keys configured (`rzp_live_...`)
- [ ] WEBHOOK_URL points to your actual domain

### Server
- [ ] PM2 configured with `pm2 startup && pm2 save`
- [ ] Server has at least 512MB RAM
- [ ] Firewall allows ports 80, 443, 8000
- [ ] HTTPS configured (required for Telegram webhooks)

### Application
- [ ] Health check responds: `GET /health`
- [ ] Bot responds to `/start` on Telegram
- [ ] Admin commands work
- [ ] Test payment completes successfully

### Monitoring
- [ ] Uptime monitoring configured (UptimeRobot, etc.)
- [ ] PM2 log rotation enabled
- [ ] Error alerts set up
- [ ] MongoDB Atlas alerts configured

### Security
- [ ] `.env` file not accessible publicly
- [ ] MongoDB Atlas IP whitelist configured (or `0.0.0.0/0` for VPS)
- [ ] Razorpay webhook signature verification enabled
- [ ] Admin ID restricted to your Telegram account only
