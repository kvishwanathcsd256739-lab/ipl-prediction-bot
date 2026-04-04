# Contributing to IPL Prediction Bot

Thank you for your interest in contributing! This guide explains how to contribute effectively.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)

## Code of Conduct

This project follows a simple code of conduct:
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ipl-prediction-bot.git
   cd ipl-prediction-bot
   ```
3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot.git
   ```

## How to Contribute

### Reporting Bugs
- Open an issue on GitHub
- Include steps to reproduce, expected vs actual behavior, and your environment details

### Suggesting Features
- Open a GitHub issue with the label `enhancement`
- Describe the feature and why it would be useful

### Submitting Code Changes
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test your changes thoroughly
4. Commit with a clear message: `git commit -m "feat: add new prediction feature"`
5. Push and open a Pull Request

## Development Setup

### Prerequisites
- Node.js v16+
- MongoDB account
- Telegram Bot Token (from @BotFather)

### Installation
```bash
# Install Node.js dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development server
npm run dev
```

### Running Tests
```bash
npm test
```

## Coding Standards

### JavaScript (Node.js)
- Use `const`/`let` instead of `var`
- Use `async/await` over callbacks
- Add error handling with try/catch
- Use meaningful variable names
- Add JSDoc comments for functions

### Commit Messages
Follow [Conventional Commits](https://conventionalcommits.org/):
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `refactor:` — code refactoring
- `test:` — adding tests
- `chore:` — maintenance tasks

## Pull Request Process

1. Update documentation if needed
2. Ensure all existing tests pass
3. Add tests for new functionality
4. Get at least one review approval
5. Squash commits before merging

## Questions?

Open a GitHub issue or contact the maintainer.
