import { PrismaClient } from '@prisma/client';
import express from 'express';
const prisma = new PrismaClient();
const router = express.Router();

// 공격력 계산 함수
function sumAttackPower(level, baseAttackPower) {
  const multiplier = 1 + (level - 1) * 0.1; // 레벨 기반 배율 계산
  return Math.round(baseAttackPower * multiplier); // 배율 적용 후 반올림
}

// 캐릭터 장착 함수
async function equipCharacter(userId, characterId) {
  try {
    const intUserId = parseInt(userId, 10);
    const intCharacterId = parseInt(characterId, 10);

    // 모든 플레이어에서 장착된 캐릭터를 해제 (equippedItemId 초기화는 불필요함)
    await prisma.player.updateMany({
      where: { userId: intUserId },
      data: { equippedItemId: null }, // 기존 장착 아이템 해제
    });

    // 새 캐릭터 장착 (단일 업데이트)
    const updatedPlayer = await prisma.player.update({
      where: {
        userId_characterId: {
          userId: intUserId,
          characterId: intCharacterId,
        },
      },
      data: { characterId: intCharacterId },
      include: {
        character: true, // 캐릭터 상세 정보 포함
      },
    });

    if (updatedPlayer && updatedPlayer.character) {
      console.log(
        `캐릭터 장착 성공: ${updatedPlayer.character.name} (ID: ${updatedPlayer.character.id})`
      );
    } else {
      console.log('캐릭터 장착 성공, 하지만 캐릭터 정보를 찾을 수 없습니다.');
    }

    return updatedPlayer; // 장착된 캐릭터 정보 반환
  } catch (error) {
    console.error('캐릭터 장착 오류:', error);
  }
}

// 유저 플레이어 생성 (회원가입 시 사용 가능)
async function createPlayer(userId, characterId) {
  try {
    const intUserId = parseInt(userId, 10);
    const intCharacterId = parseInt(characterId, 10);

    // 기존에 같은 유저와 캐릭터 조합이 있는지 확인
    const existingPlayer = await prisma.player.findFirst({
      where: {
        AND: [{ userId: intUserId }, { characterId: intCharacterId }],
      },
    });

    if (existingPlayer) {
      console.log('플레이어가 이미 존재합니다.');
      return existingPlayer; // 이미 플레이어가 존재하면 생성하지 않고 반환
    }

    // 선택한 캐릭터 정보 가져오기
    const character = await prisma.character.findUnique({
      where: { id: intCharacterId }, // CharacterId -> id로 수정
    });

    if (!character) {
      throw new Error('해당 캐릭터를 찾을 수 없습니다.');
    }

    const playerLevel = 1; // 초기 플레이어 레벨
    const summedAttackPower = sumAttackPower(playerLevel, character.power); // 공격력 계산

    // 유저 플레이어 생성
    const newPlayer = await prisma.player.create({
      data: {
        userId: intUserId,
        characterId: intCharacterId,
        level: playerLevel,
        exp: 0,
        equippedItemId: null, // 기본으로 장착 상태 없음
      },
    });

    console.log('플레이어 생성 성공:', newPlayer);
    console.log(`캐릭터 공격력: ${summedAttackPower}`);
    return { ...newPlayer, summedAttackPower };
  } catch (error) {
    console.error('플레이어 생성 오류:', error);
  }
}

// 플레이어 업데이트
async function updatePlayer(playerId, newLevel) {
  try {
    const player = await prisma.player.findUnique({
      where: { playerId: playerId },
      include: { character: true },
    });

    if (!player) {
      throw new Error('플레이어를 찾을 수 없습니다.');
    }

    const newAttackPower = sumAttackPower(newLevel, player.character.power);

    const updatedPlayer = await prisma.player.update({
      where: { playerId: playerId },
      data: {
        level: newLevel,
      },
    });

    console.log(`새로운 공격력: ${newAttackPower}`);
    return { ...updatedPlayer, newAttackPower };
  } catch (error) {
    console.error('플레이어 업데이트 오류:', error);
  }
}

// 플레이어의 아이템 장착 함수
async function equipItem(playerId, itemId) {
  try {
    // 장착할 아이템 정보 가져오기
    const item = await prisma.item.findUnique({
      where: { id: parseInt(itemId, 10) }, // id 필드 사용
    });

    if (!item) {
      throw new Error('해당 아이템을 찾을 수 없습니다.');
    }

    // 기존 장착 아이템 해제
    await prisma.player.updateMany({
      where: { playerId: parseInt(playerId, 10) },
      data: { equippedItemId: null },
    });

    // 새로운 아이템 장착
    const updatedPlayer = await prisma.player.update({
      where: { playerId: parseInt(playerId, 10) },
      data: {
        equippedItemId: parseInt(itemId, 10),
      },
      include: {
        equippedItem: true,
      },
    });

    console.log('아이템 장착 성공:', updatedPlayer);
    return updatedPlayer;
  } catch (error) {
    console.error('아이템 장착 오류:', error.message);
    throw new Error('아이템 장착 중 오류가 발생했습니다.');
  }
}

// 플레이어의 정보 조회 함수
async function getPlayer(playerId) {
  try {
    const player = await prisma.player.findUnique({
      where: { playerId: playerId },
      include: {
        equippedItem: true,
      },
    });
    return player;
  } catch (error) {
    console.error('플레이어 정보 조회 오류:', error);
  }
}

// 캐릭터 장착 (POST 요청)
router.post('/equip', async (req, res) => {
  const { userId, characterId } = req.body;
  const equippedPlayer = await equipCharacter(userId, characterId);
  res.json(equippedPlayer);
});

// 유저 플레이어 생성 (캐릭터 장착 시)
router.post('/create', async (req, res) => {
  const { userId, characterId } = req.body;
  const newPlayer = await createPlayer(userId, characterId);

  res.json({
    success: true,
    playerId: newPlayer.playerId,
    message: '플레이어가 성공적으로 생성되었습니다.',
  });
});

// 플레이어 정보 업데이트
router.put('/update', async (req, res) => {
  const { playerId, newLevel } = req.body;
  const updatedPlayer = await updatePlayer(playerId, newLevel);
  res.json(updatedPlayer);
});

// 플레이어 정보 조회
router.get('/:playerId', async (req, res) => {
  const { playerId } = req.params;
  const player = await getPlayer(playerId);
  res.json(player);
});

// 아이템 장착 API (POST)
router.post('/equipItem', async (req, res) => {
  const { playerId, itemId } = req.body;
  try {
    const updatedPlayer = await equipItem(playerId, itemId);
    res.json({
      success: true,
      message: '아이템이 성공적으로 장착되었습니다.',
      player: updatedPlayer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '아이템 장착 중 오류가 발생했습니다.',
    });
  }
});

export default router;
