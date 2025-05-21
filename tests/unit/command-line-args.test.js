import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import mockFs from 'mock-fs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import child_process from 'child_process';

// Create the mock manually
const mockSearch = jest.fn().mockResolvedValue('test');

// Mock the modules
jest.mock('child_process', () => ({
  spawn: jest.fn(() => ({
    on: jest.fn()
  }))
}));

// Since we can't spy on the search function directly, we'll mock the entire module
jest.mock('@inquirer/prompts', () => ({
  search: mockSearch
}));

// Mock commander to provide different arguments
jest.mock('commander', () => {
  const mockProgram = {
    version: jest.fn().mockReturnThis(),
    description: jest.fn().mockReturnThis(),
    arguments: jest.fn().mockReturnThis(),
    parse: jest.fn().mockReturnThis(),
    args: []
  };
  return { program: mockProgram };
});

// Get commander module 
const commander = await import('commander');

// Helpers for ES module testing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesPath = path.join(__dirname, '..', 'fixtures');

describe('Command Line Arguments', () => {
  let spawnStub;
  let processExitStub;
  let consoleLogStub;
  let originalCwd;

  beforeEach(() => {
    // Save original process.cwd
    originalCwd = process.cwd;

    // Reset mocks
    mockSearch.mockClear();
    mockSearch.mockResolvedValue('test');

    // Mock child_process.spawn
    spawnStub = jest.spyOn(child_process, 'spawn').mockImplementation(() => ({
      on: (event, callback) => callback(0) // Simulate successful exit
    }));

    // Mock process.exit
    processExitStub = jest.spyOn(process, 'exit').mockImplementation(() => {});

    // Mock console methods
    consoleLogStub = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Reset modules for each test
    jest.resetModules();
  });

  afterEach(() => {
    // Restore mocks
    jest.restoreAllMocks();
    mockFs.restore();

    // Restore original process.cwd
    process.cwd = originalCwd;
  });

  it('should execute script directly when exact match is provided as argument', async () => {
    // Setup mock filesystem with valid package.json
    mockFs({
      '/test-dir': {
        'package.json': fs.readFileSync(path.join(fixturesPath, 'validPackage.json'))
      }
    });

    // Mock process.cwd to return our test directory
    process.cwd = () => '/test-dir';

    // Set commander args to include a script name
    commander.program.args = ['lint'];

    // Import the index module (this will execute it)
    jest.isolateModules(async () => {
      try {
        await import('../../index.mjs');
      } catch (error) {
        // Expected to fail since we're in test environment
      }
    });

    // Verify search was NOT called (because exact match should run directly)
    expect(mockSearch).not.toHaveBeenCalled();

    // Verify npm run was called with the provided script directly
    expect(consoleLogStub).toHaveBeenCalledWith('Running: npm run lint');
    expect(spawnStub).toHaveBeenCalledWith('npm', ['run', 'lint'], { stdio: 'inherit', shell: true });
  });

  it('should execute single matching script when partial match is provided as argument', async () => {
    // Setup mock filesystem with valid package.json
    mockFs({
      '/test-dir': {
        'package.json': fs.readFileSync(path.join(fixturesPath, 'validPackage.json'))
      }
    });

    // Mock process.cwd to return our test directory
    process.cwd = () => '/test-dir';

    // Set commander args to include a partial script name that matches only one script
    commander.program.args = ['lin']; // Should match 'lint' only

    // Import the index module (this will execute it)
    jest.isolateModules(async () => {
      try {
        await import('../../index.mjs');
      } catch (error) {
        // Expected to fail since we're in test environment
      }
    });

    // Verify search was NOT called (because single match should run directly)
    expect(mockSearch).not.toHaveBeenCalled();

    // Verify npm run was called with the matched script directly
    expect(consoleLogStub).toHaveBeenCalledWith('Running: npm run lint');
    expect(spawnStub).toHaveBeenCalledWith('npm', ['run', 'lint'], { stdio: 'inherit', shell: true });
  });

  it('should show filtered search when partial match has multiple matches', async () => {
    // Setup mock filesystem with valid package.json
    mockFs({
      '/test-dir': {
        'package.json': fs.readFileSync(path.join(fixturesPath, 'validPackage.json'))
      }
    });

    // Mock process.cwd to return our test directory
    process.cwd = () => '/test-dir';

    // Set commander args to include a partial script name that matches multiple scripts
    commander.program.args = ['t']; // Should match 'test' and 'start'

    // Import the index module (this will execute it)
    jest.isolateModules(async () => {
      try {
        await import('../../index.mjs');
      } catch (error) {
        // Expected to fail since we're in test environment
      }
    });

    // Verify search was called with the provided script as initial filter
    expect(mockSearch).toHaveBeenCalled();
    const promptArgs = mockSearch.mock.calls[0][0];
    expect(promptArgs).toHaveProperty('message', 'Select a script to run:');
    expect(promptArgs).toHaveProperty('default', 't');

    // Verify npm run was called with the selected script from search
    expect(consoleLogStub).toHaveBeenCalledWith('Running: npm run test');
    expect(spawnStub).toHaveBeenCalledWith('npm', ['run', 'test'], { stdio: 'inherit', shell: true });
  });
});