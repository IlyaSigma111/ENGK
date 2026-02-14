// ============================================
// student-simple.js - С РЕЖИМОМ ДЛЯ ЧАЙНИКОВ
// ============================================

let currentGameId = null;
let playerName = null;
let currentQuestion = null;
let hasAnswered = false;
let db = null;
let noobRequests = 0; // Счётчик запросов от чайника

// Элементы DOM
const joinScreen = document.getElementById('joinScreen');
const waitingScreen = document.getElementById('waitingScreen');
const questionScreen = document.getElementById('questionScreen');
const resultScreen = document.getElementById('resultScreen');
const joinButton = document.getElementById('joinButton');
const errorContainer = document.getElementById('errorContainer');
const notificationContainer = document.getElementById('notificationContainer');

// ПОКАЗАТЬ УВЕДОМЛЕНИЕ
function showNotification(message, type = 'info') {
    const colors = {
        info: '#4facfe',
        success: '#43e97b',
        error: '#ff416c',
        warning: '#f093fb'
    };
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.borderLeftColor = colors[type];
    notification.innerHTML = message;
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.4s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }, 3000);
}

// ПОКАЗАТЬ ОШИБКУ
function showError(message) {
    errorContainer.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-triangle"></i> ${message}
        </div>
    `;
    setTimeout(() => { errorContainer.innerHTML = ''; }, 5000);
}

// ПЕРЕКЛЮЧИТЬ ЭКРАН
function switchScreen(screenName) {
    [joinScreen, waitingScreen, questionScreen, resultScreen].forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenName + 'Screen').classList.add('active');
}

// ============================================
// 🤓 РЕЖИМ ДЛЯ ЧАЙНИКОВ
// ============================================

function requestTranslation() {
    if (!playerName || !currentGameId) {
        showNotification("❌ Join the game first!", "error");
        return;
    }
    
    if (!currentQuestion) {
        showNotification("❌ No active question!", "error");
        return;
    }
    
    noobRequests++;
    
    // Отправить запрос в Telegram
    if (window.TELEGRAM_CONFIG) {
        TELEGRAM_CONFIG.sendModerationMessage(playerName, 'translation', currentQuestion);
    }
    
    showNotification("🌐 Translation requested! Waiting for moderator...", "warning");
    
    // Локально показываем перевод (временный)
    const translatedText = translateQuestion(currentQuestion.text);
    showNotification(`📝 Translation: ${translatedText}`, "info");
}

function translateQuestion(text) {
    // Простой словарь для перевода (можно расширить)
    const translations = {
        "How do you translate the word 'fear' into Russian?": "Как переводится слово 'fear' на русский?",
        "What does the word 'spider' mean in Russian?": "Что означает слово 'spider' по-русски?",
        "How do you say 'тьма' in English?": "Как сказать 'тьма' по-английски?",
        "What is the English word for 'высота'?": "Какое английское слово для 'высота'?",
        "How do you translate 'толпа' into English?": "Как перевести 'толпа' на английский?",
        "What does 'snake' mean in Russian?": "Что значит 'snake' по-русски?",
        "How do you say 'полёт' in English?": "Как сказать 'полёт' по-английски?",
        "What is the English for 'публичная речь'?": "Как будет 'публичная речь' по-английски?",
        "How do you translate 'буря' into English?": "Как перевести 'буря' на английский?",
        "What does 'alone' mean in Russian?": "Что значит 'alone' по-русски?"
    };
    
    return translations[text] || "Translation not available";
}

// ============================================
// ОСНОВНЫЕ ФУНКЦИИ
// ============================================

function joinGame() {
    const name = document.getElementById('playerName').value.trim();
    const code = document.getElementById('gameCode').value.trim();
    
    if (!name || name.length < 2) {
        showError("Enter your name (min 2 characters)");
        return;
    }
    
    if (!code || code.length !== 8 || !/^\d+$/.test(code)) {
        showError("Enter 8-digit game code");
        return;
    }
    
    // Проверяем Firebase
    if (typeof firebase === 'undefined') {
        showError("Firebase not loaded. Refresh page.");
        return;
    }
    
    try {
        db = firebase.database();
    } catch (error) {
        showError("Database connection error");
        return;
    }
    
    playerName = name;
    currentGameId = "game_" + code;
    
    joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CONNECTING...';
    joinButton.disabled = true;
    
    // Проверяем существование игры
    db.ref(`games/${currentGameId}`).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                throw new Error(`Game with code ${code} not found!`);
            }
            
            const game = snapshot.val();
            
            if (game.status === "finished") {
                throw new Error("This game is already finished");
            }
            
            // Проверяем уникальность имени
            if (game.players && game.players[name]) {
                throw new Error("Player with this name already exists!");
            }
            
            // Регистрируем игрока
            return db.ref(`games/${currentGameId}/players/${name}`).set({
                name: name,
                joined: Date.now(),
                score: 0,
                noobRequests: 0,
                device: /Mobi|Android/i.test(navigator.userAgent) ? "📱 Phone" : "💻 Computer"
            });
        })
        .then(() => {
            console.log("✅ Connected to game:", currentGameId);
            
            // Обновляем отображение
            document.getElementById('displayName').textContent = name;
            document.getElementById('displayCode').textContent = code;
            
            switchScreen('waiting');
            
            // Слушаем игру
            listenToGame();
            listenToNotifications(); // Слушаем уведомления от модератора
            
            joinButton.innerHTML = '<i class="fas fa-gamepad"></i> JOIN GAME';
            joinButton.disabled = false;
        })
        .catch(error => {
            showError(error.message);
            joinButton.innerHTML = '<i class="fas fa-gamepad"></i> JOIN GAME';
            joinButton.disabled = false;
        });
}

// СЛУШАТЬ УВЕДОМЛЕНИЯ ОТ МОДЕРАТОРА
function listenToNotifications() {
    if (!playerName || !db) return;
    
    db.ref(`notifications/${playerName}`).on('child_added', snapshot => {
        const notification = snapshot.val();
        showNotification(notification.message, notification.message.includes('✅') ? 'success' : 'warning');
        
        // Удаляем прочитанное уведомление
        setTimeout(() => {
            snapshot.ref.remove();
        }, 5000);
    });
}

// СЛУШАТЬ ИГРУ
function listenToGame() {
    if (!currentGameId || !db) return;
    
    db.ref(`games/${currentGameId}`).on('value', snapshot => {
        const game = snapshot.val();
        if (!game) {
            console.log("Game deleted");
            leaveGame();
            return;
        }
        
        // Обновляем количество игроков
        const players = game.players || {};
        document.getElementById('roomPlayers').textContent = Object.keys(players).length;
        
        // Обновляем счет
        if (players[playerName]) {
            document.getElementById('displayScore').textContent = players[playerName].score || 0;
        }
        
        // Получаем вопрос с перемешанными вариантами
        const currentQuestionId = game.currentQuestion;
        
        switch (game.status) {
            case "lobby":
            case "waiting":
                break;
                
            case "question_active":
                if (currentQuestionId && (!currentQuestion || currentQuestion.id !== currentQuestionId)) {
                    handleQuestion(currentQuestionId);
                }
                break;
                
            case "showing_results":
                if (currentQuestionId && !hasAnswered) {
                    hasAnswered = false;
                }
                showResults(currentQuestionId);
                break;
        }
    });
}

// ОБРАБОТАТЬ ВОПРОС
function handleQuestion(questionId) {
    // Используем getShuffledQuestion для перемешивания вариантов
    if (window.QUIZ_DATA && window.QUIZ_DATA.getShuffledQuestion) {
        const allQuestions = QUIZ_DATA.questions;
        const questionIndex = allQuestions.findIndex(q => q.id === questionId);
        if (questionIndex !== -1) {
            currentQuestion = QUIZ_DATA.getShuffledQuestion(questionIndex);
        }
    } else {
        // Fallback если функция не работает
        currentQuestion = QUIZ_DATA.questions.find(q => q.id === questionId);
    }
    
    if (!currentQuestion) return;
    
    hasAnswered = false;
    
    switchScreen('question');
    document.getElementById('currentQ').textContent = currentQuestion.id;
    document.getElementById('questionText').textContent = currentQuestion.text;
    
    document.getElementById('answerStatus').textContent = "Choose an answer";
    document.getElementById('answerStatus').className = "status";
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    currentQuestion.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.innerHTML = `
            <div class="option-letter">${String.fromCharCode(65 + index)}</div>
            <div>${option}</div>
        `;
        
        optionDiv.onclick = () => selectAnswer(index);
        optionsContainer.appendChild(optionDiv);
    });
}

// ВЫБРАТЬ ОТВЕТ
function selectAnswer(answerIndex) {
    if (hasAnswered || !currentQuestion || !currentGameId || !playerName || !db) return;
    
    hasAnswered = true;
    
    document.querySelectorAll('.option').forEach((opt, idx) => {
        opt.classList.remove('selected');
        if (idx === answerIndex) {
            opt.classList.add('selected');
        }
    });
    
    const isCorrect = (answerIndex === currentQuestion.correct);
    
    // Если ответ неправильный - отправляем уведомление модератору
    if (!isCorrect && window.TELEGRAM_CONFIG) {
        TELEGRAM_CONFIG.sendModerationMessage(playerName, 'wrong_answer', {
            id: currentQuestion.id,
            text: currentQuestion.text,
            selectedOption: currentQuestion.options[answerIndex],
            correctOption: currentQuestion.options[currentQuestion.correct]
        });
    }
    
    db.ref(`games/${currentGameId}/answers/${currentQuestion.id}/${playerName}`).set({
        answerIndex: answerIndex,
        isCorrect: isCorrect,
        timestamp: Date.now()
    }).then(() => {
        if (isCorrect) {
            db.ref(`games/${currentGameId}/players/${playerName}/score`).transaction(score => {
                return (score || 0) + (currentQuestion.points || 1);
            });
        }
        
        const status = document.getElementById('answerStatus');
        status.textContent = isCorrect ? "✅ CORRECT!" : "❌ WRONG";
        status.className = isCorrect ? "status correct" : "status wrong";
    }).catch(error => {
        console.error("Error sending answer:", error);
    });
}

// ПОКАЗАТЬ РЕЗУЛЬТАТЫ
function showResults(questionId) {
    const question = QUIZ_DATA.questions.find(q => q.id === questionId);
    if (!question) return;
    
    switchScreen('result');
    
    db.ref(`games/${currentGameId}/answers/${questionId}`).once('value')
        .then(snapshot => {
            const answers = snapshot.val() || {};
            const playerAnswer = answers[playerName];
            
            let resultHTML = '';
            
            if (playerAnswer) {
                const isCorrect = playerAnswer.isCorrect;
                const points = isCorrect ? question.points || 1 : 0;
                
                resultHTML = `
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">
                            ${isCorrect ? '✅' : '❌'}
                        </div>
                        <div style="color: ${isCorrect ? '#43e97b' : '#ff416c'}; font-size: 1.3rem; margin-bottom: 10px;">
                            ${isCorrect ? 'CORRECT!' : 'WRONG!'}
                        </div>
                        <div style="font-size: 1.1rem; margin-bottom: 15px;">
                            ${points} ${points === 1 ? 'point' : 'points'}
                        </div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; margin-top: 15px;">
                        <div style="color: #4facfe; margin-bottom: 10px;">📝 Explanation:</div>
                        <div>${question.explanation}</div>
                    </div>
                `;
            } else {
                resultHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 15px;">⏰</div>
                        <div style="color: rgba(255,255,255,0.6);">You didn't answer this question in time</div>
                    </div>
                `;
            }
            
            document.getElementById('resultContent').innerHTML = resultHTML;
        });
}

// ВЫЙТИ ИЗ ИГРЫ
function leaveGame() {
    if (currentGameId && playerName && db) {
        db.ref(`games/${currentGameId}/players/${playerName}`).remove();
    }
    
    currentGameId = null;
    playerName = null;
    currentQuestion = null;
    hasAnswered = false;
    noobRequests = 0;
    
    document.getElementById('playerName').value = '';
    document.getElementById('gameCode').value = '';
    
    switchScreen('join');
}

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Student page loaded with Noob Mode!");
    
    setTimeout(() => {
        document.getElementById('playerName').focus();
    }, 300);
    
    joinButton.addEventListener('click', joinGame);
    
    document.getElementById('playerName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('gameCode').focus();
        }
    });
    
    document.getElementById('gameCode').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            joinGame();
        }
    });
    
    document.getElementById('gameCode').addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').substring(0, 8);
    });
});

// Экспортируем функции
window.joinGame = joinGame;
window.leaveGame = leaveGame;
window.selectAnswer = selectAnswer;
window.requestTranslation = requestTranslation;
