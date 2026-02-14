// ============================================
// app.js - Общие функции
// ============================================

// Глобальные утилиты
window.utils = {
    // Форматирование времени
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },
    
    // Случайный ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Проверка на мобильное устройство
    isMobile() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }
};

console.log("✅ App.js loaded");
