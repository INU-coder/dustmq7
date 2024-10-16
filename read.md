10.15 (화)
모든 일의 시작.
시작이 반이니 벌써 반이나했다.
그리고 가만히있으면 반은 간다라는 말이 있다.
시작하고 가만히있으면 완성해버린것인가?
반의 반일수도있으니
나머지 25%일지도모르는 부분을 채우기 위해서 md파일을 작성하기로 했다.
우선은.
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
│ ├── index.html
│ ├── index.js
│ └── styles.css
├── prisma
│   └── schema.prisma
├── src // 서버 코드
│ ├── index.js
│ └── sign.js
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

게임부분은 만들지도 못했는데 베이직반 탈출은 불가능한것인가...?
dustmq폴더도 벌써 7호기까지 왔다.
알수없는 에러가 뜰때마다 그냥 초기화시켜버린 결과가
이젠 정신이 나가버릴것같다.
회귀를 7번한다고 나갈 정신이라면 회귀물은 보면 안될 것 같다.

머리속에 기획은 참 많은데
실행이안된다.
