/**
 * ========== 全アプリ共通ロジック ==========
 */

// 1. 画面高さの確実な取得 (iOS Safariの100vhバグ対策)
let resizeTimer;
const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setVh, 200);
});
setVh();

// ページ読み込み完了時に共通の機能（設定画面や音声）をセットアップ
document.addEventListener('DOMContentLoaded', () => {
    
    // 2. 設定画面のトリプルタップ起動処理
    const openSettingsBtn = document.getElementById('open-settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');

    if (openSettingsBtn && settingsModal) {
        let settingsTapTimestamps = [];
        openSettingsBtn.addEventListener('pointerdown', (e) => {
            const now = Date.now();
            settingsTapTimestamps.push(now);
            
            if (settingsTapTimestamps.length > 3) {
                settingsTapTimestamps.shift();
            }
            
            if (settingsTapTimestamps.length === 3 && (now - settingsTapTimestamps[0]) <= 600) {
                // トリプルタップ成功
                settingsModal.style.display = 'flex';
                settingsTapTimestamps = []; 
                
                // アプリ側に loadSettings があれば呼び出して最新設定を画面に反映
                if (typeof window.loadSettings === 'function') {
                    window.loadSettings();
                }
            }
        });
    }

    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener('click', () => {
            // アプリ側に saveSettings があれば呼び出して設定を保存
            if (typeof window.saveSettings === 'function') {
                window.saveSettings();
            }
            settingsModal.style.display = 'none';
        });
    }

    // 3. iOSオーディオアンロック処理 (スタートボタン押下時に無音再生)
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('pointerdown', () => {
            initCommonAudio();
        });
    }
});

// 4. 共通オーディオ管理
let commonAudioCtx;
function initCommonAudio() {
    if (!commonAudioCtx) {
        commonAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (commonAudioCtx.state === 'suspended') {
        commonAudioCtx.resume();
    }
    // 無音再生でiOSの制限を強制解除
    const osc = commonAudioCtx.createOscillator();
    const gain = commonAudioCtx.createGain();
    gain.gain.value = 0; 
    osc.connect(gain);
    gain.connect(commonAudioCtx.destination);
    osc.start(0);
    osc.stop(commonAudioCtx.currentTime + 0.1);
}

// 共通の効果音（正解音：ピンポン）を全アプリから呼び出せるようにする
window.playCommonChime = function() {
    if (!commonAudioCtx) return;
    const osc1 = commonAudioCtx.createOscillator();
    const osc2 = commonAudioCtx.createOscillator();
    const gain = commonAudioCtx.createGain();
    
    osc1.connect(gain); osc2.connect(gain); gain.connect(commonAudioCtx.destination);
    
    osc1.type = 'sine'; osc2.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, commonAudioCtx.currentTime); // G5
    osc2.frequency.setValueAtTime(987.77, commonAudioCtx.currentTime); // B5
    
    gain.gain.setValueAtTime(0, commonAudioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, commonAudioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, commonAudioCtx.currentTime + 0.6);
    
    osc1.start(commonAudioCtx.currentTime); osc2.start(commonAudioCtx.currentTime);
    osc1.stop(commonAudioCtx.currentTime + 0.6); osc2.stop(commonAudioCtx.currentTime + 0.6);
};