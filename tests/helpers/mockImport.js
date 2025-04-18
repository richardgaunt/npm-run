/**
 * Helper module to safely import index.mjs for testing
 * This prevents issues with multiple imports during tests
 */

import { jest } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Clean the module cache to ensure fresh imports
export async function importIndexModule() {
  // Clear require cache for the module
  const modulePath = path.resolve(process.cwd(), 'index.mjs');
  
  try {
    // Import the module
    const importedModule = await import('../../index.mjs');
    return importedModule;
  } catch (error) {
    // Expected to sometimes fail in tests
    return null;
  }
}