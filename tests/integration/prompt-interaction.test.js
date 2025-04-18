import sinon from 'sinon';
import mockFs from 'mock-fs';
import path from 'path';
import { fileURLToPath } from 'url';
import child_process from 'child_process';
import fs from 'fs';
import inquirer from 'inquirer';

// Helpers for ES module testing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesPath = path.join(__dirname, '..', 'fixtures');

describe('Prompt Interaction', () => {
  let promptStub;
  let spawnStub;
  let processExitStub;
  let consoleLogStub;
  let originalCwd;

  beforeEach(() => {
    // Save original process.cwd
    originalCwd = process.cwd;
    
    // Mock inquirer.prompt
    promptStub = sinon.stub(inquirer, 'prompt');
    
    // Mock child_process.spawn
    spawnStub = sinon.stub(child_process, 'spawn');
    spawnStub.returns({
      on: sinon.stub().yields(0) // Simulate successful exit
    });
    
    // Mock process.exit
    processExitStub = sinon.stub(process, 'exit');
    
    // Mock console methods
    consoleLogStub = sinon.stub(console, 'log');
  });

  afterEach(() => {
    // Restore mocks
    promptStub.restore();
    spawnStub.restore();
    processExitStub.restore();
    consoleLogStub.restore();
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
    
    // Mock user selecting "test" script
    promptStub.resolves({ scriptName: 'test' });
    
    // Import the index module (this will execute it)
    try {
      await import('../../index.mjs');
    } catch (e) {
      // Expected to fail since we're in test environment
    }
    
    // Verify the prompt was shown with correct options
    expect(promptStub.called).toBe(true);
    const promptArgs = promptStub.firstCall.args[0];
    expect(promptArgs).toBeInstanceOf(Array);
    expect(promptArgs[0].type).toBe('autocomplete');
    expect(promptArgs[0].name).toBe('scriptName');
    
    // Test the source function from the prompt
    const sourceFunction = promptArgs[0].source;
    const allScripts = await sourceFunction({}, '');
    expect(allScripts).toEqual(expect.arrayContaining(['start', 'test', 'build', 'dev', 'lint']));
    
    const filteredScripts = await sourceFunction({}, 'de');
    expect(filteredScripts).toEqual(['dev']);
    
    // Verify npm run was called with the selected script
    expect(consoleLogStub.calledWith('Running: npm run test')).toBe(true);
    expect(spawnStub.calledWith('npm', ['run', 'test'], { stdio: 'inherit', shell: true })).toBe(true);
    
    // Verify process.exit was called with the exit code from the child process
    expect(processExitStub.calledWith(0)).toBe(true);
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
    promptStub.resolves({ scriptName: 'build' });
    
    // Mock spawn to simulate an error during execution
    spawnStub.returns({
      on: sinon.stub().yields(1) // Simulate error exit code
    });
    
    // Import the index module (this will execute it)
    try {
      await import('../../index.mjs');
    } catch (e) {
      // Expected to fail since we're in test environment
    }
    
    // Verify npm run was called with the selected script
    expect(consoleLogStub.calledWith('Running: npm run build')).toBe(true);
    expect(spawnStub.calledWith('npm', ['run', 'build'], { stdio: 'inherit', shell: true })).toBe(true);
    
    // Verify process.exit was called with the error code from the child process
    expect(processExitStub.calledWith(1)).toBe(true);
  });
});