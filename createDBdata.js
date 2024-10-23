import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // name    String @unique
  // health  Int
  // demage  Int
  // defence Int
  // speed   Int
  await prisma.character.createMany({
    data: [
      {
        name: 'Defender',
        health: 150,
        power: 50,
        defence: 100,
        speed: 20,
      },
      {
        name: 'Slayer',
        health: 100,
        power: 80,
        defence: 50,
        speed: 30,
      },
      {
        name: 'Healer',
        health: 90,
        power: 40,
        defence: 40,
        speed: 40,
      },
      {
        name: 'Archer',
        health: 80,
        power: 70,
        defence: 30,
        speed: 50,
      },
    ],
  });
  console.log('케릭터 테이블 데이터 생성');
}

main()
  .catch((e) => {
    console.error(e, 'error');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
