async function loadProfile() {
    try {
        const response = await fetch('/api/profile');
        if (response.ok) {
            const user = await response.json();
            
            // Заполняем поля просмотра
            document.getElementById('viewEmail').textContent = user.email || 'Не указан';
            document.getElementById('viewName').textContent = user.name || 'Не указано';
            document.getElementById('viewPhone').textContent = user.phone || 'Не указан';
            
            // Заполняем поля редактирования
            document.getElementById('email').value = user.email || '';
            document.getElementById('name').value = user.name || '';
            document.getElementById('phone').value = user.phone || '';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }

    loadTestHistory();
}

function enableEdit() {
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('profileEdit').style.display = 'block';
}

function cancelEdit() {
    loadProfile(); // Перезагружаем данные
    document.getElementById('profileView').style.display = 'block';
    document.getElementById('profileEdit').style.display = 'none';
    document.getElementById('message').style.display = 'none';
}

async function loadTestHistory() {
    try {
        const response = await fetch('/api/tests/history');
        if (response.ok) {
            const history = await response.json();
            const historyList = document.getElementById('historyList');
            
            if (history.length === 0) {
                historyList.innerHTML = '<p>История тестов пуста</p>';
                return;
            }

            historyList.innerHTML = '';
            
            // Проверяем localStorage для скрытых элементов
            const hiddenItems = JSON.parse(localStorage.getItem('hiddenHistoryItems') || '[]');
            
            history.forEach(item => {
                const historyItem = document.createElement('div');
                const isHidden = hiddenItems.includes(item.id);
                historyItem.className = isHidden ? 'history-item hidden' : 'history-item';
                historyItem.dataset.sessionId = item.id;
                
                const buttonClass = isHidden ? 'history-item-btn show-btn' : 'history-item-btn hide-btn';
                const buttonIcon = isHidden ? '👁️‍🗨️' : '👁️';
                const buttonTitle = isHidden ? 'Показать' : 'Скрыть';
                
                historyItem.innerHTML = `
                    <div class="history-item-content">
                        <div class="history-item-info">
                            <h4>${item.subject_name} - ${item.test_type_name}</h4>
                            <p>${new Date(item.completed_at).toLocaleString('ru-RU')}</p>
                        </div>
                        <div class="history-item-score">
                            ${item.score}/${item.total_questions} (${item.percentage.toFixed(1)}%)
                        </div>
                    </div>
                    <div class="history-item-actions">
                        <button class="${buttonClass}" onclick="toggleHistoryItem(${item.id}, this)" title="${buttonTitle}">
                            ${buttonIcon}
                        </button>
                        <button class="history-item-btn delete-btn" onclick="deleteHistoryItem(${item.id})" title="Удалить">
                            🗑️
                        </button>
                    </div>
                `;
                historyList.appendChild(historyItem);
            });
        }
    } catch (error) {
        console.error('Error loading test history:', error);
    }
}

function toggleHistoryItem(sessionId, button) {
    const historyItem = document.querySelector(`.history-item[data-session-id="${sessionId}"]`);
    if (!historyItem) return;

    const isHidden = historyItem.classList.contains('hidden');
    
    // Получаем список скрытых элементов из localStorage
    let hiddenItems = JSON.parse(localStorage.getItem('hiddenHistoryItems') || '[]');
    
    if (isHidden) {
        // Показать
        historyItem.classList.remove('hidden');
        button.innerHTML = '👁️';
        button.title = 'Скрыть';
        button.classList.remove('show-btn');
        button.classList.add('hide-btn');
        // Удаляем из списка скрытых
        hiddenItems = hiddenItems.filter(id => id !== sessionId);
    } else {
        // Скрыть
        historyItem.classList.add('hidden');
        button.innerHTML = '👁️‍🗨️';
        button.title = 'Показать';
        button.classList.remove('hide-btn');
        button.classList.add('show-btn');
        // Добавляем в список скрытых
        if (!hiddenItems.includes(sessionId)) {
            hiddenItems.push(sessionId);
        }
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('hiddenHistoryItems', JSON.stringify(hiddenItems));
}

async function deleteHistoryItem(sessionId) {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
        return;
    }

    try {
        const response = await fetch(`/api/tests/history/${sessionId}`, {
            method: 'DELETE',
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok) {
            const historyItem = document.querySelector(`.history-item[data-session-id="${sessionId}"]`);
            if (historyItem) {
                historyItem.remove();
                
                // Удаляем из localStorage, если была скрыта
                let hiddenItems = JSON.parse(localStorage.getItem('hiddenHistoryItems') || '[]');
                hiddenItems = hiddenItems.filter(id => id !== sessionId);
                localStorage.setItem('hiddenHistoryItems', JSON.stringify(hiddenItems));
                
                // Проверяем, остались ли еще записи
                const historyList = document.getElementById('historyList');
                const visibleItems = historyList.querySelectorAll('.history-item:not(.hidden)');
                if (visibleItems.length === 0 && historyList.children.length === 0) {
                    historyList.innerHTML = '<p>История тестов пуста</p>';
                }
            }
        } else {
            const errorMsg = result.error || `Ошибка при удалении записи (${response.status})`;
            console.error('Delete error:', response.status, result);
            alert(errorMsg);
        }
    } catch (error) {
        console.error('Error deleting history item:', error);
        alert('Ошибка соединения с сервером: ' + error.message);
    }
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById('message');

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;

    try {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, phone }),
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.textContent = 'Профиль успешно обновлен';
            messageDiv.className = 'message success';
            messageDiv.style.display = 'block';
            
            // Перезагружаем профиль и переключаемся в режим просмотра
            setTimeout(() => {
                loadProfile();
                document.getElementById('profileView').style.display = 'block';
                document.getElementById('profileEdit').style.display = 'none';
                messageDiv.style.display = 'none';
            }, 1500);
        } else {
            messageDiv.textContent = 'Ошибка при обновлении профиля';
            messageDiv.className = 'message error';
            messageDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        messageDiv.textContent = 'Ошибка соединения с сервером';
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
    }
});

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Загружаем профиль при загрузке страницы
loadProfile();
