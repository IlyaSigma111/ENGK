// ============================================
// teacher.js - ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ
// ============================================

console.log("🔥 teacher.js загружается...");
console.log("📊 Проверка глобальных переменных при загрузке:");
console.log("   window.db =", window.db);
console.log("   window.QUIZ_DATA =", window.QUIZ_DATA ? "✅ есть" : "❌ нет");

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
    
    // ✅ ВАЖНО: Берём db из глобальной переменной
    if (window.db) {
        db = window.db;
        console.log("✅ db получена из window.db");
    } else {
        console.error("❌ window.db не определена! Firebase не инициализирован");
        console.log("   Ждём 500ms и пробуем снова...");
        
        // Пробуем ещё раз через полсекунды
        setTimeout(function() {
            if (window.db) {
                db = window.db;
                console.log("✅ db получена после ожидания");
            } else {
                console.error("❌ window.db всё ещё undefined!");
            }
        }, 500);
    }
    
    console.log("📊 Проверка Firebase:", db ? '✅ Есть' : '❌ Нет');
    console.log("📊 Проверка QUIZ_DATA:", typeof QUIZ_DATA !== 'undefined' ? '✅ Есть' : '❌ Нет');
    
    // Получаем ссылки на элементы DOM
    console.log("🔍 Поиск DOM-элементов...");
    
    startSection = document.getElementById('startSection');
    console.log("   - startSection:", startSection ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    gameControls = document.getElementById('gameControls');
    console.log("   - gameControls:", gameControls ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    gameCodeDisplay = document.getElementById('gameCode');
    console.log("   - gameCode:", gameCodeDisplay ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    playersList = document.getElementById('playersList');
    console.log("   - playersList:", playersList ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    playerCount = document.getElementById('playerCount');
    console.log("   - playerCount:", playerCount ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    statsContent = document.getElementById('statsContent');
    console.log("   - statsContent:", statsContent ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    questionsList = document.getElementById('questionsList');
    console.log("   - questionsList:", questionsList ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    currentQ = document.getElementById('currentQ');
    console.log("   - currentQ:", currentQ ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    // Элементы презентации
    mainInterface = document.getElementById('mainInterface');
    console.log("   - mainInterface:", mainInterface ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    presentationMode = document.getElementById('presentationMode');
    console.log("   - presentationMode:", presentationMode ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    presentationQNum = document.getElementById('presentationQNum');
    console.log("   - presentationQNum:", presentationQNum ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    presentationQuestion = document.getElementById('presentationQuestion');
    console.log("   - presentationQuestion:", presentationQuestion ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    // Элементы статистики
    answeredCount = document.getElementById('answeredCount');
    console.log("   - answeredCount:", answeredCount ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    totalPlayers = document.getElementById('totalPlayers');
    console.log("   - totalPlayers:", totalPlayers ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    correctCount = document.getElementById('correctCount');
    console.log("   - correctCount:", correctCount ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    answeredCount2 = document.getElementById('answeredCount2');
    console.log("   - answeredCount2:", answeredCount2 ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    // Элементы статистики чайников
    noobTranslations = document.getElementById('noobTranslations');
    console.log("   - noobTranslations:", noobTranslations ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    noobWrong = document.getElementById('noobWrong');
    console.log("   - noobWrong:", noobWrong ? '✅ Найден' : '❌ НЕ НАЙДЕН');
    
    // Загружаем вопросы
    if (window.QUIZ_DATA) {
        console.log(`✅ QUIZ_DATA загружен, вопросов: ${QUIZ_DATA.questions.length}`);
        updateQuestionsList();
    } else {
        console.error("❌ QUIZ_DATA не найден! Проверь firebase-config.js");
    }
    
    console.log("✅ Инициализация завершена, ожидаю действий...");
    console.log("📊 Итоговое состояние: db =", db ? "✅ есть" : "❌ нет");
});

// ============================================
// 🎮 ОСНОВНЫЕ ФУНКЦИИ
// ============================================

function startNewGame() {
    console.log("🎮 ===== startNewGame ВЫЗВАНА =====");
    console.log("📌 Текущее время:", new Date().toLocaleTimeString());
    
    // ПРОВЕРКА 1: Есть ли db?
    if (!db) {
        console.error("❌ ОШИБКА: db не определена!");
        console.log("   Пробуем взять из window.db...");
        
        if (window.db) {
            db = window.db;
            console.log("✅ db взята из window.db");
        } else {
            console.error("❌ window.db тоже не определена!");
            alert("❌ Firebase не подключен! Открой консоль (F12) чтобы увидеть ошибки");
            return;
        }
    }
    console.log("✅ db определена");
    
    // ПРОВЕРКА 2: Есть ли QUIZ_DATA?
    if (!window.QUIZ_DATA) {
        console.error("❌ ОШИБКА: QUIZ_DATA не найден!");
        alert("❌ Вопросы не загружены! Открой консоль");
        return;
    }
    console.log("✅ QUIZ_DATA найден");
    
    // Генерируем 8-значный код
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    console.log("🔢 Сгенерирован код игры:", code);
    
    currentGameId = "game_" + code;
    console.log("🆔 ID игры в Firebase:", currentGameId);
    
    currentQuestionIndex = 0;
    totalPlayersCount = 0;
    noobRequests = { translations: 0, wrongAnswers: 0 };
    
    // Обновляем UI
    try {
        if (startSection) {
            startSection.style.display = 'none';
            console.log("✅ startSection скрыт");
        }
        
        if (gameControls) {
            gameControls.style.display = 'block';
            console.log("✅ gameControls показан");
        }
        
        if (gameCodeDisplay) {
            gameCodeDisplay.textContent = code;
            console.log("✅ gameCodeDisplay обновлён:", code);
        }
        
        if (currentQ) {
            currentQ.textContent = '0/30';
            console.log("✅ currentQ обновлён");
        }
        
        // Сбрасываем статистику чайников
        if (noobTranslations) noobTranslations.textContent = '0';
        if (noobWrong) noobWrong.textContent = '0';
        
    } catch (error) {
        console.error("❌ Ошибка при обновлении UI:", error);
    }
    
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
    
    console.log("📦 Данные для сохранения:", gameData);
    
    // Сохраняем в Firebase
    console.log("📤 Отправка в Firebase...");
    console.log("   Путь:", 'games/' + currentGameId);
    
    db.ref('games/' + currentGameId).set(gameData)
        .then(() => {
            console.log("✅ УСПЕХ! Игра создана в Firebase");
            console.log("🎮 Код игры для учеников:", code);
            
            showNotification(`🎮 Game created! Code: ${code}`, "success");
            
            // Начинаем слушать игроков
            console.log("👥 Запускаем listenToPlayers()...");
            listenToPlayers();
            
            // Обновляем список вопросов
            console.log("📋 Обновляем список вопросов...");
            updateQuestionsList();
            
            // Слушаем изменения игры
            console.log("👂 Запускаем listenToGameChanges()...");
            listenToGameChanges();
            
            // Слушаем запросы чайников
            console.log("🤓 Запускаем listenToNoobRequests()...");
            listenToNoobRequests();
            
            console.log("✅ Все слушатели запущены");
        })
        .catch(error => {
            console.error("❌ ОШИБКА Firebase при создании игры:", error);
            console.error("   Код ошибки:", error.code);
            console.error("   Сообщение:", error.message);
            alert("❌ Ошибка Firebase: " + error.message);
        });
}

// ============================================
// 👥 СЛУШАТЬ ИГРОКОВ
// ============================================

function listenToPlayers() {
    console.log("👥 listenToPlayers вызвана");
    console.log("   currentGameId:", currentGameId);
    console.log("   db существует:", !!db);
    
    if (!currentGameId || !db) {
        console.error("❌ listenToPlayers: нет currentGameId или db");
        return;
    }
    
    console.log(`👥 Начинаю слушать игроков в ${currentGameId}`);
    
    // Убираем старый слушатель если есть
    if (playersListener) {
        console.log("   Отписываемся от старого слушателя");
        db.ref(`games/${currentGameId}/players`).off('value', playersListener);
    }
    
    console.log("   Создаём новый слушатель...");
    
    playersListener = db.ref(`games/${currentGameId}/players`).on('value', snapshot => {
        console.log("📊 Получены данные об игроках");
        const players = snapshot.val() || {};
        const playerArray = Object.entries(players).map(([name, data]) => ({
            name,
            ...data
        }));
        
        console.log(`   Игроков онлайн: ${playerArray.length}`);
        
        if (playerCount) playerCount.textContent = playerArray.length;
        if (totalPlayers) totalPlayers.textContent = playerArray.length;
        totalPlayersCount = playerArray.length;
        
        updatePlayersList(playerArray);
    }, error => {
        console.error("❌ Ошибка в слушателе игроков:", error);
    });
    
    console.log("✅ Слушатель игроков установлен");
}

function updatePlayersList(players) {
    console.log("📋 updatePlayersList, игроков:", players.length);
    
    if (!playersList) {
        console.warn("⚠️ playersList не найден");
        return;
    }
    
    if (players.length === 0) {
        playersList.innerHTML = '<div class="empty-state"><div class="empty-icon">👤</div><p>Players will appear here after joining</p></div>';
        console.log("   Показано пустое состояние");
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
    
    console.log(`   Список игроков обновлён, первый: ${players[0]?.name}`);
}

// ============================================
// 📝 УПРАВЛЕНИЕ ВОПРОСАМИ
// ============================================

function startNextQuestion() {
    console.log("▶️ startNextQuestion вызвана");
    
    if (!currentGameId) {
        console.error("❌ Нет currentGameId");
        showNotification("Create a game first!", "warning");
        return;
    }
    
    if (!QUIZ_DATA || !QUIZ_DATA.questions) {
        console.error("❌ Нет QUIZ_DATA или вопросов");
        showNotification("Questions not loaded!", "error");
        return;
    }
    
    console.log(`   Текущий индекс вопроса: ${currentQuestionIndex}`);
    console.log(`   Всего вопросов: ${QUIZ_DATA.questions.length}`);
    
    const question = QUIZ_DATA.questions[currentQuestionIndex];
    if (!question) {
        console.log("🎉 Все вопросы пройдены");
        showNotification("🎉 All questions completed!", "success");
        return;
    }
    
    console.log(`▶️ Запускаю вопрос ${currentQuestionIndex + 1}:`, question);
    
    // Сбрасываем статистику
    if (answeredCount) answeredCount.textContent = '0';
    if (correctCount) correctCount.textContent = '0';
    if (answeredCount2) answeredCount2.textContent = '0';
    
    // Получаем количество игроков
    db.ref(`games/${currentGameId}/players`).once('value').then(snapshot => {
        const players = snapshot.val() || {};
        totalPlayersCount = Object.keys(players).length;
        console.log(`   Игроков в игре: ${totalPlayersCount}`);
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
        console.log("✅ Статус игры обновлён на question_active");
        
        // Переключаем в режим презентации
        enterPresentationMode(question);
        
        // Начинаем следить за ответами
        startAnswerTracking(question.id);
        
        // Обновляем счётчик
        currentQuestionIndex++;
        if (currentQ) currentQ.textContent = currentQuestionIndex + '/30';
        
        // Обновляем список вопросов
        updateQuestionsList();
        
        console.log(`✅ Вопрос ${question.id} запущен успешно`);
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
    console.log("🖥️ enterPresentationMode");
    
    if (!mainInterface || !presentationMode || !presentationQuestion || !presentationQNum) {
        console.error("❌ Не хватает DOM-элементов для презентации");
        return;
    }
    
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
    console.log("✅ Вопрос показан в презентации");
}

function exitPresentation() {
    console.log("👈 exitPresentation");
    
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
    console.log("✅ showAnswerPresentation");
    
    if (!QUIZ_DATA || !QUIZ_DATA.questions) return;
    
    const question = QUIZ_DATA.questions[currentQuestionIndex - 1];
    if (!question || !presentationQuestion) return;
    
    // Получаем правильный ответ
    const correctAnswerText = question.options[question.correct];
    console.log("   Правильный ответ:", correctAnswerText);
    
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
    console.log("👁️ showAnswer");
    showAnswerPresentation();
}

function nextQuestion() {
    console.log("⏩ nextQuestion");
    exitPresentation();
}

// ============================================
// 🔄 СБРОС ИГРЫ
// ============================================

function resetGame() {
    console.log("🔄 resetGame");
    
    if (!confirm("Delete current game and start over?")) {
        console.log("   Сброс отменён пользователем");
        return;
    }
    
    if (currentGameId && db) {
        console.log("   Удаляю игру из Firebase:", currentGameId);
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
    
    console.log("✅ Игра сброшена");
    showNotification("Game reset", "info");
}

// ============================================
// 📋 СПИСОК ВОПРОСОВ
// ============================================

function updateQuestionsList() {
    console.log("📋 updateQuestionsList");
    
    if (!questionsList) {
        console.warn("⚠️ questionsList не найден");
        return;
    }
    
    if (!QUIZ_DATA || !QUIZ_DATA.questions) {
        console.warn("⚠️ Нет данных вопросов");
        questionsList.innerHTML = '<div class="empty-state">No questions loaded</div>';
        return;
    }
    
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
                <div style="font-size: 0.7rem; color: ${difficultyColor};">${q.difficulty}</div>
                <div style="font-size: 0.7rem; color: rgba(255,255,255,0.5); margin-top: 5px;">
                    ${isCurrent ? '🔴' : isCompleted ? '✅' : '⏳'}
                </div>
            </div>
        `;
    }).join('');
    
    console.log(`✅ Список вопросов обновлён, показано ${QUIZ_DATA.questions.length} вопросов`);
}

function selectQuestion(index) {
    console.log(`🔍 Выбран вопрос ${index + 1}`);
    
    if (!QUIZ_DATA || !QUIZ_DATA.questions[index]) {
        console.error("❌ Вопрос не найден");
        return;
    }
    
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
        
        console.log("📊 Статус игры:", game.status);
    });
}

// ============================================
// 🤓 СЛУШАТЬ ЗАПРОСЫ ЧАЙНИКОВ
// ============================================

function listenToNoobRequests() {
    console.log("🤓 listenToNoobRequests");
    
    if (!currentGameId || !db) {
        console.warn("   Нет currentGameId или db, пропускаем");
        return;
    }
    
    db.ref(`noob_requests/${currentGameId}`).on('child_added', snapshot => {
        const request = snapshot.val();
        console.log("📨 Получен запрос от чайника:", request);
        
        if (request.type === 'translation') {
            noobRequests.translations++;
            if (noobTranslations) noobTranslations.textContent = noobRequests.translations;
            console.log(`   Запросов перевода: ${noobRequests.translations}`);
        }
        
        if (request.type === 'wrong_answer') {
            noobRequests.wrongAnswers++;
            if (noobWrong) noobWrong.textContent = noobRequests.wrongAnswers;
            console.log(`   Неправильных ответов: ${noobRequests.wrongAnswers}`);
        }
        
        // Удаляем обработанный запрос
        snapshot.ref.remove();
    });
}

// ============================================
// 🔔 УВЕДОМЛЕНИЯ
// ============================================

function showNotification(message, type = "info") {
    console.log(`🔔 Уведомление [${type}]: ${message}`);
    
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
        notification.remove();
    }, 3000);
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
if (!document.getElementById('notification-styles')) {
    style.id = 'notification-styles';
    document.head.appendChild(style);
}

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

console.log("✅ teacher.js полностью загружен, функции доступны:", Object.keys(window).filter(k => 
    ['startNewGame','startNextQuestion','showAnswer','nextQuestion','resetGame',
     'exitPresentation','showAnswerPresentation','selectQuestion'].includes(k)
));
