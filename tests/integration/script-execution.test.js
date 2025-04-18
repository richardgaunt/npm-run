import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import mockFs from 'mock-fs';
import path from 'path';
import { fileURLToPath } from 'url';
import child_process from 'child_process';
import fs from 'fs';

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

describe('Script Execution Integration', () => {
  let spawnStub;
  let processExitStub;
  let consoleLogStub;
  let consoleErrorStub;
  let originalCwd;

  beforeEach(() => {
    // Save original process.cwd
    originalCwd = process.cwd;
    
    // Mock child_process.spawn
    spawnStub = jest.spyOn(child_process, 'spawn').mockImplementation(() => ({
      on: (event, callback) => callback(0) // Simulate successful exit
    }));
    
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
    
    // Import the index module (this will execute it)
    jest.isolateModules(async () => {
      try {
        await import('../../index.mjs');
      } catch (e) {
        // Expected to fail since we're in test environment
      }
    });
    
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
    
    // Import the index module (this will execute it)
    jest.isolateModules(async () => {
      try {
        await import('../../index.mjs');
      } catch (e) {
        // Expected to fail since we're in test environment
      }
    });
    
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
    
    // Import the index module (this will execute it)
    jest.isolateModules(async () => {
      try {
        await import('../../index.mjs');
      } catch (e) {
        // Expected to fail since we're in test environment
      }
    });
    
    expect(consoleLogStub).toHaveBeenCalledWith('No scripts found in package.json.');
    expect(processExitStub).toHaveBeenCalledWith(0);
  });

  // Note: Testing the inquirer prompt functionality would require more complex mocking,
  // which is beyond the scope of this initial test implementation.
});