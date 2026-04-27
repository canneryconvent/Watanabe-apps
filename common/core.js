/* apps/common/core.js */

// 1. iOS 100vh バグ対策
function setVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', setVh);
setVh();

// 2. ダブルタップ拡大 & ピンチズームをJSで強制防止
document.addEventListener('touchstart', (event) => {
    if (event.touches.length > 1) {
        event.preventDefault(); // 二本指以上の操作を禁止
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault(); // 300ms以内の連続タップを無効化
    }
    lastTouchEnd = now;
}, false);

// 3. 画面切り替え (home, play, settings)
function showScreen(screenId) {
    const screens = ['home-screen', 'play-screen', 'settings-screen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = (screenId === 'home-screen') ? 'flex' : 'flex';
        if (screenId === 'play-screen' && typeof onGameStart === 'function') {
            onGameStart();
        }
    }
}

// 4. 設定エリアのトリプルタップ判定
let tapCount = 0;
let lastTapTime = 0;
function initTripleTap() {
    const settingsArea = document.querySelector('.settings-area');
    if (!settingsArea) return;

    settingsArea.addEventListener('pointerdown', (e) => {
        const now = Date.now();
        if (now - lastTapTime < 500) {
            tapCount++;
        } else {
            tapCount = 1;
        }
        lastTapTime = now;

        if (tapCount >= 3) {
            showScreen('settings-screen');
            tapCount = 0;
        }
    });
}

// 5. iOS 音声ロック解除
function unlockAudio() {
    const silent = new Audio();
    // SpeechSynthesisのアンロック
    if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(u);
    }
    document.removeEventListener('pointerdown', unlockAudio);
}
document.addEventListener('pointerdown', unlockAudio);

// 初期化
window.addEventListener('DOMContentLoaded', () => {
    initTripleTap();
});