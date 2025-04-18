# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Install: `npm install`
- Global install: `npm install -g .`
- Make executable: `chmod +x index.mjs`
- Run tests: `npm test`
- Run specific test: `npx mocha tests/unit/package-parser.test.js`

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
- **Test Framework**: Mocha with Chai assertions
- **Mocking**: Use sinon for stubs and spies, mock-fs for filesystem
- **Unit Tests**: Focus on individual functions in isolation
- **Integration Tests**: Test interaction between components
- **Test Files**: Name test files with *.test.js extension