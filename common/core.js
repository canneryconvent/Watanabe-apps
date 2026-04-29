/**
 * apps/common/core.js
 * 教育アプリ共通基盤（GA4: G-4T10JYJ9XC 統合版）
 */

// ==========================================
// 1. Google Analytics 4 (GA4) 統合（公式コード再現版）
// ==========================================
const GA_MEASUREMENT_ID = 'G-4T10JYJ9XC'; 

(function() {
    // 1. gtag.jsを読み込むためのscriptタグを作成
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    
    // 2. Head内の「最初」に挿入（ここが公式と同じ優先順位にするコツです）
    document.head.prepend(script);

    // 3. gtag関数の初期化
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag; // 他の処理からも呼べるようにグローバル化
    
    gtag('js', new Date());

    // 4. 計測開始（ページタイトルを自動で取得）
    gtag('config', GA_MEASUREMENT_ID, {
        'page_title': document.title,
        'page_path': location.pathname
    });

    // 動作確認用（ブラウザの検証画面の「コンソール」で見えます）
    console.log("GA4 Core Loaded: " + GA_MEASUREMENT_ID);
})();

// ==========================================
// 2. iOS対策・誤操作防止（以前のまま）
// ==========================================
const setFillHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};
window.addEventListener('resize', setFillHeight);
setFillHeight();

// ピンチズーム・ダブルタップ拡大禁止
document.addEventListener('touchstart', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
}, false);

// ==========================================
// 3. 設定画面のトリプルタップ（共通ID対応）
// ==========================================
let tapCount = 0;
let tapTimer = null;

const handleTripleTap = () => {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 500);

    if (tapCount === 3) {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.add('active');
            tapCount = 0;
            // 設定を開いたことをGA4に送る
            if (window.gtag) gtag('event', 'open_settings', { 'app_name': document.title });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-settings-btn');
    if (openBtn) openBtn.addEventListener('click', handleTripleTap);

    const closeBtn = document.getElementById('close-settings-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.getElementById('settings-modal');
            if (modal) modal.classList.remove('active');
        });
    }
});