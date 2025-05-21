import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import mockFs from 'mock-fs';
import path from 'path';
import { fileURLToPath } from 'url';
import child_process from 'child_process';
import fs from 'fs';

// Mock the search function
jest.mock('@inquirer/prompts', () => ({
  search: jest.fn().mockResolvedValue('test')
}));

// Mock child_process module
jest.mock('child_process', () => ({
  spawn: jest.fn(() => ({
    on: jest.fn()
  }))
}));

// Helpers for ES module testing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesPath = path.join(__dirname, '..', 'fixtures');

// Utility function to wait for promises to resolve
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Script Execution Integration', () => {
  let processExitStub;
  let consoleLogStub;
  let consoleErrorStub;
  let originalCwd;

  beforeEach(() => {
    // Save original process.cwd
    originalCwd = process.cwd;

    // Mock process.exit
    processExitStub = jest.spyOn(process, 'exit').mockImplementation(() => {});

    // Mock console methods
    consoleLogStub = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorStub = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore mocks
    jest.restoreAllMocks();
    mockFs.restore();

    // Restore original process.cwd
    process.cwd = originalCwd;
  });

  it('should exit with error when no package.json is found', async () => {
    // Setup mock filesystem with no package.json
    mockFs({
      '/test-dir': {}
    });

    // Mock process.cwd to return our test directory
    process.cwd = () => '/test-dir';

    // Use dynamic import to load the module
    // This will trigger the immediate error before the async part
    await jest.isolateModules(async () => {
      try {
        await import('../../index.mjs');
      } catch (error) {
        // Expected to fail since we're in test environment
      }
    });

    // Wait for promises to resolve
    await flushPromises();

    // Check that the error message was shown and process.exit was called
    expect(consoleErrorStub).toHaveBeenCalledWith('Error: No package.json found in the current directory.');
    expect(processExitStub).toHaveBeenCalledWith(1);
  });

  it('should exit with error when package.json is invalid', async () => {
    // Setup mock filesystem with invalid package.json
    mockFs({
      '/test-dir': {
        'package.json': fs.readFileSync(path.join(fixturesPath, 'invalidJson.json'))
      }
    });

    // Mock process.cwd to return our test directory
    process.cwd = () => '/test-dir';

    // Use dynamic import to load the module
    await jest.isolateModules(async () => {
      try {
        await import('../../index.mjs');
      } catch (error) {
        // Expected to fail since we're in test environment
      }
    });

    // Wait for promises to resolve
    await flushPromises();

    // Check that the error message was shown and process.exit was called
    expect(consoleErrorStub).toHaveBeenCalledWith(expect.stringMatching(/Error parsing package.json:/));
    expect(processExitStub).toHaveBeenCalledWith(1);
  });

  it('should exit with message when no scripts are found', async () => {
    // Setup mock filesystem with package.json with no scripts
    mockFs({
      '/test-dir': {
        'package.json': fs.readFileSync(path.join(fixturesPath, 'noScripts.json'))
      }
    });

    // Mock process.cwd to return our test directory
    process.cwd = () => '/test-dir';

    // Use dynamic import to load the module
    await jest.isolateModules(async () => {
      try {
        await import('../../index.mjs');
      } catch (error) {
        // Expected to fail since we're in test environment
      }
    });

    // Wait for promises to resolve
    await flushPromises();

    // Check that the message was shown and process.exit was called
    expect(consoleLogStub).toHaveBeenCalledWith('No scripts found in package.json.');
    expect(processExitStub).toHaveBeenCalledWith(0);
  });

  // Note: Testing the inquirer prompt functionality would require more complex mocking,
  // which is beyond the scope of this initial test implementation.
});