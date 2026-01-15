import { prisma } from '../src/db/prisma';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Clean up before all tests
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data (optional - use transactions instead for speed)
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
