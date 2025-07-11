# Contributing to AutoWeave Memory

Thank you for your interest in contributing to AutoWeave Memory! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR-USERNAME/autoweave-memory.git
   cd autoweave-memory
   ```

2. **Install Dependencies**
   ```bash
   # Node.js dependencies
   npm install
   
   # Python dependencies
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

3. **Setup Development Environment**
   ```bash
   # Copy environment file
   cp .env.example .env
   # Edit .env with your configuration
   
   # Start services
   docker-compose up -d
   ```

## Code Style

### JavaScript/Node.js
- Use ES6+ features
- Follow ESLint configuration
- Use async/await over callbacks
- Add JSDoc comments for all public methods

### Python
- Follow PEP 8
- Use type hints
- Add docstrings for all functions
- Use Black for formatting

## Testing

### Running Tests
```bash
# JavaScript tests
npm test

# Python tests
pytest

# Integration tests
npm run test:integration
```

### Writing Tests
- Write unit tests for all new features
- Aim for >80% code coverage
- Include integration tests for API endpoints
- Test error cases and edge conditions

## Pull Request Process

1. **Branch Naming**
   - `feature/description` for new features
   - `fix/description` for bug fixes
   - `docs/description` for documentation

2. **Commit Messages**
   - Use conventional commits format
   - Examples:
     - `feat: add batch memory operations`
     - `fix: resolve Qdrant connection timeout`
     - `docs: update API examples`

3. **PR Requirements**
   - Update documentation
   - Add/update tests
   - Ensure all tests pass
   - Update CHANGELOG.md

## Architecture Guidelines

### Memory System Design
- Maintain separation between contextual and structural memory
- Use dependency injection for testability
- Implement proper error handling and recovery
- Add metrics and logging for observability

### API Design
- Follow REST principles
- Use consistent error responses
- Version APIs when making breaking changes
- Document all endpoints with examples

## Performance Considerations

- Batch operations when possible
- Use caching strategically
- Optimize database queries
- Profile memory usage

## Security

- Never commit secrets or API keys
- Validate all inputs
- Use parameterized queries
- Follow OWASP guidelines

## Documentation

- Update README.md for user-facing changes
- Add inline code comments
- Update API documentation
- Include examples for new features

## Questions?

- Open an issue for bugs or features
- Join discussions for design decisions
- Contact maintainers for guidance

Thank you for contributing!