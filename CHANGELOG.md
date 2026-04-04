# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Machine learning model integration for automated predictions
- Analytics dashboard with charts and graphs
- Multi-language support (Hindi, Telugu, Tamil)
- Group chat support for Telegram

---

## [1.0.0] - 2026-03-28

### Added
- **Telegram Bot** — Full bot interface using Telegraf.js
- **User Management** — User registration and session tracking with MongoDB
- **Prediction System** — Admin-managed IPL match predictions
- **Payment Integration** — Razorpay payment gateway for premium predictions (₹49/match)
- **Free Analysis** — Detailed free match analysis for all users
- **Premium Predictions** — Winner, toss winner, key player, and confidence level
- **Admin Panel** — Admin commands to add and manage predictions
- **Webhook Support** — Express.js server with webhook endpoints
- **Database Models** — User, Prediction, and Payment Mongoose schemas
- **Health Check** — `/health` endpoint for monitoring
- **Environment Configuration** — `.env`-based configuration system

### Technical
- Node.js + Express.js backend
- MongoDB + Mongoose ODM
- Telegraf bot framework
- Razorpay payment SDK
- dotenv configuration

---

## [0.2.0] - 2026-03-15

### Added
- Payment verification flow
- Admin prediction management
- User subscription tracking

### Fixed
- Bot startup sequence
- Database connection retry logic

---

## [0.1.0] - 2026-03-01

### Added
- Initial project structure
- Basic Telegram bot setup
- MongoDB connection
- `/start`, `/today`, `/help` commands

[Unreleased]: https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot/releases/tag/v1.0.0
[0.2.0]: https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot/releases/tag/v0.2.0
[0.1.0]: https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot/releases/tag/v0.1.0
