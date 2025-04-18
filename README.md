# NPM Runner

An interactive CLI tool for running npm scripts from your `package.json` files with autocomplete functionality.

## Features

- ✅ Interactive selection of npm scripts
- ✅ Autocomplete filtering for quick script selection
- ✅ Works in any directory containing a package.json file
- ✅ Simple and easy to use
- ✅ Conveniently aliased as `npm_run` in your terminal

## Installation

### 1. Clone and install the repository

```shell script
# Clone the repository
git clone https://github.com/yourusername/npm-runner.git
cd npm-runner

# Install dependencies
npm install

# Make the script executable
chmod +x index.js

# Install globally
npm install -g .
```
## Usage

Navigate to any directory containing a `package.json` file with npm scripts and run:

```shell script
npm-run
```

You'll be presented with an interactive list of available scripts:

```
? Select a script to run: (Use arrow keys or type to search)
❯ start
  build
  test
  lint
  dev
  deploy
  analyze
```

Start typing to filter the list:

```
? Select a script to run: de
❯ dev
  deploy
```

Press Enter to run the selected script. The tool will execute the script and exit when it completes.

## How It Works

1. When you run `npm_run`, the tool looks for a `package.json` file in your current directory
2. It extracts all the scripts defined in that file
3. It presents an interactive selection menu with autocomplete functionality
4. You can type to filter the available scripts
5. Once you select a script, it runs `npm run [selected-script]`
6. After the script finishes running, the tool exits

## Requirements

- Node.js (v12 or higher recommended)
- npm (v6 or higher)

## License

MIT

## Testing

The npm-runner tool includes a comprehensive test suite:

```shell script
# Install dev dependencies
npm install

# Run all tests
npm test

# Run specific test files
npx mocha tests/unit/package-parser.test.js
```

The test suite includes:
- Unit tests for package.json parsing and script filtering
- Integration tests for script execution and user interaction

## Troubleshooting

**Command not found: npm_run**
- Check that the package is properly installed globally with `npm list -g | grep npm-runner`

**No package.json found**
- Make sure you're running the command in a directory containing a package.json file

**No scripts found**
- Your package.json file doesn't have any scripts defined in the "scripts" section
