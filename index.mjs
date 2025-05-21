#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { search } from '@inquirer/prompts';
import { program } from 'commander';
import { spawn } from 'child_process';

program
  .version('1.0.0')
  .description('Interactive CLI to run npm scripts from package.json')
  .arguments('[script]')
  .parse(process.argv);

// Get script name from command line arguments if provided
const providedScript = program.args[0] ?? '';

// Check if package.json exists in the current directory
const packageJsonPath = path.join(process.cwd(), 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: No package.json found in the current directory.');
  process.exit(1);
}

// Load and parse package.json
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('Error parsing package.json:', error.message);
  process.exit(1);
}

// Extract scripts from package.json
const scripts = packageJson.scripts || {};
const scriptNames = Object.keys(scripts);

if (scriptNames.length === 0) {
  console.log('No scripts found in package.json.');
  process.exit(0);
}

/**
 * Execute the specified npm script
 * @param {string} scriptName - The name of the script to run
 */
function executeScript(scriptName) {
  const command = `npm run ${scriptName}`;
  console.log(`Running: ${command}`);

  const child = spawn('npm', ['run', scriptName], {
    stdio: 'inherit',
    shell: true
  });

  child.on('close', code => {
    process.exit(code);
  });
}

/**
 * Filter script names based on input
 * @param {string} input - The filter text
 * @param {string[]} names - List of script names
 * @returns {Array} Filtered list of choices
 */
function filterScriptNames(input = '', names) {
  const normalizedInput = input.toLowerCase();
  return names
    .filter(name => name.toLowerCase().includes(normalizedInput))
    .map(name => ({ value: name, name }));
}

async function main() {
  try {
    const scriptName = await search({
      message: 'Select a script to run:',
      source: (input = providedScript) => { return filterScriptNames(input, scriptNames); },
      initialValue: providedScript
    });

    executeScript(scriptName);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
