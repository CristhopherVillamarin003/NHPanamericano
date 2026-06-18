import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL no está definido');
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const p = await prisma.plantilla.update({
      where: { id: 5 },
      data: { rutaArchivo: 'plantilla-protocolo.xlsx' }
    });
    console.log('Actualizada:', p);
  } catch(e: any) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
