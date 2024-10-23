// 다크 모드 토글 기능
const toggleButton = document.querySelector('.toggle-theme');
const body = document.body;

toggleButton.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  toggleButton.textContent = body.classList.contains('dark-mode')
    ? '라이트 모드로 전환'
    : '다크 모드로 전환';
});

document.addEventListener('DOMContentLoaded', () => {
  const baseUrl = 'http://localhost:8080/auth'; // 인증 관련 API 경로
  const gameUrl = 'http://localhost:8080/player'; // 플레이어 API 경로

  // 회원가입 요청
  document
    .getElementById('signupForm')
    .addEventListener('submit', async (event) => {
      event.preventDefault();
      const id = document.getElementById('signup-id').value;
      const name = document.getElementById('signup-name').value;
      const password = document.getElementById('signup-password').value;

      try {
        const response = await fetch(`${baseUrl}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, name, password }),
        });

        const result = await response.json();
        document.getElementById('signup-result').innerText = result.message;
      } catch (error) {
        console.error('회원가입 중 오류:', error);
      }
    });

  // 로그인 요청 후 플레이어 정보를 가져올 때 playerId 저장
  document
    .getElementById('loginForm')
    .addEventListener('submit', async (event) => {
      event.preventDefault();
      const id = document.getElementById('login-id').value;
      const password = document.getElementById('login-password').value;

      try {
        const response = await fetch(`${baseUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, password }),
        });

        const result = await response.json();
        if (response.ok) {
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);
          localStorage.setItem('userId', result.user.id); // 유저 ID 저장

          // playerId는 로그인 후 별도로 받아올 수 있으므로 이후 API 호출에서 처리
          showGameSections(result.user.name, result.user.cash);
        } else {
          document.getElementById('login-result').innerText =
            result.message || '로그인에 실패했습니다.';
        }
      } catch (error) {
        console.error('로그인 중 오류:', error);
      }
    });

  // 캐릭터 선택
  document.querySelectorAll('.character-btn').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const characterId = event.target.getAttribute('data-character-id');
      const characterName = event.target.getAttribute('data-character-name');
      const characterImage = event.target.getAttribute('data-character-image');
      const userId = localStorage.getItem('userId'); // 로그인 후 저장된 사용자 ID

      try {
        const response = await fetch(`${gameUrl}/equip`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, characterId }),
        });

        if (!response.ok) {
          throw new Error('캐릭터 선택 실패');
        }

        const result = await response.json();
        document.getElementById('character-selection-result').innerText =
          '캐릭터 선택 성공!';

        // 선택한 캐릭터 정보 업데이트
        updateEquippedCharacter(characterName, characterImage);
      } catch (error) {
        console.error('캐릭터 선택 중 오류:', error);
        document.getElementById('character-selection-result').innerText =
          '캐릭터 선택 중 오류가 발생했습니다.';
      }
    });
  });

  // 아이템 선택 시 플레이어에게 아이템 장착 요청
  document.querySelectorAll('.item-btn').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const itemId = event.target.getAttribute('data-item-id');
      const playerId = localStorage.getItem('playerId'); // playerId 가져오기

      if (!playerId || isNaN(playerId)) {
        console.error('플레이어 ID가 설정되지 않았습니다.');
        return;
      }

      try {
        const response = await fetch(`${gameUrl}/equipItem`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, itemId }), // playerId와 itemId 전송
        });

        if (!response.ok) {
          throw new Error('아이템 장착 실패');
        }

        const result = await response.json();

        // 서버 응답 결과를 확인하고 콘솔에 출력
        if (result.success) {
          console.log(
            `아이템 ID ${itemId}이(가) 플레이어 ID ${playerId}에 성공적으로 장착되었습니다.`
          );
          document.getElementById('item-selection-result').innerText =
            '아이템 장착 성공!';
        } else {
          console.error('아이템 장착 실패:', result.message);
          document.getElementById('item-selection-result').innerText =
            '아이템 장착 실패!';
        }
      } catch (error) {
        console.error('아이템 장착 중 오류:', error.message);
        document.getElementById('item-selection-result').innerText =
          '아이템 장착 중 오류가 발생했습니다.';
      }
    });
  });

  // 캐릭터 정보 업데이트 함수
  function updateEquippedCharacter(name, imageSrc) {
    document.getElementById('equipped-character-name').innerText = name;
    document.getElementById('equipped-character-image').src =
      `./png/${imageSrc}`;
  }

  // 게임 섹션을 보여주는 함수
  function showGameSections(playerName, playerCash) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('game-section').style.display = 'block';
    document.getElementById('player-name').innerText = playerName;
    document.getElementById('player-cash').innerText = playerCash;
  }

  // 인벤토리 보기 버튼 기능 추가
  document
    .getElementById('inventory-btn')
    .addEventListener('click', async () => {
      const userId = localStorage.getItem('userId'); // 로그인 후 저장된 사용자 ID

      try {
        const response = await fetch(`${gameUrl}/inventory/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();
        const inventoryList = document.getElementById('inventory-list');
        inventoryList.innerHTML = ''; // 기존 인벤토리 리스트 초기화

        result.items.forEach((item) => {
          const listItem = document.createElement('li');
          listItem.textContent = `아이템: ${item.name}, 타입: ${item.type}`;
          inventoryList.appendChild(listItem);
        });
      } catch (error) {
        console.error('인벤토리 불러오기 오류:', error);
      }
    });
});
