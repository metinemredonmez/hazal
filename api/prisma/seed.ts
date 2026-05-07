import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
  const name = process.env.ADMIN_NAME ?? 'Hazal Muti';

  const passwordHash = await bcrypt.hash(password, 12);

  const phone = process.env.ADMIN_PHONE ?? '+905325127628';
  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, name, phone },
    create: { email, passwordHash, name, phone },
  });
  console.log(`✓ Admin seeded: ${email} (${phone})`);

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: { brandName: 'Hazal Muti Real Estate' },
    create: {
      id: 'singleton',
      brandName: 'Hazal Muti Real Estate',
      tagline: 'Premium properties, personal service.',
      defaultLocale: 'tr',
      heroTitleTr: 'Hayalinizdeki Eve Bir Adım Daha Yakın',
      heroTitleEn: 'One Step Closer to Your Dream Home',
      heroSubtitleTr: 'Seçkin ilanlar, kişisel hizmet.',
      heroSubtitleEn: 'Curated listings, personal service.',
      aboutTr: 'Hazal Muti hakkında metin buraya...',
      aboutEn: 'About Hazal Muti text here...',
    },
  });
  console.log('✓ Site settings seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
