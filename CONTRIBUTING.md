# Contributing to apix

Thank you for your interest in contributing to **apix**! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

**When reporting bugs, include:**
- Node.js and apix version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error messages and stack traces

### Suggesting Features

We love feature suggestions! Please:
- Check if the feature has already been requested
- Clearly describe the use case
- Explain why this feature would benefit the community

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests if applicable
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/shashi089/apix-cli.git
cd apix-cli

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npx tsx src/cli/index.ts run examples/**/*.test.ts
```

## Coding Standards

- **TypeScript**: Use strict mode and proper types
- **ES Modules**: Use ESM syntax (import/export)
- **Formatting**: We use standard TypeScript formatting
- **Naming**: Use descriptive variable and function names
- **Comments**: Add comments for complex logic

## Project Structure

```
apix-cli/
├── src/
│   ├── cli/           # CLI commands and entry point
│   ├── core/          # Test runner, HTTP client, assertions
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Logging and utilities
│   └── config/        # Configuration loader
├── examples/          # Example test files
└── dist/             # Compiled output
```

## Testing Your Changes

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Run example tests**
   ```bash
   npx tsx src/cli/index.ts run examples/**/*.test.ts
   ```

3. **Test the init command**
   ```bash
   npx tsx src/cli/index.ts init
   ```

## Commit Message Guidelines

Follow conventional commits format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test-related changes
- `chore:` Build/tooling changes

**Examples:**
```
feat: add retry mechanism for failed requests
fix: resolve timeout issue in config loader
docs: update README with new examples
```

## Questions?

Feel free to open an issue for discussion before starting work on major features.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to apix! 🚀
