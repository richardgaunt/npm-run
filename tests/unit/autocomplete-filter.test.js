import { describe, it, expect } from '@jest/globals';

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
    expect(filterScriptNames(scriptNames, '')).toEqual(scriptNames);
    expect(filterScriptNames(scriptNames, null)).toEqual(scriptNames);
    expect(filterScriptNames(scriptNames, undefined)).toEqual(scriptNames);
  });

  it('should filter script names based on input string', () => {
    expect(filterScriptNames(scriptNames, 'de')).toEqual(['dev', 'deploy']);
    expect(filterScriptNames(scriptNames, 'st')).toEqual(['start', 'test']);
    expect(filterScriptNames(scriptNames, 'build')).toEqual(['build']);
  });

  it('should be case insensitive', () => {
    expect(filterScriptNames(scriptNames, 'DE')).toEqual(['dev', 'deploy']);
    expect(filterScriptNames(scriptNames, 'Test')).toEqual(['test']);
  });

  it('should return empty array when no matches found', () => {
    expect(filterScriptNames(scriptNames, 'xyz')).toEqual([]);
    expect(filterScriptNames(scriptNames, '123')).toEqual([]);
  });
});