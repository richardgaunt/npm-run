import { describe, it } from 'mocha';
import { expect } from 'chai';

// Function to test - extracted from index.mjs
function filterScriptNames(scriptNames, input) {
  if (!input) {
    return scriptNames;
  }
  
  return scriptNames.filter(name =>
    name.toLowerCase().includes(input.toLowerCase())
  );
}

describe('Autocomplete Filter', () => {
  const scriptNames = ['start', 'test', 'build', 'dev', 'lint', 'deploy'];

  it('should return all script names when input is falsy', () => {
    expect(filterScriptNames(scriptNames, '')).to.deep.equal(scriptNames);
    expect(filterScriptNames(scriptNames, null)).to.deep.equal(scriptNames);
    expect(filterScriptNames(scriptNames, undefined)).to.deep.equal(scriptNames);
  });

  it('should filter script names based on input string', () => {
    expect(filterScriptNames(scriptNames, 'de')).to.deep.equal(['dev', 'deploy']);
    expect(filterScriptNames(scriptNames, 'st')).to.deep.equal(['start', 'test']);
    expect(filterScriptNames(scriptNames, 'build')).to.deep.equal(['build']);
  });

  it('should be case insensitive', () => {
    expect(filterScriptNames(scriptNames, 'DE')).to.deep.equal(['dev', 'deploy']);
    expect(filterScriptNames(scriptNames, 'Test')).to.deep.equal(['test']);
  });

  it('should return empty array when no matches found', () => {
    expect(filterScriptNames(scriptNames, 'xyz')).to.deep.equal([]);
    expect(filterScriptNames(scriptNames, '123')).to.deep.equal([]);
  });
});