import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import mockFs from 'mock-fs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helpers for ES module testing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesPath = path.join(__dirname, '..', 'fixtures');

// Functions to test - extracted from index.mjs
function loadPackageJson(packageJsonPath) {
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('No package.json found');
  }
  
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    throw new Error(`Error parsing package.json: ${error.message}`);
  }
}

function extractScripts(packageJson) {
  return packageJson.scripts || {};
}

describe('Package Parser', () => {
  afterEach(() => {
    mockFs.restore();
  });

  describe('loadPackageJson', () => {
    it('should load and parse a valid package.json file', () => {
      // Setup mock filesystem
      mockFs({
        '/test-dir': {
          'package.json': fs.readFileSync(path.join(fixturesPath, 'validPackage.json'))
        }
      });

      const result = loadPackageJson('/test-dir/package.json');
      expect(result).to.be.an('object');
      expect(result.name).to.equal('test-package');
      expect(result.scripts).to.be.an('object');
    });

    it('should throw an error if package.json does not exist', () => {
      mockFs({
        '/test-dir': {}
      });

      expect(() => loadPackageJson('/test-dir/package.json')).to.throw('No package.json found');
    });

    it('should throw an error if package.json is invalid JSON', () => {
      mockFs({
        '/test-dir': {
          'package.json': fs.readFileSync(path.join(fixturesPath, 'invalidJson.json'))
        }
      });

      expect(() => loadPackageJson('/test-dir/package.json')).to.throw('Error parsing package.json');
    });
  });

  describe('extractScripts', () => {
    it('should extract scripts from a valid package.json', () => {
      const packageJson = JSON.parse(fs.readFileSync(path.join(fixturesPath, 'validPackage.json')));
      const scripts = extractScripts(packageJson);
      
      expect(scripts).to.be.an('object');
      expect(Object.keys(scripts)).to.have.lengthOf(5);
      expect(scripts.start).to.equal('node server.js');
      expect(scripts.test).to.equal('jest');
    });

    it('should return an empty object when scripts section is empty', () => {
      const packageJson = JSON.parse(fs.readFileSync(path.join(fixturesPath, 'emptyScripts.json')));
      const scripts = extractScripts(packageJson);
      
      expect(scripts).to.be.an('object');
      expect(Object.keys(scripts)).to.have.lengthOf(0);
    });

    it('should return an empty object when scripts section is missing', () => {
      const packageJson = JSON.parse(fs.readFileSync(path.join(fixturesPath, 'noScripts.json')));
      const scripts = extractScripts(packageJson);
      
      expect(scripts).to.be.an('object');
      expect(Object.keys(scripts)).to.have.lengthOf(0);
    });
  });
});