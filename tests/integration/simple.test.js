import { jest, describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simple integration test to ensure test suite runs properly
describe('Simple Integration Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
  
  it('should detect npm-runner structure', () => {
    // Get current directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const projectRoot = path.resolve(__dirname, '../..');
    
    // Check if index.mjs exists
    const indexPath = path.join(projectRoot, 'index.mjs');
    const indexExists = fs.existsSync(indexPath);
    expect(indexExists).toBe(true);
    
    // Check if package.json exists and has expected scripts
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJsonExists = fs.existsSync(packageJsonPath);
    expect(packageJsonExists).toBe(true);
    
    if (packageJsonExists) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      expect(packageJson.name).toBe('npm-run');
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
    }
  });
});