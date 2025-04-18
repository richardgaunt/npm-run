# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Install: `npm install`
- Global install: `npm install -g .`
- Make executable: `chmod +x index.mjs`
- Run all tests: `npm test`
- Run unit tests: `npm run test:unit`
- Run integration tests: `npm run test:integration`
- Run specific test file: `node --experimental-vm-modules node_modules/jest/bin/jest.js tests/unit/package-parser.test.js`
- Run ESLint: `npm run lint`
- Fix ESLint issues: `npm run lint:fix`

## Code Style Guidelines
- **File Format**: JavaScript ES Modules (.mjs)
- **Imports**: Group imports by type (core modules first, then third-party, then local)
- **Error Handling**: Use try/catch blocks for file operations and include descriptive error messages
- **Naming**: Use camelCase for variables/functions, descriptive names for all identifiers
- **Async**: Use Promises with .then/.catch or async/await consistently
- **Command Line**: Use Commander.js for CLI argument parsing
- **Process Flow**: Exit process with appropriate codes (0 for success, 1 for errors)
- **Comments**: Use JSDoc-style comments for functions and important logic
- **Formatting**: 4-space indentation, semicolons required
- **Interactivity**: Use inquirer.js for interactive prompts with consistent styling

## Testing Guidelines
- **Test Framework**: Jest (with ES Modules support)
- **Mocking**: Use Jest's built-in mocking capabilities or mock-fs for filesystem
- **Unit Tests**: Focus on individual functions in isolation
- **Integration Tests**: Test interaction between components
- **Test Files**: Name test files with *.test.js extension
- **Isolation**: Use jest.isolateModules for tests requiring module isolation
- **CI/CD**: GitHub Actions automatically runs tests on PRs and pushes to main