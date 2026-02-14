// ============================================
// FIREBASE CONFIG - ENGLISH: FEARS AND PHOBIAS
// ============================================

console.log("🔥 firebase-config.js загружается...");

// 🔥 НОВАЯ КОНФИГУРАЦИЯ FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBC4rcVKEMj88Dm2snG5XXxAuZqeNPMc3c",
  authDomain: "engk-5a74a.firebaseapp.com",
  databaseURL: "https://engk-5a74a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "engk-5a74a",
  storageBucket: "engk-5a74a.firebasestorage.app",
  messagingSenderId: "1512777396",
  appId: "1:1512777396:web:8f219f77f91467f21fd9e1",
  measurementId: "G-CJWPXGL2JQ"
};

// ✅ СОЗДАЁМ ГЛОБАЛЬНУЮ ПЕРЕМЕННУЮ ДЛЯ БД
window.db = null;

// Инициализация Firebase
try {
    if (typeof firebase !== 'undefined') {
        console.log("✅ Firebase библиотека загружена");
        
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase приложение инициализировано");
        }
        
        // ✅ СОХРАНЯЕМ ССЫЛКУ НА DATABASE В ГЛОБАЛЬНУЮ ПЕРЕМЕННУЮ
        window.db = firebase.database();
        console.log("✅ Firebase database доступна по адресу:", window.db);
        
        // Проверяем, что db работает
        if (window.db) {
            console.log("✅ db успешно создана");
        } else {
            console.error("❌ db не создалась");
        }
    } else {
        console.error("❌ Firebase не загружен! Проверь подключение в HTML");
        console.log("   Убедись, что в teacher.html есть строки:");
        console.log('   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"></script>');
        console.log('   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js"></script>');
    }
} catch (error) {
    console.error("❌ Ошибка Firebase:", error);
}

// ============================================
// 📚 30 ВОПРОСОВ ПО АНГЛИЙСКОМУ: FEARS AND PHOBIAS
// ============================================

// Функция для перемешивания вариантов ответов
function shuffleOptions(question) {
    const options = [...question.options];
    const correctAnswer = options[question.correct];
    
    // Перемешиваем массив
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    // Находим новый индекс правильного ответа
    const newCorrectIndex = options.indexOf(correctAnswer);
    
    return {
        ...question,
        options: options,
        correct: newCorrectIndex
    };
}

window.QUIZ_DATA = {
    id: "english_fears_phobias",
    title: "English: Fears and Phobias",
    description: "30 questions about fears, phobias and preferences",
    subject: "English",
    author: "English Teacher",
    version: "2024.1",
    
    // Получить вопрос с перемешанными вариантами
    getShuffledQuestion(index) {
        if (index < 0 || index >= this.questions.length) return null;
        return shuffleOptions({...this.questions[index]});
    },
    
    questions: [
        // ===== 🟢 ЛЁГКИЕ ВОПРОСЫ (1-10) - Vocabulary =====
        {
            id: 1,
            type: "easy",
            text: "How do you translate the word 'fear' into Russian?",
            options: ["Страх", "Радость", "Гнев", "Удивление"],
            correct: 0,
            explanation: "'Fear' means 'страх' in Russian.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 2,
            type: "easy",
            text: "What does the word 'spider' mean in Russian?",
            options: ["Змея", "Паук", "Мышь", "Птица"],
            correct: 1,
            explanation: "'Spider' is 'паук' in Russian.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 3,
            type: "easy",
            text: "How do you say 'тьма' in English?",
            options: ["Light", "Darkness", "Brightness", "Shadow"],
            correct: 1,
            explanation: "'Тьма' translates to 'darkness'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 4,
            type: "easy",
            text: "What is the English word for 'высота'?",
            options: ["Depth", "Width", "Height", "Length"],
            correct: 2,
            explanation: "'Высота' means 'height'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 5,
            type: "easy",
            text: "How do you translate 'толпа' into English?",
            options: ["Alone", "Crowd", "Room", "Street"],
            correct: 1,
            explanation: "'Толпа' is 'crowd'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 6,
            type: "easy",
            text: "What does 'snake' mean in Russian?",
            options: ["Паук", "Ящерица", "Змея", "Крокодил"],
            correct: 2,
            explanation: "'Snake' means 'змея'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 7,
            type: "easy",
            text: "How do you say 'полёт' in English?",
            options: ["Trip", "Flight", "Journey", "Walk"],
            correct: 1,
            explanation: "'Полёт' translates to 'flight'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 8,
            type: "easy",
            text: "What is the English for 'публичная речь'?",
            options: ["Private conversation", "Public speaking", "Loud scream", "Quiet whisper"],
            correct: 1,
            explanation: "'Публичная речь' is 'public speaking'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 9,
            type: "easy",
            text: "How do you translate 'буря' into English?",
            options: ["Rain", "Snow", "Storm", "Wind"],
            correct: 2,
            explanation: "'Буря' means 'storm'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 10,
            type: "easy",
            text: "What does 'alone' mean in Russian?",
            options: ["Вместе", "Одинокий", "Счастливый", "Грустный"],
            correct: 1,
            explanation: "'Alone' means 'одинокий'.",
            points: 1,
            difficulty: "easy"
        },
        
        // ===== 🟡 СРЕДНИЕ ВОПРОСЫ (11-20) - Fill in the blank =====
        {
            id: 11,
            type: "medium",
            text: "Many people have a _____ of spiders.",
            options: ["fear", "like", "love", "hate"],
            correct: 0,
            explanation: "'Fear of spiders' is the correct phrase.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 12,
            type: "medium",
            text: "She feels _____ when she sees a snake.",
            options: ["happy", "scared", "excited", "calm"],
            correct: 1,
            explanation: "People usually feel 'scared' of snakes.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 13,
            type: "medium",
            text: "He is afraid of _____ in the dark.",
            options: ["being", "be", "been", "is"],
            correct: 0,
            explanation: "After 'of' we use gerund: 'being'.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 14,
            type: "medium",
            text: "I have a phobia of _____ in front of people.",
            options: ["speaking", "speak", "spoke", "speaks"],
            correct: 0,
            explanation: "After 'of' we need gerund: 'speaking'.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 15,
            type: "medium",
            text: "The _____ of heights is called acrophobia.",
            options: ["fear", "love", "hate", "joy"],
            correct: 0,
            explanation: "Acrophobia is the 'fear' of heights.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 16,
            type: "medium",
            text: "She can't fly because she's afraid of _____.",
            options: ["planes", "cars", "trains", "buses"],
            correct: 0,
            explanation: "Fear of flying means fear of 'planes'.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 17,
            type: "medium",
            text: "He feels anxious when he is in _____ places.",
            options: ["crowded", "empty", "quiet", "clean"],
            correct: 0,
            explanation: "Anxiety often happens in 'crowded' places.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 18,
            type: "medium",
            text: "My sister has a phobia of _____ water.",
            options: ["deep", "shallow", "warm", "cold"],
            correct: 0,
            explanation: "Aquaphobia is fear of 'deep' water.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 19,
            type: "medium",
            text: "_____ is the fear of thunderstorms.",
            options: ["Astraphobia", "Arachnophobia", "Acrophobia", "Claustrophobia"],
            correct: 0,
            explanation: "Astraphobia = fear of thunder/lightning.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 20,
            type: "medium",
            text: "He couldn't sleep because he was _____ of the dark.",
            options: ["scared", "happy", "tired", "hungry"],
            correct: 0,
            explanation: "Fear of dark makes you 'scared'.",
            points: 2,
            difficulty: "medium"
        },
        
        // ===== 🔴 СЛОЖНЫЕ ВОПРОСЫ (21-30) - Preferences =====
        {
            id: 21,
            type: "hard",
            text: "If you're afraid of heights, which place would you PREFER to visit?",
            options: ["A ground floor café", "A rooftop restaurant", "An observation deck", "A mountain peak"],
            correct: 0,
            explanation: "Ground floor is safest for fear of heights.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 22,
            type: "hard",
            text: "Someone with arachnophobia would PREFER to:",
            options: ["Visit a butterfly garden", "See a spider exhibit", "Watch a tarantula movie", "Hold a tarantula"],
            correct: 0,
            explanation: "Butterfly garden has no spiders.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 23,
            type: "hard",
            text: "If you fear public speaking, which job would you PREFER?",
            options: ["Librarian", "News anchor", "Teacher", "Tour guide"],
            correct: 0,
            explanation: "Librarians work quietly with books.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 24,
            type: "hard",
            text: "A person afraid of flying would SPECIFICALLY choose:",
            options: ["Train travel", "Plane travel", "Hot air balloon", "Helicopter"],
            correct: 0,
            explanation: "Trains stay safely on the ground.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 25,
            type: "hard",
            text: "Someone with claustrophobia would PREFER:",
            options: ["A house with big windows", "A small apartment", "An elevator ride", "A basement room"],
            correct: 0,
            explanation: "Big windows make spaces feel larger.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 26,
            type: "hard",
            text: "If afraid of the dark, you would MOST LIKELY:",
            options: ["Use a night light", "Go camping alone", "Explore caves", "Watch horror films"],
            correct: 0,
            explanation: "Night lights help with fear of dark.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 27,
            type: "hard",
            text: "A person afraid of dogs would PREFER to walk:",
            options: ["In a dog-free park", "At a dog park", "To a pet store", "Through a kennel"],
            correct: 0,
            explanation: "Dog-free park has no dogs at all.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 28,
            type: "hard",
            text: "Someone with aquaphobia would SPECIFICALLY avoid:",
            options: ["Swimming in the ocean", "Taking a shower", "Drinking water", "Washing hands"],
            correct: 0,
            explanation: "The ocean is deep and scary.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 29,
            type: "hard",
            text: "If you fear crowds, you would PREFER to shop:",
            options: ["Online", "On Black Friday", "At a concert", "In a busy mall"],
            correct: 0,
            explanation: "Online shopping = no crowds.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 30,
            type: "hard",
            text: "A person with social anxiety would MOST enjoy:",
            options: ["Reading alone at home", "Giving a speech", "A big party", "Performing on stage"],
            correct: 0,
            explanation: "Reading alone = no social interaction.",
            points: 3,
            difficulty: "hard"
        }
    ]
};

console.log(`✅ Загружено ${QUIZ_DATA.questions.length} вопросов по английскому (Fears and Phobias)`);

// ============================================
// 🤖 TELEGRAM BOT CONFIG
// ============================================

window.TELEGRAM_CONFIG = {
    botToken: "8110893337:AAEXbYtRyyrt_k1oAwjsOhOBUsdPnGCH_oM",
    
    sendModerationMessage(playerName, action, questionData) {
        console.log(`🤓 Модерация: ${playerName} - ${action}`, questionData);
    }
};

// ============================================
// 🛠️ СИСТЕМА МОДЕРАТОРОВ
// ============================================

window.moderatorSystem = {
    MODERATOR_PASSWORD: "English2024",
    
    isModerator() {
        return localStorage.getItem('isModerator') === 'true';
    },
    
    setModerator(status) {
        localStorage.setItem('isModerator', status);
    },
    
    showPasswordModal() {
        alert("Moderator mode password: " + this.MODERATOR_PASSWORD);
    }
};

// ✅ ФИНАЛЬНАЯ ПРОВЕРКА
console.log("🔍 Финальная проверка в firebase-config.js:");
console.log("   window.db =", window.db);
console.log("   window.QUIZ_DATA =", window.QUIZ_DATA ? "✅ есть" : "❌ нет");
console.log("✅ firebase-config.js полностью загружен");
