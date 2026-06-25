require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const url = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: url });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const cuidados = await prisma.cuidado.findMany();
  let updatedCount = 0;
  for (const c of cuidados) {
    if (c.datos && typeof c.datos === 'object' && c.datos.html) {
      const newDatos = { ...c.datos };
      delete newDatos.html; 
      await prisma.cuidado.update({
        where: { id: c.id },
        data: { datos: newDatos }
      });
      updatedCount++;
    }
  }
  console.log(`Successfully cleared HTML for ${updatedCount} cuidados records.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
