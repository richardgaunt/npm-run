import sinon from 'sinon';
import mockFs from 'mock-fs';
import path from 'path';
import { fileURLToPath } from 'url';
import child_process from 'child_process';
import fs from 'fs';

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
    spawnStub = sinon.stub(child_process, 'spawn');
    spawnStub.returns({
      on: sinon.stub().yields(0) // Simulate successful exit
    });
    
    // Mock process.exit
    processExitStub = sinon.stub(process, 'exit');
    
    // Mock console methods
    consoleLogStub = sinon.stub(console, 'log');
    consoleErrorStub = sinon.stub(console, 'error');
  });

  afterEach(() => {
    // Restore mocks
    spawnStub.restore();
    processExitStub.restore();
    consoleLogStub.restore();
    consoleErrorStub.restore();
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
    try {
      await import('../../index.mjs');
    } catch (e) {
      // Expected to fail since we're in test environment
    }
    
    expect(consoleErrorStub.calledWith('Error: No package.json found in the current directory.')).toBe(true);
    expect(processExitStub.calledWith(1)).toBe(true);
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
    try {
      await import('../../index.mjs');
    } catch (e) {
      // Expected to fail since we're in test environment
    }
    
    expect(consoleErrorStub.calledWithMatch('Error parsing package.json:')).toBe(true);
    expect(processExitStub.calledWith(1)).toBe(true);
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
    try {
      await import('../../index.mjs');
    } catch (e) {
      // Expected to fail since we're in test environment
    }
    
    expect(consoleLogStub.calledWith('No scripts found in package.json.')).toBe(true);
    expect(processExitStub.calledWith(0)).toBe(true);
  });

  // Note: Testing the inquirer prompt functionality would require more complex mocking,
  // which is beyond the scope of this initial test implementation.
  // We'll add a note about this in our README.
});