// Jest setup file to handle global cleanup
import { closeBrowser } from '../bin/validator.js';

// Global cleanup after all tests
afterAll(async () => {
  await closeBrowser();
});