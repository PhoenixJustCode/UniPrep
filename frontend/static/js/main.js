async function checkAuth() {
    try {
        const response = await fetch('/api/profile');
        if (response.ok) {
            const user = await response.json();
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('userSection').style.display = 'block';
            // Приоритет имени над email
            const displayName = user.name || user.email || 'Пользователь';
            document.getElementById('userEmail').textContent = displayName;
        }
    } catch (error) {
        // Не авторизован
    }
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Проверяем авторизацию при загрузке страницы
checkAuth();
