# Contributing to weRemind

Thank you for your interest in contributing to weRemind! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions

We welcome contributions in the following areas:

- **🐛 Bug Reports**: Report bugs and issues
- **✨ Feature Requests**: Suggest new features
- **📝 Documentation**: Improve documentation
- **💻 Code Contributions**: Submit code improvements
- **🎨 UI/UX Improvements**: Enhance user interface
- **🧪 Testing**: Add tests or improve existing ones

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- MongoDB Atlas account (for database)
- Twilio account (for SMS/WhatsApp features)
- Firebase project (for authentication)

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/we-remind.git
   cd we-remind
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start development servers**
   ```bash
   # Start backend (from backend directory)
   npm start
   
   # Start frontend (from root directory)
   npm start
   ```

## 📋 Contribution Guidelines

### Code Style

- **JavaScript/React**: Follow ESLint configuration
- **CSS**: Use consistent naming conventions (BEM methodology)
- **Comments**: Add comments for complex logic
- **File naming**: Use kebab-case for files and folders

### Commit Messages

Use conventional commit format:
```
type(scope): description

Examples:
feat(auth): add Google OAuth integration
fix(reminders): resolve timezone conversion issue
docs(readme): update installation instructions
style(navbar): center navigation links
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests if applicable
   - Update documentation if needed

3. **Test your changes**
   ```bash
   # Run frontend tests
   npm test
   
   # Test the application manually
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): your descriptive message"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use the PR template
   - Describe your changes clearly
   - Link any related issues

## 🐛 Reporting Bugs

### Before Reporting

- Check if the issue has already been reported
- Try to reproduce the issue with the latest version
- Check the browser console for errors

### Bug Report Template

```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g. Windows, macOS, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]

**Additional Context**
Any other context about the problem.
```

## ✨ Requesting Features

### Feature Request Template

```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Use Case**
How would this feature be used?

**Alternative Solutions**
Any alternative solutions you've considered.

**Additional Context**
Any other context or screenshots about the feature request.
```

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests (if available)
cd backend
npm test
```

### Writing Tests

- Write tests for new features
- Ensure existing tests pass
- Follow the existing test patterns

## 📝 Documentation

### Updating Documentation

- Update README.md for major changes
- Add comments to complex code
- Update API documentation if endpoints change
- Include screenshots for UI changes

## 🎨 UI/UX Guidelines

### Design Principles

- **Consistency**: Follow existing design patterns
- **Accessibility**: Ensure features work for all users
- **Responsive**: Test on different screen sizes
- **Performance**: Optimize for speed and efficiency

### Color Scheme

- **Primary**: #181818 (Dark Gray)
- **Secondary**: #1abc1a (Green)
- **Background**: #ffffff (White)
- **Text**: #222222 (Dark Gray)

## 🔧 Development Workflow

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `style/ui-improvements` - UI/UX improvements

### Code Review Process

1. **Self-review** your code before submitting
2. **Test** your changes thoroughly
3. **Update** documentation if needed
4. **Respond** to review comments promptly

## 🚨 Important Notes

### Security

- Never commit sensitive information (API keys, passwords)
- Use environment variables for configuration
- Follow security best practices

### Performance

- Optimize for mobile devices
- Minimize bundle size
- Use efficient algorithms and data structures

## 📞 Getting Help

### Questions?

- **GitHub Issues**: Create an issue for questions
- **Discussions**: Use GitHub Discussions for general questions
- **Email**: Contact the maintainer directly

### Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the project's code of conduct

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- GitHub contributors page
- Release notes

---

**Thank you for contributing to weRemind!** 🎉

Your contributions help make weRemind better for everyone. 
