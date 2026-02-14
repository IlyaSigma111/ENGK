// ============================================
// teacher-simple.js - С МОДЕРАЦИЕЙ ЧАЙНИКОВ
// ============================================

let currentGameId = null;
let currentQuestionIndex = 0;
let playersListener = null;
let noobRequests = {
    translations: 0,
    wrongAnswers: 0
};

// ============================================
// 🤓 ОБРАБОТКА ЗАПРОСОВ ОТ ЧАЙНИКОВ
// ============================================

// Слушаем запросы на перевод
function listenToNoobRequests() {
    if (!currentGameId || !db) return;
    
    db.ref(`noob_requests/${currentGameId}`).on('child_added', snapshot => {
        const request = snapshot.val();
        
        if (request.type === 'translation') {
            noobRequests.translations++;
            document.getElementById('noobTranslations').textContent = noobRequests.translations;
            
            // Отправляем в Telegram с кнопками
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
            document.getElementById('noobWrong').textContent = noobRequests.wrongAnswers;
            
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

// Обработка ответа от модератора (через webhook)
function handleModeratorDecision(playerName, action, accept) {
    if (action === 'translate') {
        // Отправить уведомление игроку
        const message = accept ? 
            "✅ Moderator approved your translation request!" : 
            "❌ Moderator denied your translation request. Try yourself!";
        
        db.ref(`notifications/${playerName}`).push({
            message: message,
            timestamp: Date.now()
        });
    }
    
    if (action === 'answer') {
        if (accept) {
            // Засчитать ответ (дать очки)
            db.ref(`games/${currentGameId}/players/${playerName}/score`).transaction(score => {
                return (score || 0) + 1;
            });
        }
        
        const message = accept ?
            "✅ Moderator accepted your wrong answer! +1 point" :
            "❌ Moderator rejected your answer";
        
        db.ref(`notifications/${playerName}`).push({
            message: message,
            timestamp: Date.now()
        });
    }
}

// ============================================
// ОСНОВНЫЕ ФУНКЦИИ
// ============================================

function startNewGame() {
    if (!window.db) {
        alert("Firebase not loaded. Refresh page.");
        return;
    }
    
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    currentGameId = "game_" + code;
    currentQuestionIndex = 0;
    noobRequests = { translations: 0, wrongAnswers: 0 };
    
    document.getElementById('startSection').style.display = 'none';
    document.getElementById('gameControls').style.display = 'block';
    document.getElementById('gameCode').textContent = code;
    document.getElementById('currentQ').textContent = '0/30';
    document.getElementById('noobTranslations').textContent = '0';
    document.getElementById('noobWrong').textContent = '0';
    
    const gameData = {
        id: currentGameId,
        created: Date.now(),
        status: "lobby",
        quizId: QUIZ_DATA.id,
        currentQuestion: null,
        players: {},
        answers: {},
        settings: {
            timer: 45,
            noobMode: true // Включён режим для чайников
        }
    };
    
    db.ref('games/' + currentGameId).set(gameData).then(() => {
        alert(`🎮 Game created! Code: ${code}`);
        listenToPlayers();
        listenToNoobRequests(); // Слушаем запросы чайников
        updateQuestionsList();
        listenToGameChanges();
    }).catch(error => {
        alert("Error: " + error.message);
    });
}

function startNextQuestion() {
    if (!currentGameId) {
        alert("Create a game first!");
        return;
    }
    
    const question = QUIZ_DATA.questions[currentQuestionIndex];
    if (!question) {
        alert("🎉 All questions completed!");
        return;
    }
    
    // Сбрасываем счётчики
    document.getElementById('answeredCount').textContent = '0';
    document.getElementById('correctCount').textContent = '0';
    document.getElementById('answeredCount2').textContent = '0';
    
    db.ref(`games/${currentGameId}/players`).once('value').then(snapshot => {
        const players = snapshot.val() || {};
        document.getElementById('totalPlayers').textContent = Object.keys(players).length;
    });
    
    db.ref(`games/${currentGameId}/answers/${question.id}`).remove();
    
    db.ref('games/' + currentGameId).update({
        status: "question_active",
        currentQuestion: question.id,
        questionStartTime: Date.now()
    }).then(() => {
        enterPresentationMode(question);
        startAnswerTracking(question.id);
        currentQuestionIndex++;
        document.getElementById('currentQ').textContent = currentQuestionIndex + '/30';
        updateQuestionsList();
    }).catch(error => {
        alert("Error: " + error.message);
    });
}

function startAnswerTracking(questionId) {
    if (!currentGameId || !questionId) return;
    
    db.ref(`games/${currentGameId}/answers/${questionId}`).on('value', snapshot => {
        const answers = snapshot.val() || {};
        updateAnswerStats(answers);
    });
}

function updateAnswerStats(answers) {
    const totalAnswers = Object.keys(answers).length;
    let correctAnswers = 0;
    
    Object.values(answers).forEach(answer => {
        if (answer.isCorrect) correctAnswers++;
    });
    
    document.getElementById('answeredCount').textContent = totalAnswers;
    document.getElementById('answeredCount2').textContent = totalAnswers;
    document.getElementById('correctCount').textContent = correctAnswers;
    
    updateStatsDisplay(totalAnswers, correctAnswers, 
        parseInt(document.getElementById('totalPlayers').textContent) || 0);
}

function updateStatsDisplay(total, correct, totalPlayers) {
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    document.getElementById('statsContent').innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <div style="font-size: 2rem; color: #4facfe;">${total}/${totalPlayers}</div>
                <div>Answered</div>
            </div>
            <div class="stat-item">
                <div style="font-size: 2rem; color: #43e97b;">${correct}</div>
                <div>Correct</div>
            </div>
            <div class="stat-item">
                <div style="font-size: 2rem; color: #f093fb;">${percentage}%</div>
                <div>Success</div>
            </div>
        </div>
    `;
}

function enterPresentationMode(question) {
    document.getElementById('mainInterface').style.display = 'none';
    document.getElementById('presentationMode').style.display = 'flex';
    document.getElementById('presentationQNum').textContent = currentQuestionIndex + 1;
    document.getElementById('presentationQuestion').innerHTML = `<h2>${question.text}</h2>`;
}

function exitPresentation() {
    document.getElementById('presentationMode').style.display = 'none';
    document.getElementById('mainInterface').style.display = 'flex';
    
    if (currentGameId) {
        db.ref('games/' + currentGameId).update({ status: "lobby" });
    }
}

function showAnswerPresentation() {
    const question = QUIZ_DATA.questions[currentQuestionIndex - 1];
    if (!question) return;
    
    const correctAnswer = question.options[question.correct];
    
    document.getElementById('presentationQuestion').innerHTML += `
        <div style="margin-top: 40px; padding: 30px; background: rgba(67,233,123,0.1); border-radius: 24px;">
            <h3 style="color: #43e97b;">✅ CORRECT ANSWER:</h3>
            <div style="font-size: 2rem; margin: 20px 0; text-align: center;">${correctAnswer}</div>
            <div style="color: rgba(255,255,255,0.8);">${question.explanation}</div>
        </div>
    `;
    
    if (currentGameId) {
        db.ref('games/' + currentGameId).update({ status: "showing_results" });
    }
}

function showAnswer() {
    showAnswerPresentation();
}

function nextQuestion() {
    exitPresentation();
}

function resetGame() {
    if (confirm("Delete current game and start over?")) {
        if (currentGameId) {
            db.ref('games/' + currentGameId).remove();
        }
        
        currentGameId = null;
        currentQuestionIndex = 0;
        noobRequests = { translations: 0, wrongAnswers: 0 };
        
        document.getElementById('startSection').style.display = 'block';
        document.getElementById('gameControls').style.display = 'none';
        document.getElementById('gameCode').textContent = '----';
        document.getElementById('playerCount').textContent = '0';
        document.getElementById('currentQ').textContent = '0/30';
        document.getElementById('playersList').innerHTML = '<div class="empty-state"><div class="empty-icon">👤</div><p>Players will appear here</p></div>';
        document.getElementById('statsContent').innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>Statistics will appear after answers</p></div>';
        
        alert("Game reset");
    }
}

function listenToPlayers() {
    if (!currentGameId) return;
    
    playersListener = db.ref(`games/${currentGameId}/players`).on('value', snapshot => {
        const players = snapshot.val() || {};
        const playerArray = Object.entries(players).map(([name, data]) => ({
            name,
            ...data
        }));
        
        document.getElementById('playerCount').textContent = playerArray.length;
        document.getElementById('totalPlayers').textContent = playerArray.length;
        updatePlayersList(playerArray);
    });
}

function updatePlayersList(players) {
    if (players.length === 0) {
        document.getElementById('playersList').innerHTML = '<div class="empty-state"><div class="empty-icon">👤</div><p>Players will appear here</p></div>';
        return;
    }
    
    players.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    document.getElementById('playersList').innerHTML = players.map((player, index) => `
        <div class="player-card">
            <div class="player-avatar">${player.name.charAt(0).toUpperCase()}</div>
            <div class="player-name">${player.name}</div>
            <div class="player-score">🎯 ${player.score || 0} pts</div>
            ${index === 0 ? '<div style="color: #FFD700; margin-top: 10px;">👑</div>' : ''}
            ${player.noobRequests ? '<div style="color: #f093fb; font-size: 0.8rem;">🤓</div>' : ''}
        </div>
    `).join('');
}

function listenToGameChanges() {
    if (!currentGameId) return;
    
    db.ref(`games/${currentGameId}`).on('value', snapshot => {
        const game = snapshot.val();
        if (!game) return;
    });
}

function updateQuestionsList() {
    if (!QUIZ_DATA) return;
    
    document.getElementById('questionsList').innerHTML = QUIZ_DATA.questions.map((q, index) => {
        const isCurrent = index === currentQuestionIndex - 1;
        const isCompleted = index < currentQuestionIndex - 1;
        
        let statusClass = '';
        if (isCurrent) statusClass = 'active';
        else if (isCompleted) statusClass = 'completed';
        
        return `
            <div class="question-item ${statusClass}" onclick="selectQuestion(${index})">
                <div style="font-size: 1.5rem;">${index + 1}</div>
                <div>${q.difficulty}</div>
            </div>
        `;
    }).join('');
}

function selectQuestion(index) {
    currentQuestionIndex = index;
    startNextQuestion();
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Teacher panel loaded with Noob Moderation!");
    updateQuestionsList();
});

// Экспорт
window.startNewGame = startNewGame;
window.startNextQuestion = startNextQuestion;
window.showAnswer = showAnswer;
window.nextQuestion = nextQuestion;
window.resetGame = resetGame;
window.exitPresentation = exitPresentation;
window.showAnswerPresentation = showAnswerPresentation;
window.selectQuestion = selectQuestion;
