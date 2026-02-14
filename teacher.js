// ============================================
// teacher.js - ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ
// ============================================

let currentGameId = null;
let currentQuestionIndex = 0;
let playersListener = null;
let gameListener = null;
let answersListener = null;
let db = null;
let currentQuestionId = null;
let totalPlayersCount = 0;
let noobRequests = {
    translations: 0,
    wrongAnswers: 0
};

// Элементы DOM
let startSection, gameControls, gameCodeDisplay, playersList, playerCount;
let statsContent, questionsList, currentQ, presentationMode, mainInterface;
let presentationQNum, presentationQuestion, answeredCount, totalPlayers;
let correctCount, answeredCount2, noobTranslations, noobWrong;

// ИНИЦИАЛИЗАЦИЯ ПОСЛЕ ЗАГРУЗКИ
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Teacher panel initializing...");
    
    // Получаем ссылки на элементы DOM
    startSection = document.getElementById('startSection');
    gameControls = document.getElementById('gameControls');
    gameCodeDisplay = document.getElementById('gameCode');
    playersList = document.getElementById('playersList');
    playerCount = document.getElementById('playerCount');
    statsContent = document.getElementById('statsContent');
    questionsList = document.getElementById('questionsList');
    currentQ = document.getElementById('currentQ');
    
    // Элементы презентации
    mainInterface = document.getElementById('mainInterface');
    presentationMode = document.getElementById('presentationMode');
    presentationQNum = document.getElementById('presentationQNum');
    presentationQuestion = document.getElementById('presentationQuestion');
    
    // Элементы статистики
    answeredCount = document.getElementById('answeredCount');
    totalPlayers = document.getElementById('totalPlayers');
    correctCount = document.getElementById('correctCount');
    answeredCount2 = document.getElementById('answeredCount2');
    
    // Элементы статистики чайников
    noobTranslations = document.getElementById('noobTranslations');
    noobWrong = document.getElementById('noobWrong');
    
    // Проверяем Firebase
    if (typeof firebase !== 'undefined') {
        try {
            db = firebase.database();
            console.log("✅ Firebase подключен");
        } catch (error) {
            console.error("❌ Ошибка Firebase:", error);
        }
    } else {
        console.error("❌ Firebase не загружен!");
    }
    
    // Загружаем вопросы
    if (window.QUIZ_DATA) {
        console.log(`✅ Загружено ${QUIZ_DATA.questions.length} вопросов`);
        updateQuestionsList();
    } else {
        console.error("❌ QUIZ_DATA не найден!");
    }
});

// ============================================
// 🎮 ОСНОВНЫЕ ФУНКЦИИ
// ============================================

function startNewGame() {
    console.log("🎮 startNewGame вызвана!");
    
    if (!db) {
        showNotification("❌ Firebase не подключен! Обновите страницу.", "error");
        return;
    }
    
    // Генерируем 8-значный код
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    currentGameId = "game_" + code;
    currentQuestionIndex = 0;
    totalPlayersCount = 0;
    noobRequests = { translations: 0, wrongAnswers: 0 };
    
    console.log(`🎮 Создаю игру: ${currentGameId} с кодом ${code}`);
    
    // Обновляем UI
    if (startSection) startSection.style.display = 'none';
    if (gameControls) gameControls.style.display = 'block';
    if (gameCodeDisplay) gameCodeDisplay.textContent = code;
    if (currentQ) currentQ.textContent = '0/30';
    
    // Сбрасываем статистику чайников
    if (noobTranslations) noobTranslations.textContent = '0';
    if (noobWrong) noobWrong.textContent = '0';
    
    // Данные игры
    const gameData = {
        id: currentGameId,
        created: Date.now(),
        createdBy: 'teacher',
        status: "lobby",
        quizId: QUIZ_DATA ? QUIZ_DATA.id : "english_fears_phobias",
        currentQuestion: null,
        players: {},
        answers: {},
        settings: {
            timer: 45,
            autoShowResults: true,
            noobMode: true
        }
    };
    
    // Сохраняем в Firebase
    db.ref('games/' + currentGameId).set(gameData)
        .then(() => {
            console.log("✅ Игра создана в Firebase");
            showNotification(`🎮 Game created! Code: ${code}`, "success");
            
            // Начинаем слушать игроков
            listenToPlayers();
            
            // Обновляем список вопросов
            updateQuestionsList();
            
            // Слушаем изменения игры
            listenToGameChanges();
            
            // Слушаем запросы чайников
            listenToNoobRequests();
        })
        .catch(error => {
            console.error("❌ Ошибка создания игры:", error);
            showNotification("Error: " + error.message, "error");
        });
}

// ============================================
// 👥 СЛУШАТЬ ИГРОКОВ
// ============================================

function listenToPlayers() {
    if (!currentGameId || !db) return;
    
    console.log(`👥 Начинаю слушать игроков в ${currentGameId}`);
    
    // Убираем старый слушатель если есть
    if (playersListener) {
        db.ref(`games/${currentGameId}/players`).off('value', playersListener);
    }
    
    playersListener = db.ref(`games/${currentGameId}/players`).on('value', snapshot => {
        const players = snapshot.val() || {};
        const playerArray = Object.entries(players).map(([name, data]) => ({
            name,
            ...data
        }));
        
        if (playerCount) playerCount.textContent = playerArray.length;
        if (totalPlayers) totalPlayers.textContent = playerArray.length;
        totalPlayersCount = playerArray.length;
        
        updatePlayersList(playerArray);
    });
}

function updatePlayersList(players) {
    if (!playersList) return;
    
    if (players.length === 0) {
        playersList.innerHTML = '<div class="empty-state"><div class="empty-icon">👤</div><p>Players will appear here after joining</p></div>';
        return;
    }
    
    // Сортируем по очкам
    players.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    playersList.innerHTML = players.map((player, index) => `
        <div class="player-card">
            <div class="player-avatar">${player.name.charAt(0).toUpperCase()}</div>
            <div class="player-name">${player.name}</div>
            <div class="player-score">🎯 ${player.score || 0} pts</div>
            ${index === 0 ? '<div style="color: #FFD700; margin-top: 5px;">👑</div>' : ''}
        </div>
    `).join('');
}

// ============================================
// 📝 УПРАВЛЕНИЕ ВОПРОСАМИ
// ============================================

function startNextQuestion() {
    if (!currentGameId) {
        showNotification("Create a game first!", "warning");
        return;
    }
    
    if (!QUIZ_DATA || !QUIZ_DATA.questions) {
        showNotification("Questions not loaded!", "error");
        return;
    }
    
    const question = QUIZ_DATA.questions[currentQuestionIndex];
    if (!question) {
        showNotification("🎉 All questions completed!", "success");
        return;
    }
    
    console.log(`▶️ Запускаю вопрос ${currentQuestionIndex + 1}: ${question.id}`);
    
    // Сбрасываем статистику
    if (answeredCount) answeredCount.textContent = '0';
    if (correctCount) correctCount.textContent = '0';
    if (answeredCount2) answeredCount2.textContent = '0';
    
    // Получаем количество игроков
    db.ref(`games/${currentGameId}/players`).once('value').then(snapshot => {
        const players = snapshot.val() || {};
        totalPlayersCount = Object.keys(players).length;
        if (totalPlayers) totalPlayers.textContent = totalPlayersCount;
    });
    
    // Очищаем старые ответы
    db.ref(`games/${currentGameId}/answers/${question.id}`).remove();
    
    // Обновляем статус игры
    db.ref('games/' + currentGameId).update({
        status: "question_active",
        currentQuestion: question.id,
        questionStartTime: Date.now()
    }).then(() => {
        // Переключаем в режим презентации
        enterPresentationMode(question);
        
        // Начинаем следить за ответами
        startAnswerTracking(question.id);
        
        // Обновляем счётчик
        currentQuestionIndex++;
        if (currentQ) currentQ.textContent = currentQuestionIndex + '/30';
        
        // Обновляем список вопросов
        updateQuestionsList();
        
        console.log(`✅ Вопрос ${question.id} запущен`);
        showNotification(`Question ${currentQuestionIndex} started`, "info");
        
    }).catch(error => {
        console.error("❌ Ошибка запуска вопроса:", error);
        showNotification("Error: " + error.message, "error");
    });
}

function startAnswerTracking(questionId) {
    if (!currentGameId || !questionId || !db) return;
    
    currentQuestionId = questionId;
    
    // Отписываемся от предыдущего слушателя
    if (answersListener) {
        db.ref(`games/${currentGameId}/answers/${currentQuestionId}`).off('value', answersListener);
    }
    
    // Слушаем новые ответы
    answersListener = db.ref(`games/${currentGameId}/answers/${questionId}`).on('value', snapshot => {
        const answers = snapshot.val() || {};
        updateAnswerStats(answers);
    });
}

function updateAnswerStats(answers) {
    const totalAnswers = Object.keys(answers).length;
    let correctAnswers = 0;
    
    Object.values(answers).forEach(answer => {
        if (answer.isCorrect) {
            correctAnswers++;
        }
    });
    
    // Обновляем статистику
    if (answeredCount) answeredCount.textContent = totalAnswers;
    if (answeredCount2) answeredCount2.textContent = totalAnswers;
    if (correctCount) correctCount.textContent = correctAnswers;
    
    // Если все ответили, показываем уведомление
    if (totalPlayersCount > 0 && totalAnswers >= totalPlayersCount) {
        const percentage = Math.round((correctAnswers / totalAnswers) * 100);
        showNotification(`✅ All answered! Correct: ${percentage}%`, "success");
    }
    
    // Обновляем статистику в основном интерфейсе
    updateStatsDisplay(totalAnswers, correctAnswers, totalPlayersCount);
}

function updateStatsDisplay(total, correct, totalPlayers) {
    if (!statsContent) return;
    
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    statsContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <div style="color: #4facfe;">${total}/${totalPlayers}</div>
                <div>Answered</div>
            </div>
            <div class="stat-item">
                <div style="color: #43e97b;">${correct}</div>
                <div>Correct</div>
            </div>
            <div class="stat-item">
                <div style="color: #f093fb;">${percentage}%</div>
                <div>Success</div>
            </div>
        </div>
    `;
}

// ============================================
// 🖥️ РЕЖИМ ПРЕЗЕНТАЦИИ
// ============================================

function enterPresentationMode(question) {
    if (!mainInterface || !presentationMode || !presentationQuestion || !presentationQNum) return;
    
    // Скрываем основной интерфейс
    mainInterface.style.display = 'none';
    presentationMode.style.display = 'flex';
    presentationMode.classList.add('active');
    
    // Показываем вопрос
    if (presentationQNum) presentationQNum.textContent = currentQuestionIndex + 1;
    
    let questionHTML = `<h2>${question.text}</h2>`;
    
    // Если вопрос длинный, добавляем прокрутку
    if (question.text.length > 150) {
        questionHTML = `<div style="max-height: 500px; overflow-y: auto; padding-right: 20px;">
            <h2>${question.text}</h2>
        </div>`;
    }
    
    presentationQuestion.innerHTML = questionHTML;
}

function exitPresentation() {
    if (!mainInterface || !presentationMode) return;
    
    // Останавливаем слежение за ответами
    if (answersListener && currentQuestionId && db) {
        db.ref(`games/${currentGameId}/answers/${currentQuestionId}`).off('value', answersListener);
        answersListener = null;
    }
    
    // Возвращаемся к основному интерфейсу
    presentationMode.classList.remove('active');
    presentationMode.style.display = 'none';
    mainInterface.style.display = 'flex';
    
    // Обновляем статус игры
    if (currentGameId && db) {
        db.ref('games/' + currentGameId).update({
            status: "lobby"
        });
    }
}

function showAnswerPresentation() {
    if (!QUIZ_DATA || !QUIZ_DATA.questions) return;
    
    const question = QUIZ_DATA.questions[currentQuestionIndex - 1];
    if (!question || !presentationQuestion) return;
    
    // Получаем правильный ответ
    const correctAnswerText = question.options[question.correct];
    
    // Показываем правильный ответ
    presentationQuestion.innerHTML += `
        <div style="margin-top: 40px; padding: 30px; background: rgba(67,233,123,0.1); border-radius: 24px; border: 2px solid rgba(67,233,123,0.3);">
            <h3 style="color: #43e97b; margin-top: 0; font-size: 1.8rem; margin-bottom: 20px;">✅ CORRECT ANSWER:</h3>
            <div style="font-size: 2rem; color: white; margin: 20px 0; font-weight: 700; text-align: center; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 16px;">${correctAnswerText}</div>
            <div style="color: rgba(255,255,255,0.8); font-style: italic; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 1.1rem;">${question.explanation}</div>
        </div>
    `;
    
    // Переключаем статус
    if (currentGameId && db) {
        db.ref('games/' + currentGameId).update({
            status: "showing_results"
        });
    }
}

function showAnswer() {
    showAnswerPresentation();
}

function nextQuestion() {
    exitPresentation();
}

// ============================================
// 🔄 СБРОС ИГРЫ
// ============================================

function resetGame() {
    if (!confirm("Delete current game and start over?")) return;
    
    if (currentGameId && db) {
        db.ref('games/' + currentGameId).remove();
    }
    
    // Останавливаем все слушатели
    if (answersListener && currentQuestionId && db) {
        db.ref(`games/${currentGameId}/answers/${currentQuestionId}`).off('value', answersListener);
    }
    
    // Сбрасываем всё
    currentGameId = null;
    currentQuestionIndex = 0;
    totalPlayersCount = 0;
    noobRequests = { translations: 0, wrongAnswers: 0 };
    
    if (startSection) startSection.style.display = 'block';
    if (gameControls) gameControls.style.display = 'none';
    if (gameCodeDisplay) gameCodeDisplay.textContent = '----';
    if (playersList) {
        playersList.innerHTML = '<div class="empty-state"><div class="empty-icon">👤</div><p>Players will appear here after joining</p></div>';
    }
    if (playerCount) playerCount.textContent = '0';
    if (statsContent) {
        statsContent.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>Statistics will appear after answers</p></div>';
    }
    if (currentQ) currentQ.textContent = '0/30';
    if (noobTranslations) noobTranslations.textContent = '0';
    if (noobWrong) noobWrong.textContent = '0';
    
    // Отписываемся от слушателей
    if (playersListener && db && currentGameId) {
        db.ref(`games/${currentGameId}/players`).off('value', playersListener);
    }
    if (gameListener && db && currentGameId) {
        db.ref(`games/${currentGameId}`).off('value', gameListener);
    }
    
    showNotification("Game reset", "info");
}

// ============================================
// 📋 СПИСОК ВОПРОСОВ
// ============================================

function updateQuestionsList() {
    if (!questionsList || !QUIZ_DATA || !QUIZ_DATA.questions) return;
    
    questionsList.innerHTML = QUIZ_DATA.questions.map((q, index) => {
        const isCurrent = index === currentQuestionIndex - 1;
        const isCompleted = index < currentQuestionIndex - 1;
        
        let statusClass = '';
        if (isCurrent) statusClass = 'active';
        else if (isCompleted) statusClass = 'completed';
        
        let difficultyColor = '';
        if (q.difficulty === 'easy') difficultyColor = '#43e97b';
        else if (q.difficulty === 'medium') difficultyColor = '#f093fb';
        else difficultyColor = '#ff416c';
        
        return `
            <div class="question-item ${statusClass}" onclick="selectQuestion(${index})">
                <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 5px;">${index + 1}</div>
                <div style="font-size: 0.7rem; color: ${difficultyColor}; text-transform: uppercase;">${q.difficulty}</div>
                <div style="font-size: 0.7rem; color: rgba(255,255,255,0.5); margin-top: 5px;">
                    ${isCurrent ? '🔴 CURRENT' : isCompleted ? '✅ DONE' : '⏳'}
                </div>
            </div>
        `;
    }).join('');
}

function selectQuestion(index) {
    if (!QUIZ_DATA || !QUIZ_DATA.questions[index]) return;
    
    currentQuestionIndex = index;
    startNextQuestion();
}

// ============================================
// 🔍 СЛУШАТЬ ИЗМЕНЕНИЯ ИГРЫ
// ============================================

function listenToGameChanges() {
    if (!currentGameId || !db) return;
    
    if (gameListener) {
        db.ref(`games/${currentGameId}`).off('value', gameListener);
    }
    
    gameListener = db.ref(`games/${currentGameId}`).on('value', snapshot => {
        const game = snapshot.val();
        if (!game) return;
        
        // Можно обновить статус в заголовке
        console.log("📊 Статус игры:", game.status);
    });
}

// ============================================
// 🤓 СЛУШАТЬ ЗАПРОСЫ ЧАЙНИКОВ
// ============================================

function listenToNoobRequests() {
    if (!currentGameId || !db) return;
    
    db.ref(`noob_requests/${currentGameId}`).on('child_added', snapshot => {
        const request = snapshot.val();
        
        if (request.type === 'translation') {
            noobRequests.translations++;
            if (noobTranslations) noobTranslations.textContent = noobRequests.translations;
            
            // Отправляем в Telegram
            if (window.TELEGRAM_CONFIG) {
                TELEGRAM_CONFIG.sendModerationMessage(
                    request.playerName,
                    'translation',
                    request.questionData
                );
            }
        }
        
        if (request.type === 'wrong_answer') {
            noobRequests.wrongAnswers++;
            if (noobWrong) noobWrong.textContent = noobRequests.wrongAnswers;
            
            if (window.TELEGRAM_CONFIG) {
                TELEGRAM_CONFIG.sendModerationMessage(
                    request.playerName,
                    'wrong_answer',
                    request.questionData
                );
            }
        }
        
        // Удаляем обработанный запрос
        snapshot.ref.remove();
    });
}

// ============================================
// 🔔 УВЕДОМЛЕНИЯ
// ============================================

function showNotification(message, type = "info") {
    const colors = {
        success: '#43e97b',
        error: '#ff416c',
        warning: '#f093fb',
        info: '#4facfe'
    };
    
    const icon = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(30px);
        border: 1px solid ${colors[type]}40;
        border-left: 4px solid ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 16px;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.4s ease;
        box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 350px;
    `;
    notification.innerHTML = `
        <span style="font-size: 1.3rem;">${icon[type]}</span>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 400);
    }, 3000);
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ============================================
// 📤 ЭКСПОРТ ФУНКЦИЙ
// ============================================

// Делаем функции доступными глобально
window.startNewGame = startNewGame;
window.startNextQuestion = startNextQuestion;
window.showAnswer = showAnswer;
window.nextQuestion = nextQuestion;
window.resetGame = resetGame;
window.exitPresentation = exitPresentation;
window.showAnswerPresentation = showAnswerPresentation;
window.selectQuestion = selectQuestion;
