const { PrismaClient } = require('./node_modules/.prisma/client');
const bcrypt = require('bcrypt');
(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL);
    const lookupEmail = 'admin@foo.com'.trim().toLowerCase();
    console.log('Looking up user for:', lookupEmail);
    const user = await prisma.user.findFirst({ where: { email: { equals: lookupEmail, mode: 'insensitive' } } });
    console.log('prisma returned user:', user ? { id: user.id, email: user.email, mustChangePassword: user.mustChangePassword } : null);
    if (!user) return;
    const ok = await bcrypt.compare('changeme', user.password);
    console.log('bcrypt compare result:', ok);
  } catch (e) {
    console.error('ERROR in script:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
