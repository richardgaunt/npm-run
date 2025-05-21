import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import mockFs from 'mock-fs';
import path from 'path';
import { fileURLToPath } from 'url';
import child_process from 'child_process';
import fs from 'fs';

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

// Helpers for ES module testing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesPath = path.join(__dirname, '..', 'fixtures');

describe('Prompt Interaction', () => {
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
  });

  afterEach(() => {
    // Restore mocks
    jest.restoreAllMocks();
    mockFs.restore();

    // Restore original process.cwd
    process.cwd = originalCwd;
  });

  it('should execute the selected script when user makes a selection', async () => {
    // Setup mock filesystem with valid package.json
    mockFs({
      '/test-dir': {
        'package.json': fs.readFileSync(path.join(fixturesPath, 'validPackage.json'))
      }
    });

    // Mock process.cwd to return our test directory
    process.cwd = () => '/test-dir';

    // Import the index module (this will execute it)
    jest.isolateModules(async () => {
      try {
        await import('../../index.mjs');
      } catch (error) {
        // Expected to fail since we're in test environment
      }
    });

    // Verify the search prompt was shown with correct options
    expect(mockSearch).toHaveBeenCalled();
    const promptArgs = mockSearch.mock.calls[0][0];
    expect(promptArgs).toHaveProperty('message', 'Select a script to run:');
    expect(promptArgs).toHaveProperty('choices');

    // Test that the choices contain all the expected scripts
    const choices = promptArgs.choices.map(choice => choice.value);
    expect(choices).toEqual(expect.arrayContaining(['start', 'test', 'build', 'dev', 'lint']));

    // Verify npm run was called with the selected script
    expect(consoleLogStub).toHaveBeenCalledWith('Running: npm run test');
    expect(spawnStub).toHaveBeenCalledWith('npm', ['run', 'test'], { stdio: 'inherit', shell: true });

    // Verify process.exit was called with the exit code from the child process
    expect(processExitStub).toHaveBeenCalledWith(0);
  });

  it('should handle errors during script execution', async () => {
    // Setup mock filesystem with valid package.json
    mockFs({
      '/test-dir': {
        'package.json': fs.readFileSync(path.join(fixturesPath, 'validPackage.json'))
      }
    });

    // Mock process.cwd to return our test directory
    process.cwd = () => '/test-dir';

    // Mock user selecting "build" script
    mockSearch.mockResolvedValueOnce('build');

    // Mock spawn to simulate an error during execution
    spawnStub.mockImplementation(() => ({
      on: (event, callback) => callback(1) // Simulate error exit code
    }));

    // Import the index module (this will execute it)
    jest.isolateModules(async () => {
      try {
        await import('../../index.mjs');
      } catch (error) {
        // Expected to fail since we're in test environment
      }
    });

    // Verify npm run was called with the selected script
    expect(consoleLogStub).toHaveBeenCalledWith('Running: npm run build');
    expect(spawnStub).toHaveBeenCalledWith('npm', ['run', 'build'], { stdio: 'inherit', shell: true });

    // Verify process.exit was called with the error code from the child process
    expect(processExitStub).toHaveBeenCalledWith(1);
  });
});
