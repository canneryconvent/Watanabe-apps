/**
 * apps/common/core.js
 * 教育アプリ共通基盤（iOS対策、誤操作防止、設定画面制御、GA4統合）
 */

// ==========================================
// 1. Google Analytics 4 (GA4) 統合設定
// ==========================================
const GA_MEASUREMENT_ID = 'G-4T10JYJ9XC'; // TODO: 取得した測定IDに書き換えてください

(function() {
    // gtag.jsのスクリプトを動的に読み込み
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag; // グローバルに公開
    gtag('js', new Date());

    // ページビュー送信（アプリタイトルとパスを自動取得）
    gtag('config', GA_MEASUREMENT_ID, {
        'page_title': document.title,
        'page_path': location.pathname
    });
})();

// ==========================================
// 2. iOS Safari 100vhバグ対策
// ==========================================
const setFillHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', setFillHeight);
window.addEventListener('orientationchange', setFillHeight);
setFillHeight();

// ==========================================
// 3. 誤操作防止（ダブルタップ拡大・ピンチズーム禁止）
// ==========================================
document.addEventListener('touchstart', (event) => {
    if (event.touches.length > 1) {
        event.preventDefault(); // ピンチズーム禁止
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault(); // ダブルタップ拡大禁止
    }
    lastTouchEnd = now;
}, false);

// ==========================================
// 4. iOS 音声再生制限の解除
// ==========================================
let audioContextUnlocked = false;
const unlockAudio = () => {
    if (audioContextUnlocked) return;
    
    // 無音バッファを再生してロックを解除
    const silentAudio = new Audio();
    silentAudio.play().then(() => {
        audioContextUnlocked = true;
        console.log("Audio Unlocked");
        // 一度解除したらイベントを削除
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
    }).catch(e => console.log("Audio lock persists", e));
};

document.addEventListener('touchstart', unlockAudio, { once: false });
document.addEventListener('click', unlockAudio, { once: false });

// ==========================================
// 5. 設定画面のトリプルタップ制御（IDルール準拠）
// ==========================================
let tapCount = 0;
let tapTimer = null;

const handleTripleTap = (event) => {
    tapCount++;
    clearTimeout(tapTimer);
    
    // 0.5秒以内に3回タップしたか判定
    tapTimer = setTimeout(() => { tapCount = 0; }, 500);

    if (tapCount === 3) {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.add('active');
            tapCount = 0;
            // GA4イベント送信: 設定画面を開いた
            if (window.gtag) gtag('event', 'open_settings', { 'app_name': document.title });
        }
    }
};

// ==========================================
// 6. 共通効果音再生機能
// ==========================================
const playSound = (type) => {
    const sounds = {
        correct: 'https://watanabe-apps.github.io/apps/common/sounds/correct.mp3', // パスは適宜調整してください
        incorrect: 'https://watanabe-apps.github.io/apps/common/sounds/incorrect.mp3'
    };
    
    if (sounds[type]) {
        const audio = new Audio(sounds[type]);
        audio.play();
        // GA4イベント送信: 正解/不正解
        if (window.gtag) gtag('event', 'play_sound', { 'result': type, 'app_name': document.title });
    }
};

// ==========================================
// 7. 初期化処理（イベントバインド）
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 設定ボタン（⚙️）へのトリプルタップ設定
    const openBtn = document.getElementById('open-settings-btn');
    if (openBtn) {
        openBtn.addEventListener('click', handleTripleTap);
    }

    // 設定画面を閉じるボタンの設定
    const closeBtn = document.getElementById('close-settings-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.getElementById('settings-modal');
            if (modal) modal.classList.remove('active');
        });
    }
});