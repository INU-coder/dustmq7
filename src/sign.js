import express from 'express';
import { PrismaClient } from '@prisma/client'; // 데이터베이스와 연결하는 라이브러리
import Joi from 'joi'; // 입력값을 확인해주는 라이브러리
import jwt from 'jsonwebtoken'; // 토큰을 생성하고 확인하는 라이브러리
import dotenv from 'dotenv'; // 환경 변수 로드

dotenv.config(); // .env 파일에서 설정 값들을 불러옴

const prisma = new PrismaClient(); // 데이터베이스 연결
const router = express.Router(); // 라우터 설정

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// 회원가입을 검사하는 joi
const 회원가입검사 = Joi.object({
  id: Joi.string().min(3).email().required().messages({
    'string.email': 'ID는 유효한 이메일 형식이여야 합니다.',
    'string.min': 'ID는 최소 3글자 이상이여야 합니다.',
    'any.required': 'ID는 필수 항목입니다.',
  }),
  name: Joi.string().min(1).required().messages({
    'string.min': '이름은 최소 1글자 이상이여야 합니다.',
    'any.required': '이름은 필수 항목입니다.',
  }),
  password: Joi.string().min(3).lowercase().required().messages({
    'string.min': '비밀번호는 최소 3자 이상이어야 합니다.',
    'any.required': '비밀번호는 필수 항목입니다.',
  }),
});

// 로그인을 검사하는 joi
const 로그인검사 = Joi.object({
  id: Joi.string().min(3).email().required().messages({
    'string.email': 'ID는 유효한 이메일 형식이여야 합니다.',
    'string.min': 'ID는 최소 3글자 이상이여야 합니다.',
    'any.required': 'ID는 필수 항목입니다.',
  }),
  password: Joi.string().min(3).lowercase().required().messages({
    'string.min': '비밀번호는 최소 3자 이상이어야 합니다.',
    'any.required': '비밀번호는 필수 항목입니다.',
  }),
});

// JWT 토큰 생성 함수
function 액세스토큰생성(userId) {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

function 리프레시토큰생성(userId) {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
}

// 회원가입 함수
async function signUp(req, res) {
  console.log('Received signup request:', req.body);
  const { id, name, password } = req.body;

  // 회원가입 입력값 검증
  const { error } = 회원가입검사.validate({ id, name, password });
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    // 이미 존재하는 유저인지 확인
    const inUser = await prisma.user.findUnique({ where: { account: id } });

    if (inUser) {
      return res
        .status(400)
        .json({ success: false, message: '이미 존재하는 사용자입니다.' });
    }

    // 새 유저 생성
    const newUser = await prisma.user.create({
      data: { account: id, name, password },
    });

    // 유저에게 기본 캐릭터 4개 생성
    await prisma.player.createMany({
      data: [
        { userId: newUser.userId, characterId: 1 }, // 기본 캐릭터 1
        { userId: newUser.userId, characterId: 2 }, // 기본 캐릭터 2
        { userId: newUser.userId, characterId: 3 }, // 기본 캐릭터 3
        { userId: newUser.userId, characterId: 4 }, // 기본 캐릭터 4
      ],
    });

    // 기본 아이템 4개 지급 - Inventory 테이블에 추가
    const defaultItems = [1, 2, 3, 4]; // 기본 아이템 ID들
    const inventoryData = defaultItems.map((itemId) => ({
      userId: newUser.userId,
      itemId,
    }));

    await prisma.inventory.createMany({
      data: inventoryData,
    });

    // 첫 번째 캐릭터에 첫 번째 아이템 장착 상태로 설정
    await prisma.player.updateMany({
      where: { userId: newUser.userId, characterId: 1 },
      data: { equippedItemId: 1 }, // 첫 번째 캐릭터에 첫 번째 아이템 장착
    });

    // 성공 응답
    return res.status(200).json({
      success: true,
      message: `환영합니다, ${name}. 기본 캐릭터와 아이템이 지급되었습니다.`,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return res
      .status(500)
      .json({ success: false, message: '회원가입 중 오류가 발생했습니다.' });
  }
}

// 로그인 함수
async function login(req, res) {
  const { id, password } = req.body;
  const { error } = 로그인검사.validate({ id, password });
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  try {
    const user = await prisma.user.findUnique({ where: { account: id } });
    if (!user || user.password !== password) {
      return res
        .status(400)
        .json({ success: false, message: '잘못된 로그인 정보입니다.' });
    }

    const accessToken = 액세스토큰생성(user.userId);
    const refreshToken = 리프레시토큰생성(user.userId);

    return res.status(200).json({
      success: true,
      message: `로그인 성공! 환영합니다, ${user.name}`,
      accessToken,
      refreshToken,
      user: { id: user.userId, name: user.name },
    });
  } catch (error) {
    console.error('로그인 중 오류:', error);
    return res
      .status(500)
      .json({ success: false, message: '로그인 중 오류가 발생했습니다.' });
  }
}

// 닉네임 변경 함수
async function changeName(req, res) {
  const { id, password, newName } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { account: id } });
    if (!user || user.password !== password) {
      return res
        .status(400)
        .json({ success: false, message: '비밀번호가 틀렸습니다.' });
    }

    await prisma.user.update({
      where: { account: id },
      data: { name: newName },
    });
    return res.status(200).json({
      success: true,
      message: `이름이 ${newName}로 변경되었습니다.`,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: '닉네임 변경 중 오류가 발생했습니다.' });
  }
}

// 회원 탈퇴 함수
async function signOut(req, res) {
  const { id, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { account: id } });
    if (!user || user.password !== password) {
      return res
        .status(400)
        .json({ success: false, message: '로그인 정보가 잘못되었습니다.' });
    }
    await prisma.user.delete({ where: { account: id } });
    return res.status(200).json({
      success: true,
      message: '회원 탈퇴가 완료되었습니다. 다시 돌아오실거죠?',
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: '회원 탈퇴 중 오류가 발생했습니다.' });
  }
}

// 라우트 정의
router.post('/signup', signUp);
router.post('/login', login);
router.put('/changeName', changeName);
router.delete('/signOut', signOut);

export default router;
