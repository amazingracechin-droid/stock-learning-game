// =============================================
// 🔒 비밀번호 잠금 시스템
// =============================================
const LOCK_PASSWORD = 'show me the stock';

function checkPassword() {
    const input = document.getElementById('lock-password');
    const error = document.getElementById('lock-error');
    const lockScreen = document.getElementById('lock-screen');

    if (input.value.toLowerCase().trim() === LOCK_PASSWORD) {
        // 잠금 해제 애니메이션
        lockScreen.classList.add('unlocking');
        sessionStorage.setItem('stock-game-unlocked', 'true');

        setTimeout(() => {
            lockScreen.classList.add('hidden');
            document.getElementById('app').style.display = '';
            document.getElementById('particle-canvas').style.display = '';
        }, 800);
    } else {
        // 틀림 - 흔들기 애니메이션
        error.classList.remove('hidden');
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 600);
        input.value = '';
        input.focus();
    }
}

// 엔터 키로 비밀번호 제출
document.addEventListener('DOMContentLoaded', () => {
    const lockInput = document.getElementById('lock-password');
    const lockScreen = document.getElementById('lock-screen');

    if (lockInput) {
        lockInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') checkPassword();
        });
    }

    // 이미 잠금 해제된 상태라면 잠금 화면 숨기기
    if (sessionStorage.getItem('stock-game-unlocked') === 'true') {
        lockScreen.classList.add('hidden');
        document.getElementById('app').style.display = '';
        document.getElementById('particle-canvas').style.display = '';
    } else {
        // 잠금 상태: 게임 콘텐츠 숨기기
        document.getElementById('app').style.display = 'none';
        document.getElementById('particle-canvas').style.display = 'none';
    }
});

// =============================================
// 주식 초보 탈출기 - 메인 게임 스크립트
// Premium UI Edition
// =============================================

const CONFIG = {
    STARTING_MONEY: 1000000,
    TOTAL_DAYS: 365,
    NEWS_CHANCE: 0.3, // 뉴스 발생 확률 30%
};

// =============================================
// 🔊 사운드 매니저 (Web Audio API)
// =============================================
class SoundManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
    }

    // 사용자 인터랙션 후 초기화 (브라우저 정책)
    ensureContext() {
        if (!this.ctx || this.ctx.state === 'closed') {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.initialized = true;
        return this.ctx;
    }

    // 🔔 띵동 사운드 (퀴즈 정답)
    playCorrect() {
        try {
            const ctx = this.ensureContext();
            const now = ctx.currentTime;

            // 첫 번째 음 (띵) - 높은 도
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(523.25, now); // C5
            gain1.gain.setValueAtTime(0.3, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.3);

            // 두 번째 음 (동) - 높은 미
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5
            gain2.gain.setValueAtTime(0, now);
            gain2.gain.setValueAtTime(0.35, now + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.15);
            osc2.stop(now + 0.5);

            // 세 번째 음 (반짝) - 높은 솔
            const osc3 = ctx.createOscillator();
            const gain3 = ctx.createGain();
            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(783.99, now + 0.3); // G5
            gain3.gain.setValueAtTime(0, now);
            gain3.gain.setValueAtTime(0.3, now + 0.3);
            gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
            osc3.connect(gain3);
            gain3.connect(ctx.destination);
            osc3.start(now + 0.3);
            osc3.stop(now + 0.7);
        } catch (e) { console.warn('Sound error:', e); }
    }

    // 🚨 경보음 (자금 부족)
    playAlarm() {
        try {
            const ctx = this.ensureContext();
            const now = ctx.currentTime;

            for (let i = 0; i < 3; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                const t = now + i * 0.2;
                osc.frequency.setValueAtTime(880, t);
                osc.frequency.setValueAtTime(440, t + 0.1);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.18);
            }
        } catch (e) { console.warn('Sound error:', e); }
    }

    // 🎉 함성 + 박수 (수익 발생)
    playCheer() {
        try {
            const ctx = this.ensureContext();
            const now = ctx.currentTime;

            // 팡파레 멜로디
            const notes = [
                { freq: 523.25, start: 0, dur: 0.15 },     // C5
                { freq: 587.33, start: 0.12, dur: 0.15 },  // D5
                { freq: 659.25, start: 0.24, dur: 0.15 },  // E5
                { freq: 783.99, start: 0.36, dur: 0.3 },   // G5
                { freq: 1046.5, start: 0.55, dur: 0.4 },   // C6
            ];

            notes.forEach(note => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(note.freq, now + note.start);
                gain.gain.setValueAtTime(0.2, now + note.start);
                gain.gain.exponentialRampToValueAtTime(0.01, now + note.start + note.dur);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + note.start);
                osc.stop(now + note.start + note.dur);
            });

            // 와~ 함성 (노이즈 + 필터로 시뮬레이션)
            const bufferSize = ctx.sampleRate * 1.2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.5;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const bandpass = ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.setValueAtTime(800, now + 0.3);
            bandpass.frequency.linearRampToValueAtTime(2000, now + 0.6);
            bandpass.frequency.linearRampToValueAtTime(1200, now + 1.2);
            bandpass.Q.setValueAtTime(1.5, now);

            const cheerGain = ctx.createGain();
            cheerGain.gain.setValueAtTime(0, now);
            cheerGain.gain.linearRampToValueAtTime(0.15, now + 0.4);
            cheerGain.gain.setValueAtTime(0.15, now + 0.8);
            cheerGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

            noise.connect(bandpass);
            bandpass.connect(cheerGain);
            cheerGain.connect(ctx.destination);
            noise.start(now + 0.3);
            noise.stop(now + 1.5);

            // 박수 소리 (짧은 노이즈 버스트 반복)
            for (let i = 0; i < 8; i++) {
                const clapBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
                const clapData = clapBuffer.getChannelData(0);
                for (let j = 0; j < clapData.length; j++) {
                    clapData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.008));
                }
                const clap = ctx.createBufferSource();
                clap.buffer = clapBuffer;

                const clapFilter = ctx.createBiquadFilter();
                clapFilter.type = 'highpass';
                clapFilter.frequency.setValueAtTime(1500, now);

                const clapGain = ctx.createGain();
                const clapTime = now + 0.5 + i * 0.12 + (Math.random() * 0.03);
                clapGain.gain.setValueAtTime(0.12 + Math.random() * 0.08, clapTime);

                clap.connect(clapFilter);
                clapFilter.connect(clapGain);
                clapGain.connect(ctx.destination);
                clap.start(clapTime);
            }
        } catch (e) { console.warn('Sound error:', e); }
    }

    // 📈 매수 성공 효과음 (짧은 확인음)
    playBuy() {
        try {
            const ctx = this.ensureContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.linearRampToValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) { console.warn('Sound error:', e); }
    }

    // 📉 매도 효과음 (짧은 하강음)
    playSell() {
        try {
            const ctx = this.ensureContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.linearRampToValueAtTime(500, now + 0.12);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) { console.warn('Sound error:', e); }
    }
}

// 전역 사운드 매니저 인스턴스
const soundManager = new SoundManager();

// =============================================
// 🏆 투자자 레벨 시스템
// =============================================
const INVESTOR_LEVELS = [
    { min: 1000000000, label: "투자의 신", icon: "⚡", color: "#ff0040" },
    { min: 500000000, label: "재벌 3세", icon: "💎", color: "#e040ff" },
    { min: 100000000, label: "시장 지배자", icon: "👑", color: "#ffd700" },
    { min: 50000000, label: "슈퍼 개미", icon: "🐜", color: "#00f5d4" },
    { min: 20000000, label: "여의도 유망주", icon: "✨", color: "#7b61ff" },
    { min: 5000000, label: "동학 개미", icon: "🛡️", color: "#5e9eff" },
    { min: 0, label: "주린이", icon: "👶", color: "#888" },
];

function getInvestorLevel(assets) {
    for (const level of INVESTOR_LEVELS) {
        if (assets >= level.min) return level;
    }
    return INVESTOR_LEVELS[INVESTOR_LEVELS.length - 1];
}

// ACADEMY_POOL, ACADEMY_DATA는 quiz-data.js에서 로드됨

// =============================================
// 뉴스 데이터
// =============================================
const NEWS_DATA = {
    good: [
        { title: '신제품 대박 예감!', body: '혁신적인 신제품이 시장에서 큰 호응을 얻고 있습니다.', tip: '💡 호재 뉴스는 주가를 올릴 수 있어요. 매수를 고려해보세요!' },
        { title: '역대급 실적 발표!', body: '분기 실적이 시장 예상치를 크게 상회했습니다.', tip: '💡 좋은 실적은 주가 상승의 가장 강력한 동력이에요!' },
        { title: '외국인 투자 급증!', body: '해외 투자자들의 매수세가 급격히 늘어나고 있습니다.', tip: '💡 외국인 투자 증가는 기업 신뢰도가 높다는 신호예요.' },
        { title: '정부 지원 정책 발표!', body: '해당 업종에 대한 정부의 대규모 지원 정책이 확정되었습니다.', tip: '💡 정부 정책은 해당 산업 전체에 긍정적 영향을 줄 수 있어요.' },
        { title: '대규모 수출 계약 체결!', body: '해외 대기업과 대형 수출 계약을 맺었습니다.', tip: '💡 수출 증가는 매출 성장으로 이어져요!' },
    ],
    bad: [
        { title: '제품 결함 대규모 리콜!', body: '핵심 제품에서 결함이 발견되어 리콜을 실시합니다.', tip: '💡 악재 뉴스가 나오면 주가 하락 가능성이 높아요. 매도를 고려해보세요.' },
        { title: 'CEO 횡령 스캔들!', body: '회사 대표의 비리가 검찰 수사로 이어지고 있습니다.', tip: '💡 경영진 리스크는 주가에 매우 큰 악영향을 줍니다.' },
        { title: '원자재 가격 폭등!', body: '주요 원자재 가격이 급등하여 제조 원가가 크게 올랐습니다.', tip: '💡 비용 증가는 이익 감소로 이어져 주가 하락 요인이에요.' },
        { title: '강력한 경쟁사 등장!', body: '업계에 강력한 경쟁 기업이 등장하여 시장 점유율 위협을 받고 있습니다.', tip: '💡 경쟁 심화는 기업 이익에 부정적이에요.' },
        { title: '소비자 불매운동 확산!', body: '기업의 사회적 논란으로 불매운동이 확산되고 있습니다.', tip: '💡 기업 이미지 훼손은 매출 감소로 이어질 수 있어요.' },
    ]
};

// Stock sector icons
const SECTOR_ICONS = {
    '전자': '💻',
    '바이오': '🧬',
    '건설': '🏗️',
    '여행': '✈️',
    '식품': '🍜'
};

// =============================================
// Particle Background System
// =============================================
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initParticles() {
        const count = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 18000));
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.3 + 0.1,
                color: Math.random() > 0.5 ? '0, 245, 212' : '123, 97, 255'
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
            this.ctx.fill();

            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(123, 97, 255, ${0.06 * (1 - dist / 120)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// =============================================
// Sparkline Chart Renderer
// =============================================
function renderSparkline(canvasEl, data, isUp) {
    if (!canvasEl || data.length < 2) return;

    const ctx = canvasEl.getContext('2d');
    const w = canvasEl.width = canvasEl.offsetWidth * 2;
    const h = canvasEl.height = canvasEl.offsetHeight * 2;

    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    if (isUp) {
        gradient.addColorStop(0, 'rgba(255, 107, 107, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
    } else {
        gradient.addColorStop(0, 'rgba(81, 207, 102, 0.3)');
        gradient.addColorStop(1, 'rgba(81, 207, 102, 0)');
    }

    ctx.beginPath();
    ctx.moveTo(0, h);
    data.forEach((val, i) => {
        const x = i * step;
        const y = h - ((val - min) / range) * h * 0.8 - h * 0.1;
        ctx.lineTo(x, y);
    });
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    data.forEach((val, i) => {
        const x = i * step;
        const y = h - ((val - min) / range) * h * 0.8 - h * 0.1;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = isUp ? 'rgba(255, 107, 107, 0.8)' : 'rgba(81, 207, 102, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const lastVal = data[data.length - 1];
    const lastX = (data.length - 1) * step;
    const lastY = h - ((lastVal - min) / range) * h * 0.8 - h * 0.1;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = isUp ? '#ff6b6b' : '#51cf66';
    ctx.fill();
}

// =============================================
// Stock 클래스
// =============================================
class Stock {
    constructor(id, name, sector, price, volatility) {
        this.id = id;
        this.name = name;
        this.sector = sector;
        this.price = price;
        this.startPrice = price;
        this.volatility = volatility;
        this.history = [price];
        this.trend = 0;
        this.prevPrice = price;
    }

    update() {
        this.prevPrice = this.price;
        const randomFluctuation = (Math.random() * 2 - 1) * this.volatility;
        const trendFactor = this.trend * 0.01;
        const changePercent = randomFluctuation + trendFactor;
        const changeAmount = Math.floor(this.price * changePercent);
        this.price += changeAmount;
        if (this.price < 100) this.price = 100;
        this.trend *= 0.95;
        this.history.push(this.price);
    }

    getChangeRate() {
        return ((this.price - this.startPrice) / this.startPrice * 100).toFixed(2);
    }

    getDayChange() {
        if (this.history.length < 2) return 0;
        const prev = this.history[this.history.length - 2];
        return ((this.price - prev) / prev * 100).toFixed(2);
    }

    getRecentHistory(count = 20) {
        return this.history.slice(-count);
    }
}

// =============================================
// Game 클래스
// =============================================
class Game {
    constructor() {
        this.money = CONFIG.STARTING_MONEY;
        this.day = 1;
        this.stocks = [];
        this.portfolio = {};
        this.isRunning = false;
        this.gameStarted = false;
        this.completedQuizzes = [];
        this.studyPhaseComplete = false;
        this.quizAnswers = {};
        this.prevPrices = {};
        this.pendingNewsQueue = []; // 대기 중인 뉴스 큐
        this.tradesSinceLastNews = 0; // 뉴스 이후 거래 횟수
        this.avgBuyPrices = {}; // 종목별 평균 매수가 추적
        // 📚 일일 학습 시스템
        this.academyLevel = 'beginner'; // beginner → intermediate → advanced
        this.learnedIds = [];           // 이미 학습한 콘텐츠 ID 목록
        this.dailyQuizCorrect = 0;      // 누적 정답 수
        this.dailyQuizTotal = 0;        // 누적 총 문제 수
        this.lastStudyDay = 0;          // 마지막 학습한 날
        this.dailyLessonCount = 3;      // 하루에 받는 학습 수
    }

    init() {
        this.stocks.push(new Stock(1, '성실전자', '전자', 50000, 0.03));
        this.stocks.push(new Stock(2, '화성바이오', '바이오', 20000, 0.05));
        this.stocks.push(new Stock(3, '튼튼건설', '건설', 10000, 0.02));
        this.stocks.push(new Stock(4, '제주여행', '여행', 5000, 0.04));
        this.stocks.push(new Stock(5, '맛나푸드', '식품', 15000, 0.025));

        // Initialize particle system
        this.particles = new ParticleSystem();

        this.render();
        this.showPreStudy();
    }

    // =============================================
    // ⭐ STEP 1: 사전학습 (학습 내용만 표시)
    // =============================================
    showPreStudy() {
        const modal = document.getElementById('pre-study-modal');
        const studyContent = document.getElementById('pre-study-content');
        const quizSection = document.getElementById('pre-study-quiz-section');

        studyContent.innerHTML = '';
        ACADEMY_DATA.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'study-card';
            div.innerHTML = `
                <div class="study-number">${index + 1}</div>
                <div class="study-body">
                    <h4>${item.title}</h4>
                    <p>${item.content}</p>
                </div>
            `;
            studyContent.appendChild(div);
        });

        // 퀴즈 섹션 숨기기 (학습만 먼저 보기)
        quizSection.classList.add('hidden');
        document.getElementById('pre-study-result').classList.add('hidden');

        // 학습 완료 버튼 보이기
        const actionArea = document.querySelector('.pre-study-action');
        if (actionArea) actionArea.classList.remove('hidden');

        modal.classList.remove('hidden');
    }

    // =============================================
    // ⭐ STEP 2: 퀴즈 (별도 화면으로 전환)
    // =============================================
    showPreStudyQuiz() {
        // 학습 내용 숨기기
        document.getElementById('pre-study-content').classList.add('hidden');
        const actionArea = document.querySelector('.pre-study-action');
        if (actionArea) actionArea.classList.add('hidden');

        // STEP 배지 업데이트
        const badges = document.querySelectorAll('.pre-study-badge');
        if (badges.length > 0) badges[0].textContent = 'STEP 2';

        // 헤더 텍스트 변경
        const header = document.querySelector('.pre-study-header h2');
        if (header) header.textContent = '🧠 퀴즈 타임!';
        const subtitle = document.querySelector('.pre-study-subtitle');
        if (subtitle) subtitle.innerHTML = '앞서 배운 내용을 얼마나 기억하고 있나요?<br>5개 문제를 모두 풀고 <strong>투자 지원금</strong>을 받으세요!';

        // 퀴즈 섹션 표시
        const quizSection = document.getElementById('pre-study-quiz-section');
        const quizContent = document.getElementById('pre-study-quiz-content');

        this.quizAnswers = {};
        quizContent.innerHTML = '';

        ACADEMY_DATA.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'quiz-card';
            div.id = `quiz-card-${item.id}`;
            div.innerHTML = `
                <div class="quiz-number">Q${index + 1}</div>
                <div class="quiz-body">
                    <h4>${item.quiz.question}</h4>
                    <div class="quiz-options-grid" id="quiz-options-${item.id}">
                        ${item.quiz.options.map((opt, optIndex) => `
                            <button class="quiz-opt-btn" onclick="game.selectPreStudyAnswer('${item.id}', ${optIndex}, this)">
                                <span class="opt-number">${optIndex + 1}</span>
                                <span class="opt-text">${opt}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="quiz-feedback hidden" id="quiz-feedback-${item.id}"></div>
                </div>
            `;
            quizContent.appendChild(div);
        });

        quizSection.classList.remove('hidden');

        // 제출 버튼 숨기기 (아직 다 못 풀었으므로)
        document.getElementById('pre-study-submit-btn').classList.add('hidden');

        // 스크롤 최상단
        document.querySelector('.pre-study-modal-content').scrollTop = 0;
    }

    selectPreStudyAnswer(quizId, optIndex, btnElement) {
        const optionsContainer = document.getElementById(`quiz-options-${quizId}`);
        optionsContainer.querySelectorAll('.quiz-opt-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        btnElement.classList.add('selected');
        this.quizAnswers[quizId] = optIndex;

        this.checkAllQuizzesAnswered();
    }

    checkAllQuizzesAnswered() {
        const allAnswered = ACADEMY_DATA.every(item => this.quizAnswers[item.id] !== undefined);
        const submitBtn = document.getElementById('pre-study-submit-btn');

        if (allAnswered) {
            submitBtn.classList.remove('hidden');
            submitBtn.scrollIntoView({ behavior: 'smooth' });
        }
    }

    submitPreStudyQuiz() {
        let correctCount = 0;
        let totalReward = 0;
        let allCorrect = true;

        ACADEMY_DATA.forEach(item => {
            const feedback = document.getElementById(`quiz-feedback-${item.id}`);
            const card = document.getElementById(`quiz-card-${item.id}`);
            const selected = this.quizAnswers[item.id];
            const isCorrect = selected === item.quiz.answer;

            feedback.classList.remove('hidden');

            if (isCorrect) {
                correctCount++;
                totalReward += item.quiz.reward;
                feedback.innerHTML = `<div class="feedback-header">✅ 정답! +${item.quiz.reward.toLocaleString()}원</div><div class="feedback-explanation">💡 ${item.quiz.explanation}</div>`;
                feedback.className = 'quiz-feedback correct';
                card.classList.add('quiz-correct');
                // 🔔 띵동 사운드!
                soundManager.playCorrect();
            } else {
                allCorrect = false;
                const correctAnswer = item.quiz.options[item.quiz.answer];
                feedback.innerHTML = `<div class="feedback-header">❌ 오답! 정답: ${correctAnswer}</div><div class="feedback-explanation">💡 ${item.quiz.explanation}</div>`;
                feedback.className = 'quiz-feedback wrong';
                card.classList.add('quiz-wrong');
            }
        });

        const resultArea = document.getElementById('pre-study-result');
        resultArea.classList.remove('hidden');

        if (allCorrect) {
            resultArea.innerHTML = `
                <div class="result-perfect">
                    <span class="result-icon">🎉</span>
                    <h3>완벽합니다! ${correctCount}/${ACADEMY_DATA.length} 전부 정답!</h3>
                    <p>투자 지원금 <strong>${totalReward.toLocaleString()}원</strong>이 지급됩니다!</p>
                    <button onclick="game.finishPreStudy(${totalReward})">🚀 게임 시작하기!</button>
                </div>
            `;
        } else {
            resultArea.innerHTML = `
                <div class="result-partial">
                    <span class="result-icon">${correctCount >= 3 ? '👍' : '📚'}</span>
                    <h3>${correctCount}/${ACADEMY_DATA.length} 정답!</h3>
                    <p>맞은 문제 보상: <strong>${totalReward.toLocaleString()}원</strong></p>
                    <p class="result-hint">틀린 문제는 위에서 정답을 확인하고, 내용을 다시 읽어보세요!</p>
                    <button onclick="game.finishPreStudy(${totalReward})">💰 보상 받고 게임 시작!</button>
                    <button class="btn-retry" onclick="game.retryPreStudyQuiz()">🔄 다시 풀기</button>
                </div>
            `;
        }

        document.getElementById('pre-study-submit-btn').classList.add('hidden');
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }

    retryPreStudyQuiz() {
        document.getElementById('pre-study-result').classList.add('hidden');
        ACADEMY_DATA.forEach(item => {
            const feedback = document.getElementById(`quiz-feedback-${item.id}`);
            const card = document.getElementById(`quiz-card-${item.id}`);
            feedback.classList.add('hidden');
            card.classList.remove('quiz-correct', 'quiz-wrong');
            const optionsContainer = document.getElementById(`quiz-options-${item.id}`);
            optionsContainer.querySelectorAll('.quiz-opt-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
        });
        this.quizAnswers = {};
        document.querySelector('.pre-study-modal-content').scrollTop = 0;
    }

    finishPreStudy(reward) {
        this.money += reward;
        this.studyPhaseComplete = true;
        this.completedQuizzes = ACADEMY_DATA.map(item => item.id);

        document.getElementById('pre-study-modal').classList.add('hidden');

        this.addLog('🎮 게임이 시작되었습니다! 목표: 1년 안에 자산 2배 만들기', 'info');
        this.addLog(`📘 사전학습 완료! 투자 지원금 +${reward.toLocaleString()}원 지급`, 'info');
        this.addLog('💡 "⏩ 다음 날" 버튼을 눌러 하루를 진행하세요!', 'info');

        this.gameStarted = true;
        this.isRunning = true;
        this.updateMarketIndicator(true);
        this.render();
    }

    // =============================================
    // ⭐ 수동 진행 방식: "다음 날" 버튼으로 진행
    // =============================================
    advanceDay() {
        if (!this.gameStarted) return;

        // Save previous prices for flash animation
        this.stocks.forEach(stock => {
            this.prevPrices[stock.id] = stock.price;
        });

        this.day++;
        if (this.day > CONFIG.TOTAL_DAYS) {
            this.endGame();
            return;
        }

        // 모든 주식 가격 업데이트
        this.stocks.forEach(stock => stock.update());

        // 뉴스 발생 체크
        this.generateNews();

        this.tradesSinceLastNews = 0;
        this.render();
    }

    // 다중 진행 (5일, 10일 한꺼번에)
    advanceMultipleDays(count) {
        if (!this.gameStarted) return;

        for (let i = 0; i < count; i++) {
            this.stocks.forEach(stock => {
                this.prevPrices[stock.id] = stock.price;
            });

            this.day++;
            if (this.day > CONFIG.TOTAL_DAYS) {
                this.endGame();
                return;
            }

            this.stocks.forEach(stock => stock.update());
        }

        // 다중 진행 후 뉴스 발생 체크 (1회만)
        this.generateNews();
        this.tradesSinceLastNews = 0;
        this.render();
    }

    // ===== 뉴스 이벤트 시스템 =====
    generateNews() {
        if (Math.random() > CONFIG.NEWS_CHANCE) return;

        const stock = this.stocks[Math.floor(Math.random() * this.stocks.length)];
        const isGoodNews = Math.random() > 0.45;
        const trendEffect = isGoodNews ? 1 : -1;

        const newsPool = isGoodNews ? NEWS_DATA.good : NEWS_DATA.bad;
        const newsItem = newsPool[Math.floor(Math.random() * newsPool.length)];

        stock.trend += trendEffect * 5;

        this.addLog(`[속보] ${stock.name}: ${newsItem.title}`, isGoodNews ? 'news-good' : 'news-bad');
        this.showNewsPopup(stock, newsItem, isGoodNews);
    }

    // 매수/매도 후 뉴스 트리거 (거래가 있으면 뉴스 발생 확률 up)
    tryTriggerNewsAfterTrade() {
        this.tradesSinceLastNews++;
        // 거래 2회마다 뉴스 발생 기회
        if (this.tradesSinceLastNews >= 2 && Math.random() < 0.4) {
            this.tradesSinceLastNews = 0;
            this.generateNews();
        }
    }

    showNewsPopup(stock, newsItem, isGoodNews) {
        const popup = document.getElementById('news-popup');
        document.getElementById('news-popup-icon').textContent = isGoodNews ? '📈' : '📉';

        const title = document.getElementById('news-popup-title');
        title.textContent = `[${stock.name}] ${newsItem.title}`;
        title.style.color = isGoodNews ? '#ff6b6b' : '#5e9eff';

        document.getElementById('news-popup-body').textContent = newsItem.body;
        document.getElementById('news-popup-tip').textContent = newsItem.tip;

        const glow = popup.querySelector('.news-glow');
        if (glow) {
            glow.style.background = isGoodNews
                ? 'radial-gradient(circle at center, rgba(255, 107, 107, 0.08) 0%, transparent 50%)'
                : 'radial-gradient(circle at center, rgba(94, 158, 255, 0.08) 0%, transparent 50%)';
        }

        popup.classList.remove('hidden');
    }

    dismissNews() {
        document.getElementById('news-popup').classList.add('hidden');
    }

    endGame() {
        this.gameStarted = false;
        this.isRunning = false;
        this.updateMarketIndicator(false);

        const total = this.getTotalAssets();
        const profit = total - CONFIG.STARTING_MONEY;
        const profitRate = ((profit / CONFIG.STARTING_MONEY) * 100).toFixed(1);
        const won = total >= CONFIG.STARTING_MONEY * 2;

        // 🎉 수익이면 함성+박수, 손실이면 경보음
        if (profit > 0) {
            soundManager.playCheer();
        } else {
            soundManager.playAlarm();
        }

        const modal = document.getElementById('game-end-modal');
        const icon = document.getElementById('game-end-icon');
        const title = document.getElementById('game-end-title');
        const stats = document.getElementById('game-end-stats');
        const glow = modal.querySelector('.game-end-glow');

        icon.textContent = won ? '🏆' : '💪';
        title.textContent = won ? '축하합니다! 자산 2배 달성!' : '아쉽지만 좋은 경험이었어요!';
        title.style.color = won ? '#00f5d4' : '#ffd93d';

        if (glow) {
            glow.style.background = won
                ? 'radial-gradient(circle at center, rgba(0, 245, 212, 0.1) 0%, transparent 50%)'
                : 'radial-gradient(circle at center, rgba(255, 217, 61, 0.08) 0%, transparent 50%)';
        }

        stats.innerHTML = `
            <div class="end-stat">
                <span class="end-stat-label">최종 자산</span>
                <span class="end-stat-value ${profit >= 0 ? 'positive' : 'negative'}">${total.toLocaleString()}원</span>
            </div>
            <div class="end-stat">
                <span class="end-stat-label">수익률</span>
                <span class="end-stat-value ${profit >= 0 ? 'positive' : 'negative'}">${profit >= 0 ? '+' : ''}${profitRate}%</span>
            </div>
            <div class="end-stat">
                <span class="end-stat-label">투자 기간</span>
                <span class="end-stat-value">${this.day}일</span>
            </div>
            <div class="end-stat">
                <span class="end-stat-label">순이익</span>
                <span class="end-stat-value ${profit >= 0 ? 'positive' : 'negative'}">${profit >= 0 ? '+' : ''}${profit.toLocaleString()}원</span>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    // ===== 매수/매도 =====
    getQuantity(stockId) {
        const input = document.getElementById(`qty-${stockId}`);
        const qty = parseInt(input?.value) || 0;
        if (qty <= 0) {
            this.showToast('📦 수량을 1 이상 입력하세요!', 'error');
            return 0;
        }
        return qty;
    }

    buyStock(stockId) {
        const quantity = this.getQuantity(stockId);
        if (quantity === 0) return;

        const stock = this.stocks.find(s => s.id === stockId);
        const cost = stock.price * quantity;

        if (this.money >= cost) {
            const prevQty = this.portfolio[stockId] || 0;
            const prevAvg = this.avgBuyPrices[stockId] || 0;
            const totalCost = prevAvg * prevQty + stock.price * quantity;
            this.avgBuyPrices[stockId] = totalCost / (prevQty + quantity);

            this.money -= cost;
            this.portfolio[stockId] = prevQty + quantity;
            this.addLog(`✅ ${stock.name} ${quantity}주 매수 (${stock.price.toLocaleString()}원 × ${quantity})`);
            soundManager.playBuy();
            this.render();
            this.tryTriggerNewsAfterTrade();
        } else {
            soundManager.playAlarm();
            this.showToast('💰 자금이 부족합니다!', 'error');
        }
    }

    sellStock(stockId) {
        const quantity = this.getQuantity(stockId);
        if (quantity === 0) return;

        const stock = this.stocks.find(s => s.id === stockId);

        if ((this.portfolio[stockId] || 0) >= quantity) {
            const gain = stock.price * quantity;
            const avgBuy = this.avgBuyPrices[stockId] || stock.startPrice;
            const profit = (stock.price - avgBuy) * quantity;

            this.money += gain;
            this.portfolio[stockId] -= quantity;

            if (profit > 0) {
                soundManager.playCheer();
                this.addLog(`🎉 ${stock.name} ${quantity}주 매도! +${profit.toLocaleString()}원 수익!`, 'news-good');
            } else {
                soundManager.playSell();
                this.addLog(`💸 ${stock.name} ${quantity}주 매도 (${stock.price.toLocaleString()}원 × ${quantity})`);
            }

            if (this.portfolio[stockId] <= 0) {
                delete this.avgBuyPrices[stockId];
                this.portfolio[stockId] = 0;
            }

            this.render();
            this.tryTriggerNewsAfterTrade();
        } else {
            soundManager.playAlarm();
            this.showToast('📦 보유 주식이 부족합니다!', 'error');
        }
    }

    showToast(message, type = 'info') {
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            padding: 14px 28px;
            background: ${type === 'error' ? 'rgba(255, 107, 107, 0.9)' : 'rgba(0, 245, 212, 0.9)'};
            color: ${type === 'error' ? 'white' : '#0a0a1a'};
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 700;
            z-index: 2000;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            font-family: 'Noto Sans KR', sans-serif;
        `;

        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes toastIn {
                    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                @keyframes toastOut {
                    from { transform: translateX(-50%) translateY(0); opacity: 1; }
                    to { transform: translateX(-50%) translateY(20px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    getTotalAssets() {
        let stockValue = 0;
        for (const [stockId, quantity] of Object.entries(this.portfolio)) {
            const stock = this.stocks.find(s => s.id == stockId);
            if (stock && quantity > 0) stockValue += stock.price * quantity;
        }
        return this.money + stockValue;
    }

    addLog(message, type = '') {
        const list = document.getElementById('news-list');
        const item = document.createElement('li');
        item.textContent = `[Day ${this.day}] ${message}`;
        if (type) item.className = type;
        list.prepend(item);
        if (list.children.length > 30) list.removeChild(list.lastChild);
    }

    updateMarketIndicator(isLive) {
        const indicator = document.getElementById('market-indicator');
        if (!indicator) return;
        if (isLive) {
            indicator.style.borderColor = 'rgba(0, 245, 212, 0.3)';
            indicator.querySelector('.indicator-text').textContent = 'OPEN';
            indicator.querySelector('.indicator-dot').style.background = '#00f5d4';
        } else {
            indicator.style.borderColor = 'rgba(255, 107, 107, 0.3)';
            indicator.querySelector('.indicator-text').textContent = 'CLOSED';
            indicator.querySelector('.indicator-dot').style.background = '#ff6b6b';
        }
    }

    // ===== 📚 일일 학습 시스템 =====
    getDailyLessons() {
        const pool = ACADEMY_POOL[this.academyLevel];
        const available = pool.filter(item => !this.learnedIds.includes(item.id));
        if (available.length === 0) {
            // 현재 레벨 모두 학습 → 다음 레벨 체크
            const levels = ['beginner', 'intermediate', 'advanced'];
            const nextIdx = levels.indexOf(this.academyLevel) + 1;
            if (nextIdx < levels.length) {
                this.academyLevel = levels[nextIdx];
                return this.getDailyLessons();
            }
            return []; // 모든 콘텐츠 완료
        }
        // 셔플 후 dailyLessonCount개 선택
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, this.dailyLessonCount);
    }

    getAccuracyRate() {
        if (this.dailyQuizTotal === 0) return 0;
        return (this.dailyQuizCorrect / this.dailyQuizTotal * 100);
    }

    getLevelLabel() {
        const labels = { beginner: '🟢 초급', intermediate: '🟡 중급', advanced: '🔴 고급' };
        return labels[this.academyLevel] || '🟢 초급';
    }

    checkLevelUp() {
        const rate = this.getAccuracyRate();
        const levels = ['beginner', 'intermediate', 'advanced'];
        const currentIdx = levels.indexOf(this.academyLevel);
        // 정답률 80% 이상 & 최소 5문제 이상 풀었으면 레벨업
        if (rate >= 80 && this.dailyQuizTotal >= 5 && currentIdx < levels.length - 1) {
            this.academyLevel = levels[currentIdx + 1];
            this.showToast(`🎓 레벨 업! ${this.getLevelLabel()}으로 승급!`, 'info');
            this.addLog(`🎓 아카데미 ${this.getLevelLabel()}으로 레벨업! (정답률 ${rate.toFixed(0)}%)`, 'info');
            return true;
        }
        return false;
    }

    openAcademy() {
        if (this.lastStudyDay === this.day) {
            this.showToast('📚 오늘의 학습은 이미 완료했어요! 다음 날에 다시 도전하세요.', 'info');
            return;
        }

        const lessons = this.getDailyLessons();
        if (lessons.length === 0) {
            this.showToast('🏆 모든 학습 콘텐츠를 완료했습니다! 대단해요!', 'info');
            return;
        }

        this.currentDailyLessons = lessons;
        this.dailyQuizAnswers = {};

        const modal = document.getElementById('academy-modal');
        const list = document.getElementById('academy-list');
        list.innerHTML = '';

        // 레벨 & 진행도 표시
        const allPool = [...ACADEMY_POOL.beginner, ...ACADEMY_POOL.intermediate, ...ACADEMY_POOL.advanced];
        const learnedCount = this.learnedIds.length;
        const totalCount = allPool.length;
        const rate = this.getAccuracyRate();

        const headerInfo = document.createElement('div');
        headerInfo.className = 'academy-progress-info';
        headerInfo.innerHTML = `
            <div class="academy-stats-row">
                <span class="academy-level-badge">${this.getLevelLabel()}</span>
                <span class="academy-progress-text">학습 ${learnedCount}/${totalCount}</span>
                <span class="academy-accuracy">정답률 ${this.dailyQuizTotal > 0 ? rate.toFixed(0) + '%' : '-'}</span>
            </div>
            <div class="academy-progress-bar">
                <div class="academy-progress-fill" style="width:${(learnedCount / totalCount * 100).toFixed(1)}%"></div>
            </div>
        `;
        list.appendChild(headerInfo);

        // 오늘의 학습 카드
        const dayTitle = document.createElement('h3');
        dayTitle.className = 'daily-lesson-title';
        dayTitle.textContent = `📖 Day ${this.day} 오늘의 학습 (${lessons.length}개)`;
        list.appendChild(dayTitle);

        lessons.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'academy-item daily-lesson';
            div.innerHTML = `
                <div class="academy-header">
                    <h4>${item.title}</h4>
                    <span class="badge-new">🆕 NEW</span>
                </div>
                <p>${item.content}</p>
            `;
            list.appendChild(div);
        });

        // 퀴즈 영역
        const quizArea = document.createElement('div');
        quizArea.className = 'daily-quiz-area';
        quizArea.innerHTML = `<h3 class="daily-quiz-title">🧠 오늘의 퀴즈</h3>`;

        lessons.forEach((item, index) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'quiz-card daily-quiz-card';
            qDiv.id = `daily-quiz-${item.id}`;
            qDiv.innerHTML = `
                <div class="quiz-number">Q${index + 1}</div>
                <div class="quiz-body">
                    <h4>${item.quiz.question}</h4>
                    <div class="quiz-options-grid" id="daily-opts-${item.id}">
                        ${item.quiz.options.map((opt, oi) => `
                            <button class="quiz-opt-btn" onclick="game.selectDailyAnswer('${item.id}', ${oi}, this)">
                                <span class="opt-number">${oi + 1}</span>
                                <span class="opt-text">${opt}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="quiz-feedback hidden" id="daily-fb-${item.id}"></div>
                </div>
            `;
            quizArea.appendChild(qDiv);
        });

        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn-submit-quiz hidden';
        submitBtn.id = 'daily-submit-btn';
        submitBtn.textContent = '📝 답안 제출하기';
        submitBtn.onclick = () => this.submitDailyQuiz();
        quizArea.appendChild(submitBtn);

        const resultDiv = document.createElement('div');
        resultDiv.id = 'daily-quiz-result';
        resultDiv.className = 'hidden';
        quizArea.appendChild(resultDiv);

        list.appendChild(quizArea);
        modal.classList.remove('hidden');
    }

    selectDailyAnswer(quizId, optIndex, btn) {
        const container = document.getElementById(`daily-opts-${quizId}`);
        container.querySelectorAll('.quiz-opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.dailyQuizAnswers[quizId] = optIndex;

        // 모든 문제 풀었으면 제출 버튼 표시
        if (this.currentDailyLessons.every(l => this.dailyQuizAnswers[l.id] !== undefined)) {
            const submitBtn = document.getElementById('daily-submit-btn');
            submitBtn.classList.remove('hidden');
            submitBtn.scrollIntoView({ behavior: 'smooth' });
        }
    }

    submitDailyQuiz() {
        let correct = 0;
        let reward = 0;

        this.currentDailyLessons.forEach(item => {
            const fb = document.getElementById(`daily-fb-${item.id}`);
            const card = document.getElementById(`daily-quiz-${item.id}`);
            const sel = this.dailyQuizAnswers[item.id];
            const isCorrect = sel === item.quiz.answer;

            fb.classList.remove('hidden');
            if (isCorrect) {
                correct++;
                reward += item.quiz.reward;
                fb.innerHTML = `<div class="feedback-header">✅ 정답! +${item.quiz.reward.toLocaleString()}원</div><div class="feedback-explanation">💡 ${item.quiz.explanation}</div>`;
                fb.className = 'quiz-feedback correct';
                card.classList.add('quiz-correct');
                soundManager.playCorrect();
            } else {
                fb.innerHTML = `<div class="feedback-header">❌ 오답! 정답: ${item.quiz.options[item.quiz.answer]}</div><div class="feedback-explanation">💡 ${item.quiz.explanation}</div>`;
                fb.className = 'quiz-feedback wrong';
                card.classList.add('quiz-wrong');
            }
            this.learnedIds.push(item.id);
        });

        this.dailyQuizCorrect += correct;
        this.dailyQuizTotal += this.currentDailyLessons.length;
        this.lastStudyDay = this.day;
        this.money += reward;

        const resultDiv = document.getElementById('daily-quiz-result');
        const allCorrect = correct === this.currentDailyLessons.length;
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = `
            <div class="${allCorrect ? 'result-perfect' : 'result-partial'}">
                <span class="result-icon">${allCorrect ? '🎉' : (correct > 0 ? '👍' : '📚')}</span>
                <h3>${correct}/${this.currentDailyLessons.length} 정답!</h3>
                <p>보상: <strong>+${reward.toLocaleString()}원</strong></p>
                <p class="result-hint">누적 정답률: ${this.getAccuracyRate().toFixed(0)}% (${this.dailyQuizCorrect}/${this.dailyQuizTotal})</p>
                <button onclick="game.closeAcademy()">확인</button>
            </div>
        `;

        document.getElementById('daily-submit-btn').classList.add('hidden');
        resultDiv.scrollIntoView({ behavior: 'smooth' });

        this.checkLevelUp();
        this.render();
        this.addLog(`📚 오늘의 학습 완료! ${correct}/${this.currentDailyLessons.length} 정답 (+${reward.toLocaleString()}원)`, 'info');
    }

    closeAcademy() {
        document.getElementById('academy-modal').classList.add('hidden');
    }

    // ===== 화면 렌더링 =====
    render() {
        // Update header stats with animation
        const totalAssets = this.getTotalAssets();
        this.animateValue('money', this.money.toLocaleString() + '원');
        this.animateValue('total-assets', totalAssets.toLocaleString() + '원');

        // 레벨 업데이트
        const level = getInvestorLevel(totalAssets);
        const levelEl = document.getElementById('level-display');
        if (levelEl) {
            levelEl.textContent = `${level.icon} ${level.label}`;
            levelEl.style.color = level.color;
            // 텍스트 그림자 효과 추가로 가독성 높임
            levelEl.style.textShadow = `0 0 10px ${level.color}40`;
        }

        document.getElementById('date').textContent = `Day ${this.day}`;

        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = `${(this.day / CONFIG.TOTAL_DAYS * 100).toFixed(1)}%`;
        }

        // Render stock list
        const stockListEl = document.getElementById('stock-list');
        stockListEl.innerHTML = '';

        this.stocks.forEach(stock => {
            const dayChange = stock.getDayChange();
            const colorClass = dayChange > 0 ? 'price-up' : (dayChange < 0 ? 'price-down' : '');
            const neutralClass = dayChange == 0 ? 'price-neutral' : '';
            const arrow = dayChange > 0 ? '▲' : (dayChange < 0 ? '▼' : '—');
            const icon = SECTOR_ICONS[stock.sector] || '📊';

            const prevPrice = this.prevPrices[stock.id] || stock.price;
            const flashClass = stock.price > prevPrice ? 'flash-up' : (stock.price < prevPrice ? 'flash-down' : '');

            const hasMyStock = this.portfolio[stock.id] && this.portfolio[stock.id] > 0;
            const isUp = dayChange >= 0;
            const historyData = stock.getRecentHistory();

            const div = document.createElement('div');
            div.className = `stock-item ${flashClass}`;
            div.innerHTML = `
                <div class="stock-info">
                    <div class="stock-icon sector-${stock.sector}">${icon}</div>
                    <div>
                        <span class="stock-name">${stock.name}</span>
                        <span class="stock-sector">${stock.sector}</span>
                    </div>
                    <span class="stock-price ${colorClass}">${stock.price.toLocaleString()}원</span>
                    <span class="stock-change ${colorClass} ${neutralClass}">${arrow} ${Math.abs(dayChange)}%</span>
                    <canvas class="stock-sparkline" data-stock-id="${stock.id}"></canvas>
                </div>
                <div class="stock-actions">
                    <div class="qty-group">
                        <input type="number" class="qty-input" id="qty-${stock.id}" value="1" min="1" max="${Math.floor(this.money / stock.price)}" placeholder="수량">
                        <span class="qty-max" onclick="document.getElementById('qty-${stock.id}').value=${Math.floor(this.money / stock.price)}">MAX ${Math.floor(this.money / stock.price)}</span>
                    </div>
                    <button class="btn-buy" onclick="game.buyStock(${stock.id})">매수</button>
                    <button class="btn-sell" onclick="game.sellStock(${stock.id})">매도</button>
                    <span class="my-stock ${hasMyStock ? 'has-stock' : ''}">${hasMyStock ? this.portfolio[stock.id] + '주 보유' : ''}</span>
                </div>
            `;
            stockListEl.appendChild(div);

            requestAnimationFrame(() => {
                const canvas = div.querySelector('.stock-sparkline');
                if (canvas) {
                    renderSparkline(canvas, historyData, isUp);
                }
            });
        });

        // Render portfolio
        const myStocksEl = document.getElementById('my-stocks');
        myStocksEl.innerHTML = '';
        let hasStocks = false;

        Object.entries(this.portfolio).forEach(([stockId, quantity]) => {
            if (quantity > 0) {
                hasStocks = true;
                const stock = this.stocks.find(s => s.id == stockId);
                const currentVal = stock.price * quantity;
                const sectorIcon = SECTOR_ICONS[stock.sector] || '📊';
                const div = document.createElement('div');
                div.className = 'portfolio-item';
                div.innerHTML = `
                    <span class="port-name">${sectorIcon} ${stock.name} ${quantity}주</span>
                    <span class="port-detail">${currentVal.toLocaleString()}원</span>
                `;
                myStocksEl.appendChild(div);
            }
        });

        if (!hasStocks) {
            myStocksEl.innerHTML = '<p class="empty-text">아직 보유한 주식이 없습니다.</p>';
        }
    }

    animateValue(elementId, newValue) {
        const el = document.getElementById(elementId);
        if (!el) return;
        if (el.textContent !== newValue) {
            el.textContent = newValue;
            el.classList.add('bump');
            setTimeout(() => el.classList.remove('bump'), 300);
        }
    }
}

// =============================================
// 게임 시작
// =============================================
const game = new Game();
game.init();
