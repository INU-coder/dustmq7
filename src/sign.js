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
    'string.email': '선생님 ID는 유효한 이메일 형식이여야해요...',
    'string.min': 'ID는 최소 3글자 이상이여야해요... ',
    'any.required': '당신 ID를 입력하지 않았군... 넌 못지나간다.',
  }),
  name: Joi.string().min(1).required().messages({
    'string.min': '당신의 이름이 한글자 미만이라면 뭐라고 불러야 하죠?',
    'any.required': '당신 name을 입력하지 않았군... 넌 못지나간다.',
  }),
  password: Joi.string().min(3).lowercase().required().messages({
    'string.min': '세자리보다 적은 자물쇠는 없습니다.',
    'any.required': '비밀번호가 없는 당신은 도플갱어입니다.',
  }),
});
// 로그인을 검사하는 joi
const 로그인검사 = Joi.object({
  id: Joi.string().min(3).email().required().messages({
    'string.email': '선생님 ID는 유효한 이메일 형식이여야해요...',
    'string.min': 'ID는 최소 3글자 이상이여야해요... ',
    'any.required': '당신 ID를 입력하지 않았군... 넌 못지나간다.',
  }),
  password: Joi.string().min(3).lowercase().required().messages({
    'string.min': '세자리보다 적은 자물쇠는 없습니다.',
    'any.required': '비밀번호가 없는 당신은 도플갱어입니다.',
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
  console.log('Received signup request:', req.body); // 요청 데이터 출력
  const { id, name, password } = req.body;
  const { error } = 회원가입검사.validate({ id, name, password });
  if (error) {
    console.log('Validation error:', error); // 유효성 검사 실패 시 출력
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  try {
    const inUser = await prisma.user.findUnique({ where: { account: id } });
    if (inUser) {
      return res.status(400).json({
        success: false,
        message: '그 사람은 방금 저와 통화 했습니다. 당신은 누구죠?',
      });
    }
    await prisma.user.create({
      data: { account: id, name, password },
    });
    return res
      .status(200)
      .json({ success: true, message: `처음 뵙겠습니다. ${name}.` });
  } catch (error) {
    console.error('Error during signup:', error); // 에러 로그 출력
    return res
      .status(500)
      .json({ success: false, message: '회원가입 중 오류가 발생했습니다.' });
  }
}

// 로그인 함수
async function login(req, res) {
  console.log('Received login request body:', req.body); // 요청 데이터를 콘솔에 출력
  const { id, password } = req.body;
  const { error } = 로그인검사.validate({ id, password });
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const user = await prisma.user.findUnique({ where: { account: id } });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: '그런 녀석은 존재하지 않아 누구냐 넌',
      });
    }
    if (user.password !== password) {
      return res.status(400).json({
        success: false,
        message: '비밀번호가 틀렸습니다 당신은 로봇입니까?',
      });
    }
    const accessToken = 액세스토큰생성(user.id);
    const refreshToken = 리프레시토큰생성(user.id);
    // 로그인 성공 시 보내는 데이터
    return res.status(200).json({
      success: true,
      message: `로그인 성공! 환영합니다, ${user.name}`,
      accessToken, // 토큰을 응답에 포함
      refreshToken, // 토큰을 응답에 포함
      user: {
        id: user.id,
        name: user.name,
      },
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
      return res.status(400).json({
        success: false,
        message: '비밀번호가 틀렸어요 당신은 로봇입니다.^^',
      });
    }
    await prisma.user.update({
      where: { account: id },
      data: { name: newName },
    });
    return res.status(200).json({
      success: true,
      message: `이름을 바꾸셨네요...? 왜 바꾸셨죠?${newName}.`,
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
        .json({ success: false, message: '들어올 땐 마음대로지만...' });
    }
    await prisma.user.delete({ where: { account: id } });
    return res.status(200).json({
      success: true,
      message:
        '잘가요... 제가 진짜 가는사람 붙잡는거 안좋아하는데... 진짜 이대로 가시면 서운할거 같아요... 다시 오실거죠...?',
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
