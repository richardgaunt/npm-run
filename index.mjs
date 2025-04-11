#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import { program } from 'commander';
import { spawn } from 'child_process';

// Register the autocomplete prompt
inquirer.registerPrompt('autocomplete', autocomplete);

program
    .version('1.0.0')
    .description('Interactive CLI to run npm scripts from package.json')
    .parse(process.argv);

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

inquirer
    .prompt([
        {
            type: 'autocomplete',
            name: 'scriptName',
            message: 'Select a script to run:',
            source: (answersSoFar, input) => {
                input = input || false;
                if (!input) {
                    return Promise.resolve(scriptNames);
                }
                const filtered = scriptNames.filter(name =>
                    name.toLowerCase().includes(input.toLowerCase())
                )
                return Promise.resolve(filtered);
            }
        }
    ])
    .then(answers => {
        const { scriptName } = answers;
        const command = `npm run ${scriptName}`;

        console.log(`Running: ${command}`);
        const child = spawn('npm', ['run', scriptName], {
            stdio: 'inherit',
            shell: true
        });

        child.on('close', code => {
            process.exit(code);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
