import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // item 테이블에 여러 개의 데이터를 생성하는 코드
  await prisma.item.createMany({
    data: [
      {
        name: 'Sword',
        type: 'sword',
        power: 12,
        defence: 5,
        speed: 1,
        knockBack: 1,
        rank: 'E', // 예시로 숫자 등급(E: 1, D: 2 등등)
      },
      {
        name: 'Bow',
        type: 'bow',
        power: 8,
        defence: 3,
        speed: 1,
        knockBack: 1,
        rank: 'E', // 등급
      },
      {
        name: 'Staff',
        type: 'staff',
        power: 7,
        defence: 4,
        speed: 1,
        knockBack: 1,
        rank: 'E',
      },
      {
        name: 'Shield',
        type: 'shield',
        power: 10,
        defence: 15,
        speed: 1,
        knockBack: 2,
        rank: 'E',
      },
    ],
  });
  console.log('아이템 테이블 데이터 생성');
}

main()
  .catch((e) => {
    console.error(e, 'error');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
