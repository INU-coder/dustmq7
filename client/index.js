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
  const baseUrl = 'http://localhost:8080/auth'; // 백엔드 API 주소

  // 회원가입 요청
  document
    .getElementById('signupForm')
    .addEventListener('submit', async (event) => {
      event.preventDefault();

      // 입력값 로그 출력
      const id = document.getElementById('signup-id').value;
      const name = document.getElementById('signup-name').value;
      const password = document.getElementById('signup-password').value;
      console.log('Signup form data:', { id, name, password }); // 입력 데이터 로그 출력

      try {
        const response = await fetch(`${baseUrl}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, name, password }),
        });

        const result = await response.json();
        document.getElementById('signup-result').innerText = response.ok
          ? result.message
          : result.message || '오류가 발생했습니다.';
      } catch (error) {
        console.error('회원가입 중 오류:', error);
      }
    });

  // 로그인 요청
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
          document.getElementById('login-result').innerText = result.message;
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);
        } else {
          document.getElementById('login-result').innerText =
            result.message || '로그인에 실패했습니다.';
        }
      } catch (error) {
        console.error('로그인 중 오류:', error);
      }
    });

  // 닉네임 변경 요청
  document
    .getElementById('changeNameForm')
    .addEventListener('submit', async (event) => {
      event.preventDefault();
      const id = document.getElementById('change-id').value;
      const password = document.getElementById('change-password').value;
      const newName = document.getElementById('new-name').value;

      try {
        const response = await fetch(`${baseUrl}/changeName`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, password, newName }),
        });

        const result = await response.text();
        document.getElementById('changeName-result').innerText = result;
      } catch (error) {
        console.error('닉네임 변경 중 오류:', error);
      }
    });

  // 회원탈퇴 요청
  document
    .getElementById('signOutForm')
    .addEventListener('submit', async (event) => {
      event.preventDefault();
      const id = document.getElementById('delete-id').value;
      const password = document.getElementById('delete-password').value;

      try {
        const response = await fetch(`${baseUrl}/signOut`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, password }),
        });

        const result = await response.text();
        document.getElementById('signOut-result').innerText = result;
      } catch (error) {
        console.error('회원탈퇴 중 오류:', error);
      }
    });
});
