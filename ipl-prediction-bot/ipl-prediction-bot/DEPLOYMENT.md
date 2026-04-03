# 🚀 Deployment Guide

Deploy your IPL Prediction Bot to production for 24/7 operation.

## Deployment Options

### Option 1: VPS/Cloud Server (Recommended)
- **Services:** DigitalOcean, AWS EC2, Google Cloud, Linode, Vultr
- **Cost:** $5-10/month
- **Best for:** Serious deployment, high traffic

### Option 2: Heroku (Easiest)
- **Service:** Heroku
- **Cost:** Free tier available, $7/month for hobby
- **Best for:** Quick deployment, beginners

### Option 3: Local Server/Raspberry Pi
- **Hardware:** Your own server or Raspberry Pi
- **Cost:** One-time hardware cost
- **Best for:** Learning, low traffic

---

## 🌐 Option 1: VPS Deployment (DigitalOcean)

### Step 1: Create Droplet

1. Sign up at [DigitalOcean](https://www.digitalocean.com)
2. Create new Droplet:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic $6/month (1GB RAM)
   - **Datacenter:** Choose nearest to India
   - **Authentication:** SSH key (recommended) or password

### Step 2: Setup Server

```bash
# SSH into your server
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Install PM2 (process manager)
npm install -g pm2
```

### Step 3: Deploy Bot

```bash
# Create directory
mkdir -p /var/www/ipl-bot
cd /var/www/ipl-bot

# Upload your code (use git or scp)
# Option A: Git
git clone your_repository_url .

# Option B: SCP from local machine
# scp -r ipl-prediction-bot/* root@your_server_ip:/var/www/ipl-bot/

# Install dependencies
npm install

# Create .env file
nano .env
# Paste your configuration and save (Ctrl+X, Y, Enter)

# Start with PM2
pm2 start src/bot.js --name ipl-bot

# Save PM2 configuration
pm2 save

# Setup auto-start on system boot
pm2 startup
# Run the command it suggests
```

### Step 4: Monitor & Manage

```bash
# View logs
pm2 logs ipl-bot

# Monitor performance
pm2 monit

# Restart bot
pm2 restart ipl-bot

# Stop bot
pm2 stop ipl-bot

# View status
pm2 status
```

---

## 📦 Option 2: Heroku Deployment

### Step 1: Prepare for Heroku

Create `Procfile` in project root:
```
web: node src/bot.js
```

Create `.slugignore`:
```
.git
.gitignore
README.md
EXAMPLES.md
QUICKSTART.md
```

### Step 2: Deploy to Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-ipl-bot

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set ADMIN_USER_ID=your_id
heroku config:set UPI_ID=your_upi
heroku config:set UPI_NAME="Your Name"
heroku config:set PAYMENT_AMOUNT=49

# Deploy
git add .
git commit -m "Initial deployment"
git push heroku master

# View logs
heroku logs --tail

# Scale dyno
heroku ps:scale web=1
```

### Step 3: MongoDB Atlas Setup

Since Heroku's free MongoDB is limited:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP: 0.0.0.0/0 (allow all)
5. Get connection string
6. Set on Heroku:
```bash
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/ipl"
```

---

## 🏠 Option 3: Raspberry Pi Deployment

### Step 1: Setup Raspberry Pi

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
sudo apt install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Step 2: Deploy Bot

```bash
# Create directory
mkdir ~/ipl-bot
cd ~/ipl-bot

# Copy your files
# (use USB drive or scp from another computer)

# Install dependencies
npm install

# Create .env file
nano .env

# Run bot
npm start
```

### Step 3: Auto-start on Boot

Create systemd service:
```bash
sudo nano /etc/systemd/system/ipl-bot.service
```

Add content:
```ini
[Unit]
Description=IPL Prediction Bot
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/ipl-bot
ExecStart=/usr/bin/node /home/pi/ipl-bot/src/bot.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable ipl-bot
sudo systemctl start ipl-bot
sudo systemctl status ipl-bot
```

---

## 🔒 Security Best Practices

### 1. Firewall Setup (UFW)

```bash
# Allow SSH
ufw allow 22/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

### 2. SSL/TLS (if exposing web interface)

```bash
# Install certbot
apt install certbot

# Get certificate
certbot certonly --standalone -d yourdomain.com
```

### 3. Environment Security

- Never commit `.env` to git
- Use strong passwords for database
- Rotate bot token periodically
- Keep admin user ID secret

### 4. Regular Updates

```bash
# Update bot code
cd /var/www/ipl-bot
git pull
npm install
pm2 restart ipl-bot

# Update system
apt update && apt upgrade -y
```

---

## 📊 Monitoring & Maintenance

### Set up Logging

```bash
# PM2 logs
pm2 logs --lines 100

# Save logs to file
pm2 logs ipl-bot > /var/log/ipl-bot.log

# Rotate logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Database Backups

```bash
# Create backup script
nano /root/backup-db.sh
```

Add content:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db ipl_prediction_bot --out /backups/mongo_$DATE
# Keep only last 7 days
find /backups -type d -mtime +7 -exec rm -rf {} \;
```

Make executable and schedule:
```bash
chmod +x /root/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /root/backup-db.sh
```

### Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com) - Free
- [Pingdom](https://www.pingdom.com) - Paid
- [StatusCake](https://www.statuscake.com) - Free tier

---

## 🔧 Troubleshooting Deployment

### Bot Not Starting

```bash
# Check PM2 logs
pm2 logs ipl-bot --lines 50

# Check if process is running
pm2 status

# Check system resources
free -h
df -h

# Restart bot
pm2 restart ipl-bot
```

### MongoDB Issues

```bash
# Check if MongoDB is running
systemctl status mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
systemctl restart mongod
```

### Memory Issues

```bash
# Check memory usage
pm2 monit

# Increase swap (if needed)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

---

## 📈 Scaling for Growth

### When to Scale?

- More than 1000 users
- More than 100 payments/day
- Bot response time > 2 seconds

### Scaling Options

1. **Vertical Scaling**: Upgrade server RAM/CPU
2. **Horizontal Scaling**: Multiple bot instances with load balancer
3. **Database Scaling**: MongoDB replica set or sharding
4. **CDN**: For serving static content (QR codes)

### Load Balancing

```bash
# Using PM2 cluster mode
pm2 start src/bot.js -i 4 --name ipl-bot
# This creates 4 instances
```

---

## 💰 Cost Estimates

### Small Scale (< 500 users)
- **VPS:** $5/month (DigitalOcean/Vultr)
- **MongoDB:** Free (included)
- **Total:** ~$5/month

### Medium Scale (500-5000 users)
- **VPS:** $10-20/month
- **MongoDB Atlas:** $10/month
- **Total:** ~$20-30/month

### Large Scale (5000+ users)
- **VPS:** $40+/month
- **MongoDB Atlas:** $30+/month
- **CDN:** $5+/month
- **Total:** $75+/month

---

## ✅ Pre-Deployment Checklist

- [ ] .env file configured correctly
- [ ] MongoDB connection tested
- [ ] Bot token is valid
- [ ] Admin user ID is correct
- [ ] UPI payment details are correct
- [ ] All dependencies installed
- [ ] Database initialized (if needed)
- [ ] Bot tested locally
- [ ] Backup strategy in place
- [ ] Monitoring setup
- [ ] SSL certificate (if needed)
- [ ] Firewall configured
- [ ] Auto-restart enabled

---

## 🆘 Support Resources

- MongoDB Docs: https://docs.mongodb.com
- PM2 Docs: https://pm2.keymetrics.io
- Telegram Bot API: https://core.telegram.org/bots/api
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices

---

**Ready to deploy? Follow the steps above and your bot will be live 24/7!** 🚀
