10.15 (화)
모든 일의 시작.
시작이 반이니 벌써 반이나했다.
그리고 가만히있으면 반은 간다라는 말이 있다.
시작하고 가만히있으면 완성해버린것인가?
반의 반일수도있으니
나머지 25%일지도모르는 부분을 채우기 위해서 md파일을 작성하기로 했다.
우선은.

노래 무료 다운로드 및 사용가능한 사이트
간혹 조건이 붙을 수 있으니 주의요망
sell뮤직
https://www.sellbuymusic.com/?gad_source=1&gclid=Cj0KCQjwsc24BhDPARIsAFXqAB2ePBwBVxSsa24qi2uZZaz72z6rXf1ppMQu1KYsI79AKLzPUNCWfgEaAssXEALw_wcB

# 데이터베이스 설정

1. **데이터베이스 생성**:
   기존에 구축하였던 MySQL 를 사용하세요.

2. **데이터 입력**:
   API가 메뉴와 통계를 조회할 수 있도록 데이터베이스에 샘플 데이터를 추가하세요.

## 데이터베이스 연동

제공된 코드는 현재 정적 JSON 데이터를 반환합니다. 이를 프리즈마를 사용해서 실제 데이터베이스와 연동해주세요.

1. **API 코드 업데이트**:
   `router.get('/stats')`와 `router.get('/')` 경로를 수정하여 데이터베이스에서 데이터를 조회하도록 변경합니다.
   이걸 해야한다.
   스켈레톤코드가 내머리속에서 물음표핑을 계속 찍어내기에
   위 지시 사항을 이행하면서
   처음부터 만들어보려고한다.
   브레인스토밍
   ERD다이어그램을 짜보자!
   뭘 뭔저 해야 잘했다고 소문이 날까
   우선 로그인 회원가입 닉네임변경 회원탈퇴 기능은 넣어야한다.
   그리고 db을 이용한 아이템 상호작용을 해야한다.
   아이템을 이용하여 게임에 활용되게끔 만들어야한다.
   아이템은 개인적으로 상점에서 뽑고싶다.
   그렇다면 필요한건 user,item.....orderhistory? 정도밖에 생각나는게 없다.

일단은 ERD다이어그램을 작성하고 그걸 기반으로 스키마를 작성해보았다.
model User {
userId Int @id @default(autoincrement()) @map("user_id")
account String @unique @map("account")
password String @map("password")
name String @map("name")
cashAmount Int @default(1000) @map("cash_amount") // 기본 캐시 설정
teamName String @map("team_name")
score Int @default(1000) @map("score")
userPlayers UserPlayer[] // User와 UserPlayer의 1:N 관계
@@map("users")
}
model UserPlayer {
userPlayerId Int @id @default(autoincrement()) @map("user_player_id")
userId Int @map("user_id")
characterId Int @map("character_id")
isEquipped Boolean @default(false) @map("is_equipped")
user User @relation(fields: [userId], references: [userId], onDelete: Cascade)
character Character @relation(fields: [characterId], references: [characterId], onDelete: Cascade)
@@map("user_players")
}

model Character {
characterId Int @id @default(autoincrement()) @map("character_id")
name String @map("name")
speed Int @map("speed")
moreMoney Int @map("more_money")
rank String @map("rank")
userPlayers UserPlayer[] // Character와 UserPlayer의 1:N 관계
@@map("characters")
}

model Pack {
id Int @id @default(autoincrement()) @map("id")
name String @map("name")
price Int @map("price")
S Int @map("s")
A Int @map("a")
B Int @map("b")
C Int @map("c")
D Int @map("d")
@@map("packs")
}
그거에 맞는 폴더구조는 아래와 같다.
아직은 할게많다.
dustmq7
├── client // 프론트 코드
│ │ └── png/
│ │ ├──Archer.PNG
│ │ ├──Defender.PNG
│ │ ├──Healer.PNG
│ │ └──Slayer.PNG
│ ├── index.html
│ ├── index.js
│ └── styles.css
├── prisma
│   └── schema.prisma
├── src // 서버 코드
│ ├── app.js
│ ├── sign.js
│ └── player.js
├── .env
├── .gitignore
├── .prettierc
├── package-lock.json
├── package.json
└── readme.md

// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "mysql"
url = env("DATABASE_URL")
}

model User {
userId Int @id @default(autoincrement()) @map("user_id")
account String @unique @map("account")
password String @map("password")
name String @map("name")
cashAmount Int @default(1000) @map("cash_amount") // 기본 캐시 설정
teamName String @map("team_name")
score Int @default(1000) @map("score")

userPlayers UserPlayer[] // User와 UserPlayer의 1:N 관계

@@map("users")
}

model UserPlayer {
userPlayerId Int @id @default(autoincrement()) @map("user_player_id")
userId Int @map("user_id")
characterId Int @map("character_id")
isEquipped Boolean @default(false) @map("is_equipped")

user User @relation(fields: [userId], references: [userId], onDelete: Cascade)
character Character @relation(fields: [characterId], references: [characterId], onDelete: Cascade)

@@map("user_players")
}

model Character {
characterId Int @id @default(autoincrement()) @map("character_id")
name String @map("name")
speed Int @map("speed")
moreMoney Int @map("more_money")
rank String @map("rank")

userPlayers UserPlayer[] // Character와 UserPlayer의 1:N 관계

@@map("characters")
}

model Pack {
id Int @id @default(autoincrement()) @map("id")
name String @map("name")
price Int @map("price")
S Int @map("s")
A Int @map("a")
B Int @map("b")
C Int @map("c")
D Int @map("d")

@@map("packs")
}

혼자 시작하는 프로젝트는 천성이그런진몰라도 벌써 두근두근하다.
10.16 (수) -빛정섭 가라사데-
보이지않는 기능하나보다는 게임답게 만들때 필요하다면 기능이 붙기에
게임답게만드는게 먼저다.

말씀에 따라 게임을 기획해봐야겠다.

실시간협동게임을 만들고싶은데.
각자 시작할때 케릭터마다의 특성을 가지고 플레이를 하고,
게임화면오른쪽에 소통을 위한 채팅이 있었으면좋겠다.
멀티게임의 꽃은 무엇인가.
그것은 누군가한명이 부족하면
부족함.이 느껴지는 게임이 아닐까싶다.
4인게임기준으로 만들어보려고한다

탱킹이 잘되는 tank.
건물을 새우는 scv.
원거리 공격을 하는 Archer
귀족. 힐러.

정도면 되지않을까싶다.
게임은 어떤식으로 만들어야할까.
반대로말하면 어떤게임이 재밌을까.
게임의 구성은 스토리, 액션 그외는 잘 모르겠다.
그렇다면 우.선. 적으로 구현해야되는것은
바로 게임이다.
스토리야 뭐 적당히 true값에 console.log로 딸려서 사족을 붙이면될것같다..만.
액션..클라이언트부분..
개인적으로 생각하는 게임은
디펜스게임.
타워를 붙이지않는 디펜스게임에는
로그라이크형식으로 만들고 싶기도하다.
그렇다면 로그라이크형식으로 만들었을때
4인용게임에서

캐쉬를 어디에 저장해야할까
각자에게 할당해서
각자에게 아이템을 구매할수있도록하는게 좋을 것같다.
개개인의 통합캐쉬를 통합해서 보여주기에는 조금 힘들 것 같고,
캐쉬교환이 가능하면좋을 것 같다.
여기까진 게임부분이다.
그렇다면 주요기능들을 생각해보자
먼저 개개인을 분리시키려면 jwt토큰을 활용해서
회원가입 로그인 로그아웃 닉네임변경기능을 우선적으로 만들어야겠다.
로그인에 성공하면 메인화면이 나오고 메인화면에는 게임시작, 상점,케릭터 및 아이템 선택 정도가 있으면 될 것같다.
케릭터선택으로 케릭터를 장착하고 게임시작을누르면 room을 생성또는 서치를 했으면 좋겠다.
어몽어스처럼 고유의 방을 만들고 다른사람들이 그 방을 서치해서 들어 갈 수 있다면 좋을 것 같다.
게임이 우선이라고는 하지만 나는 서버개발자.
여기까지를 먼저 구현하고
서로 만났다는걸 인증하기위해 게임 시작으로 방을 생성해서 다른유저들이 들어오면 채팅부터 되는 시스템을 만들어야겠다.
즉 게임부분은 제쳐두고 회원가입,로그인,닉네임변경,회원탈퇴 부터 만들고 상점,tank,scv,Archer,힐러 에대한 DB등
시작부터 제작해줘 사용해야되는건 node.js,AWS EC2,RDS , 레디스, jwt토큰인증방식, JOI모듈을이용한 유효성검사,에러핸들러,케릭터별 능력치(Ex 체력,공격력,방어력,이동속도 등),채팅기능,상점기능,게임시작시 채팅기능
html파일로 클라이언트부분

monster 테이블생성도 해야겠다.
케릭터는 유저에 장착하는 형식으로 해야될 것 같다.
그리고 아이템은 user가 item 속성에 맞는 케릭터를 장착하고 있을 때
장착이 가능하게끔 조건을 짜야겠다.

게임부분은 만들지도 못했는데 베이직반 탈출은 불가능한것인가...?
dustmq폴더도 벌써 7호기까지 왔다.
알수없는 에러가 뜰때마다 그냥 초기화시켜버린 결과가
이젠 정신이 나가버릴것같다.
회귀를 7번한다고 나갈 정신이라면 회귀물은 보면 안될 것 같다.

머리속에 기획은 참 많은데
실행이안된다.

user에 레벨을 넣어서
로그라이크게임처럼
레벨에 따른 케릭터 기본스텟*레벨을 하면
적당히 적당할 것 같다.
몬스터도 스테이지*몬스터스텟을 하면 적당히 적당할 것 같다.

스텐다드반 10.17일자 듣고있는디
깃허브 이미 만들어진 폴더를 깃에 올릴수도있었다.
난...
내용물 복사한다음에 깃연동시킬떄 생성되는 폴더에 욺기는식으로햇는디...
기존제작파일폴더명 dino
dino폴더명을 dino2로 변경
깃헙데스크탑으로 클론할 떄 생기는 폴더이름을 dino로 생성
dino2에있던 파일들을 dino로 이식
이렇게 했었는데...

모듈설치 O
회원가입 로그인 등등 기능 O
유저 DB를 생성해보자 -뭐가필요할까?
userId
account
password
name
cashAmount
유저 플래이어 DB를 생성o
Id
userid

케릭터 DB를 생성해보자 -뭐가필요할까o
케릭터id?
케릭터name
체력,
공격력,
방어력
이동속도...?

아이템 DB를 생성해보자. -뭐가 필요
아이템ID
공격력
가격
무개...?
채팅기능을 구현해보자.
몬스터 DB를 만들어보자
스테이지도 DB가 필요할까?
게임기능을 만들어보자.
멀티가 되는지 테스트해보자?

케릭터가 아니라 역활 로 해야겠당.o

import readlineSync from 'readline-sync';
이건 로그라이크게임만들때 server.js파일에있던 모듈이다.
응답기? 그런역할을 하는것같다.
이걸 이용해서 질의응답형식의 퍼즐게임도 괜찮을 것 같다.
와씨
이걸 힌트라는 버튼을 눌러서 "나는 게임을 못합니다" 라고 입력하면
정답을 알려주는 버튼을 만들면 누를지 말지 정말 궁금하다

health: 150,
power: 50,
defence: 100,
speed: 20,

무기는. 어떤영향을 줘야될까
power
넉백

스킬개념.
1234에 단축기로 넣어보자.
