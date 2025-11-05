const pathParts = window.location.pathname.split('/');
const subjectId = pathParts[2];
const testTypeId = pathParts[3];

let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let questionStates = {}; // 'unanswered', 'correct', 'incorrect'

async function loadQuestions() {
    try {
        const response = await fetch(`/api/subjects/${subjectId}/test-types/${testTypeId}/questions`);
        questions = await response.json();
        
        console.log('Loaded questions:', questions); // Debug

        if (!questions || questions.length === 0) {
            alert('Вопросы не найдены');
            return;
        }

        // Инициализируем состояния вопросов
        questions.forEach((q, index) => {
            questionStates[index] = 'unanswered';
        });

        // Создаем индикаторы вопросов
        createQuestionIndicators();
        
        // Показываем первый вопрос
        showQuestion(0);
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Ошибка при загрузке вопросов');
    }
}

function createQuestionIndicators() {
    const indicator = document.getElementById('questionsIndicator');
    indicator.innerHTML = '';

    questions.forEach((q, index) => {
        const dot = document.createElement('div');
        dot.className = 'question-indicator';
        dot.textContent = index + 1;
        dot.id = `indicator-${index}`;
        dot.onclick = () => showQuestion(index);
        dot.style.cursor = 'pointer';
        indicator.appendChild(dot);
    });
}

function showQuestion(index) {
    if (index < 0 || index >= questions.length) {
        return;
    }

    currentQuestionIndex = index;
    const question = questions[index];

    // Обновляем индикаторы
    updateIndicators();

    // Показываем вопрос
    document.getElementById('questionText').textContent = `${index + 1}. ${question.text}`;

    const answersList = document.getElementById('answersList');
    answersList.innerHTML = '';

    if (!question.answers || question.answers.length === 0) {
        answersList.innerHTML = '<p>Ответы не найдены</p>';
        return;
    }

    const currentState = questionStates[index];
    const selectedAnswerId = userAnswers[question.id];

    question.answers.forEach(answer => {
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-item';
        answerItem.dataset.answerId = answer.id;
        
        if (currentState !== 'unanswered') {
            answerItem.classList.add('disabled');
            
            // Правильный ответ всегда зеленый
            if (answer.is_correct) {
                answerItem.classList.add('correct');
            }
            
            // Неправильный выбранный ответ - красный
            if (selectedAnswerId === answer.id && !answer.is_correct) {
                answerItem.classList.add('incorrect');
            }
        } else {
            // Если еще не отвечено, можно выбрать
            answerItem.onclick = () => selectAnswer(question.id, answer.id, answer.is_correct);
        }
        
        answerItem.textContent = answer.text;
        answersList.appendChild(answerItem);
    });

    // Показываем/скрываем кнопки навигации
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const finishBtn = document.getElementById('finishBtn');

    // Кнопка "Предыдущий"
    if (index > 0) {
        prevBtn.style.display = 'inline-block';
    } else {
        prevBtn.style.display = 'none';
    }

    // Кнопки "Следующий" / "Завершить"
    if (currentState !== 'unanswered') {
        if (index < questions.length - 1) {
            nextBtn.style.display = 'inline-block';
            finishBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'none';
            finishBtn.style.display = 'inline-block';
        }
    } else {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'none';
    }
}

function selectAnswer(questionId, answerId, isCorrect) {
    const currentState = questionStates[currentQuestionIndex];
    if (currentState !== 'unanswered') {
        return; // Уже отвечен
    }

    userAnswers[questionId] = answerId;
    questionStates[currentQuestionIndex] = isCorrect ? 'correct' : 'incorrect';

    // Обновляем визуальное отображение ответов
    const answersList = document.getElementById('answersList');
    const items = answersList.querySelectorAll('.answer-item');
    
    items.forEach((item) => {
        const answerIdFromItem = parseInt(item.dataset.answerId);
        item.classList.add('disabled');
        item.onclick = null; // Убираем возможность выбора
        
        const answer = questions[currentQuestionIndex].answers.find(a => a.id === answerIdFromItem);
        if (answer) {
            // Правильный ответ - зеленый
            if (answer.is_correct) {
                item.classList.add('correct');
            }
            
            // Неправильный выбранный ответ - красный
            if (answerIdFromItem === answerId && !isCorrect) {
                item.classList.add('incorrect');
            }
        }
    });

    // Показываем кнопки навигации
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');

    if (currentQuestionIndex < questions.length - 1) {
        nextBtn.style.display = 'inline-block';
    } else {
        finishBtn.style.display = 'inline-block';
    }

    // Обновляем индикаторы
    updateIndicators();
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
    }
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
    }
}

function updateIndicators() {
    questions.forEach((q, index) => {
        const indicator = document.getElementById(`indicator-${index}`);
        if (!indicator) return;
        
        indicator.classList.remove('current', 'correct', 'incorrect');
        
        if (index === currentQuestionIndex) {
            indicator.classList.add('current');
        } else if (questionStates[index] === 'correct') {
            indicator.classList.add('correct');
        } else if (questionStates[index] === 'incorrect') {
            indicator.classList.add('incorrect');
        }
    });
}

async function finishTest() {
    // Проверяем, все ли вопросы отвечены
    const unanswered = Object.values(questionStates).filter(state => state === 'unanswered');
    if (unanswered.length > 0) {
        if (!confirm('Не все вопросы отвечены. Завершить тест?')) {
            return;
        }
    }

    // Подсчитываем правильные ответы на клиенте
    let score = 0;
    let totalQuestions = questions.length;
    
    Object.values(questionStates).forEach(state => {
        if (state === 'correct') {
            score++;
        }
    });

    // Формируем массив ответов для отправки на сервер
    const answers = [];
    questions.forEach((question, index) => {
        if (userAnswers[question.id]) {
            // Используем индекс вопроса для уникальности (так как все вопросы имеют одинаковый ID)
            answers.push({
                question_id: question.id,
                answer_id: userAnswers[question.id]
            });
        }
    });

    try {
        const response = await fetch('/api/tests/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject_id: parseInt(subjectId),
                test_type_id: parseInt(testTypeId),
                answers: answers
            }),
        });

        const result = await response.json();

        if (response.ok) {
            // Используем подсчет на клиенте для правильного результата
            const percentage = (score / totalQuestions) * 100;
            
            // Показываем результат
            document.getElementById('questionContainer').style.display = 'none';
            document.getElementById('resultContainer').style.display = 'block';
            document.getElementById('resultScore').textContent = score;
            document.getElementById('resultTotal').textContent = totalQuestions;
            
            // Обновляем круговой прогресс-бар
            updateCircularProgress(percentage);
        } else {
            alert('Ошибка при сохранении результата');
        }
    } catch (error) {
        console.error('Error submitting test:', error);
        alert('Ошибка соединения с сервером');
    }
}

function updateCircularProgress(percentage) {
    const circle = document.querySelector('.progress-circle');
    const percentageText = document.getElementById('circularPercentage');
    
    if (circle && percentageText) {
        const circumference = 2 * Math.PI * 90; // radius = 90 (соответствует r="90" в SVG)
        const offset = circumference - (percentage / 100) * circumference;
        
        // Устанавливаем начальное значение для анимации
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference;
        
        // Небольшая задержка для запуска анимации
        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
            percentageText.textContent = percentage.toFixed(1);
        }, 100);
    }
}

// Загружаем вопросы при загрузке страницы
loadQuestions();
