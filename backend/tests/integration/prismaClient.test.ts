import { prisma } from '../../src/database/prismaClient';

describe('Prisma Client Integration', () => {
  beforeAll(async () => {
    // Explicitly connect (though Prisma connects lazily)
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be able to connect to the database and run a simple raw query', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    expect(result).toEqual([{ result: 1 }]);
  });
});
