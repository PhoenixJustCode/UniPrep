const isLoginPage = window.location.pathname === '/login';

const form = document.getElementById(isLoginPage ? 'loginForm' : 'registerForm');
const errorDiv = document.getElementById('error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const endpoint = isLoginPage ? '/api/login' : '/api/register';
    const data = isLoginPage ? { email, password } : { 
        email, 
        password, 
        name: document.getElementById('name').value 
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            // Успешная аутентификация
            if (isLoginPage) {
                window.location.href = '/tests';
            } else {
                window.location.href = '/profile';
            }
        } else {
            errorDiv.textContent = result.error || 'Произошла ошибка';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'Ошибка соединения с сервером';
        errorDiv.style.display = 'block';
    }
});
