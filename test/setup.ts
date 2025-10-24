// Test setup file
import { config } from '../src/utils/config';

beforeAll(() => {
  // Setup test environment
  process.env.LOG_LEVEL = 'error';
  process.env.ENABLE_CACHE = 'false';
});

afterAll(() => {
  // Cleanup
});
