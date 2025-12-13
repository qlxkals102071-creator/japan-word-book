// ============================================================
// 🦊 [설정] 구글 시트 CSV 링크
// ============================================================
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGxiRP3J-FthdSErZu8BhWc85O2_eeOGqYaX_YILIqoB0HbZBGkLFsOCsoe55-0ZTzVKLxpicjie4n/pub?gid=0&single=true&output=csv";

// ============================================================
// 🦊 0. 데이터 정의 (히라가나, 카타카나, 행 데이터)
// ============================================================
const hiraganaRaw = {
    'あ': '아', 'い': '이', 'う': '우', 'え': '에', 'お': '오',
    'か': '카', 'き': '키', 'く': '쿠', 'け': '케', 'こ': '코',
    'さ': '사', 'し': '시', 'す': '스', 'せ': '세', 'そ': '소',
    'た': '타', 'ち': '치', 'つ': '츠', 'て': '테', 'と': '토',
    'な': '나', 'に': '니', 'ぬ': '누', 'ね': '네', 'の': '노',
    'は': '하', 'ひ': '히', 'ふ': '후', 'へ': '헤', 'ほ': '호',
    'ま': '마', 'み': '미', 'む': '무', 'め': '메', 'も': '모',
    '나': '나', '니': '니', '누': '누', '네': '네', '노': '노', // 중복 방지용 안전장치
    '야': '야', '유': '유', '요': '요',
    '라': '라', '리': '리', '루': '루', '레': '레', '로': '로',
    '와': '와', '오': '오', '응': '응', 'ん': '응',
    'わ': '와', 'を': '오',
    'が': '가', 'ぎ': '기', 'ぐ': '구', 'げ': '게', 'ご': '고',
    'ざ': '자', 'じ': '지', 'ず': '즈', 'ぜ': '제', 'ぞ': '조',
    'だ': '다', 'ぢ': '지', 'づ': '즈', 'で': '데', 'ど': '도',
    'ば': '바', 'び': '비', 'ぶ': '부', 'べ': '베', 'ぼ': '보',
    'ぱ': '파', 'ぴ': '피', 'ぷ': '푸', 'ぺ': '페', 'ぽ': '포'
};

const katakanaRaw = {
    'ア': '아', 'イ': '이', 'ウ': '우', 'エ': '에', 'オ': '오',
    'カ': '카', 'キ': '키', 'ク': '쿠', 'ケ': '케', 'コ': '코',
    'サ': '사', 'シ': '시', 'ス': '스', 'セ': '세', 'ソ': '소',
    'タ': '타', 'チ': '치', 'ツ': '츠', 'テ': '테', 'ト': '토',
    'ナ': '나', 'ニ': '니', 'ヌ': '누', 'ネ': '네', 'ノ': '노',
    'ハ': '하', 'ヒ': '히', 'フ': '후', '헤': '헤', 'ホ': '호', 'ヘ': '헤',
    'マ': '마', 'ミ': '미', 'ム': '무', '메': '메', 'モ': '모', 'メ': '메',
    'ヤ': '야', 'ユ': '유', 'ヨ': '요',
    'ラ': '라', '리': '리', 'ル': '루', 'レ': '레', '로': '로', 'リ': '리', 'ロ': '로',
    'ワ': '와', 'ヲ': '오', 'ン': '응',
    'ガ': '가', 'ギ': '기', 'グ': '구', 'ゲ': '게', 'ゴ': '고',
    'ザ': '자', 'ジ': '지', 'ズ': '즈', 'ゼ': '제', 'ゾ': '조',
    'ダ': '다', 'ヂ': '지', 'ヅ': '즈', 'デ': '데', 'ド': '도',
    'バ': '바', 'ビ': '비', 'ブ': '부', 'ベ': '베', 'ボ': '보',
    'パ': '파', 'ピ': '피', 'プ': '푸', '페': '페', 'ポ': '포', 'ペ': '페'
};

// ★ [수정됨] 행(Row)별 데이터 (카타카나 이름표 + 탁음/반탁음 분리 완벽 적용)
const kanaRows = [
    { 
        name: "아행 (あ)", nameKata: "아행 (ア)",
        basic: ["あ", "い", "う", "え", "お"],
        daku: [], handaku: [] 
    },
    { 
        name: "카행 (か)", nameKata: "카행 (カ)",
        basic: ["か", "き", "く", "け", "こ"],
        daku: ["が", "ぎ", "ぐ", "げ", "ご"],
        handaku: []
    },
    { 
        name: "사행 (さ)", nameKata: "사행 (サ)",
        basic: ["さ", "し", "す", "せ", "そ"],
        daku: ["ざ", "じ", "ず", "ぜ", "ぞ"],
        handaku: []
    },
    { 
        name: "타행 (た)", nameKata: "타행 (タ)",
        basic: ["た", "ち", "つ", "て", "と"],
        daku: ["だ", "ぢ", "づ", "で", "ど"],
        handaku: []
    },
    { 
        name: "나행 (な)", nameKata: "나행 (ナ)",
        basic: ["な", "に", "ぬ", "ね", "の"],
        daku: [], handaku: []
    },
    { 
        name: "하행 (は)", nameKata: "하행 (ハ)",
        basic: ["は", "ひ", "ふ", "へ", "ほ"],
        daku: ["ば", "び", "ぶ", "べ", "ぼ"],
        handaku: ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"]
    },
    { 
        name: "마행 (ま)", nameKata: "마행 (マ)",
        basic: ["ま", "み", "む", "め", "も"],
        daku: [], handaku: []
    },
    { 
        name: "야행 (や)", nameKata: "야행 (ヤ)",
        basic: ["や", "ゆ", "よ"],
        daku: [], handaku: []
    },
    { 
        name: "라행 (ら)", nameKata: "라행 (ラ)",
        basic: ["ら", "り", "る", "れ", "ろ"],
        daku: [], handaku: []
    },
    { 
        name: "와행/응 (わ)", nameKata: "와행/응 (ワ)",
        basic: ["わ", "を", "ん"],
        daku: [], handaku: []
    }
];

function convertToObjArray(rawData) {
    const arr = [];
    for (let key in rawData) {
        if (!key) continue;
        arr.push({ jp: key, pron: rawData[key], mean: rawData[key] });
    }
    return arr;
}

const hiraganaData = convertToObjArray(hiraganaRaw);
const katakanaData = convertToObjArray(katakanaRaw);

// 전역 변수들
let currentMode = '';     
let fullSheetData = [];   
let currentDataList = []; 
let quizList = [];        
let wrongList = [];       
let currentIndex = 0;     
let score = 0;            
const TEST_QUESTION_COUNT = 20;
let isMuted = false;
let isProcessing = false;
let currentTestItem = null;
let currentDetailIndex = 0;
let currentKanaRowData = null; // 현재 선택된 행 데이터

// ============================================================
// 🦊 1. 초기화 및 데이터 로드
// ============================================================
window.onload = async function () {
    await loadSheetData();
};

async function loadSheetData() {
    try {
        console.log("🦊 데이터 로딩 시작...");
        const uniqueUrl = GOOGLE_SHEET_URL + "&t=" + new Date().getTime();
        const response = await fetch(uniqueUrl);
        const text = await response.text();
        fullSheetData = parseCSV(text);

        if (fullSheetData.length === 0) {
            alert("데이터를 가져왔는데 내용이 없어요 ㅠㅠ");
        } else {
            try {
                generateCategoryButtons(); 
            } catch (e) {
                console.error("버튼 생성 중 에러 발생:", e);
            }
        }
        
        document.getElementById('loading-screen').style.display = 'none';
        showScreen('start-screen');
        
    } catch (error) {
        console.error(error);
        alert("인터넷 연결을 확인해주세요! 데이터를 못 가져왔어요.");
        document.getElementById('loading-screen').style.display = 'none';
        showScreen('start-screen');
    }
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const data = [];
    lines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 3) {
            const jp = parts[0].trim().replace(/^"|"$/g, '');
            const pron = parts[1].trim().replace(/^"|"$/g, '');
            const mean = parts[2].trim().replace(/^"|"$/g, '');
            const category = parts[3] ? parts[3].trim().replace(/^"|"$/g, '') : '기타';

            if (jp && mean) {
                data.push({ jp: jp, pron: pron, mean: mean, category: category });
            }
        }
    });
    return data;
}

// ============================================================
// 🦊 2. 화면 전환 및 공통 헤더 제어
// ============================================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    window.scrollTo(0, 0);
    updateGlobalHeader(screenId);
}

function updateGlobalHeader(currentScreenId) {
    const header = document.getElementById('global-header');
    const backBtn = document.getElementById('btn-global-back');
    const titleArea = document.getElementById('header-title');

    if (currentScreenId === 'start-screen') {
        header.style.display = 'none';
        return; 
    } 

    header.style.display = 'flex';
    if(titleArea) titleArea.innerText = "";

    backBtn.onclick = function() {
        if (currentScreenId === 'mode-select-screen') {
            if (currentMode === 'sheet') {
                showScreen('category-select-screen'); 
            } else {
                showScreen('letter-select-screen'); 
            }
        }
        else if (currentScreenId === 'letter-select-screen') goHome(true);
        else if (currentScreenId === 'kana-row-select-screen') showScreen('letter-select-screen');
        else if (currentScreenId === 'kana-study-screen') showScreen('kana-row-select-screen');
        else if (currentScreenId === 'category-select-screen') goHome(true);
        else if (currentScreenId === 'list-view-screen') showScreen('mode-select-screen');
        else if (currentScreenId === 'detail-view-screen') showScreen('list-view-screen');
        else if (currentScreenId === 'test-screen') {
            if(confirm("시험을 그만두고 나갈까요콩?")) showScreen('mode-select-screen');
        }
        else goHome(true);
    };
}

function goHome(isForce) {
    if (isForce || confirm("처음 화면으로 돌아갈까요?")) {
        showScreen('start-screen');
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
}

// ============================================================
// 🦊 3. 메뉴 및 카테고리 (여기가 문제였을 수 있음!)
// ============================================================

// ★ [필수] 문자 선택 화면 보여주기 (이 함수가 있어야 버튼이 작동함!)
function showLetterSelect() {
    showScreen('letter-select-screen');
}

// ★ [수정됨] 문자 행 선택 (히라/카타 분기 + 올바른 이름표)
function showKanaRowSelect(type) {
    currentMode = type; 
    
    const listArea = document.getElementById('kana-row-list-area');
    if (!listArea) return;
    
    listArea.innerHTML = ''; 

    kanaRows.forEach(row => {
        const btn = document.createElement('button');
        btn.className = 'btn-sheet';
        btn.style.backgroundColor = (type === 'hiragana') ? '#FFD700' : '#FFA500'; 
        btn.style.color = (type === 'hiragana') ? '#333' : 'white';
        
        // ★ 여기서 카타카나면 nameKata를 보여줍니다!
        if (type === 'katakana') {
            btn.innerText = row.nameKata; 
        } else {
            btn.innerText = row.name;     
        }

        btn.onclick = () => showKanaStudy(row);
        listArea.appendChild(btn);
    });

    showScreen('kana-row-select-screen');
}

// ★ [수정됨] 행 학습 화면 (탭 + 루비 스타일 카드)
function showKanaStudy(row) {
    currentKanaRowData = row; 
    const titleEl = document.getElementById('kana-study-title');
    if (titleEl) titleEl.innerText = `${row.name} 공부`;

    // 탭 그리기
    renderKanaTabs('basic'); 
    showScreen('kana-study-screen');
}

// 탭 버튼 생성기
function renderKanaTabs(activeType) {
    const tabContainer = document.getElementById('kana-tab-container');
    const row = currentKanaRowData;
    if (!tabContainer || !row) return;
    
    tabContainer.innerHTML = ''; 

    const tabs = [{ id: 'basic', label: '기본 (청음)' }];
    if (row.daku && row.daku.length > 0) tabs.push({ id: 'daku', label: '탁음 (゛)' });
    if (row.handaku && row.handaku.length > 0) tabs.push({ id: 'handaku', label: '반탁음 (゜)' });

    if (tabs.length === 1) {
        tabContainer.style.display = 'none';
        renderKanaCards('basic'); 
        return;
    } 

    tabContainer.style.display = 'flex';
    tabs.forEach(tab => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        if (tab.id === activeType) btn.classList.add('active'); 
        btn.innerText = tab.label;
        btn.onclick = () => renderKanaTabs(tab.id); 
        tabContainer.appendChild(btn);
    });

    renderKanaCards(activeType);
}

// 카드 생성기 (루비 스타일: 위가 발음, 아래가 글자)
function renderKanaCards(type) {
    const container = document.getElementById('kana-card-container');
    const row = currentKanaRowData;
    if (!container || !row) return;

    container.innerHTML = ''; 
    let targetChars = [];
    if (type === 'basic') targetChars = row.basic;
    else if (type === 'daku') targetChars = row.daku;
    else if (type === 'handaku') targetChars = row.handaku;

    targetChars.forEach(char => {
        let displayChar = char;
        let pron = hiraganaRaw[char]; 

        // 카타카나 변환 로직 (발음으로 역추적)
        if (currentMode === 'katakana') {
            for (let [k, v] of Object.entries(katakanaRaw)) {
                if (v === pron) {
                    displayChar = k;
                    break;
                }
            }
        }

        const card = document.createElement('div');
        card.className = 'kana-card';
        card.onclick = () => {
            speakText(displayChar);
            card.style.backgroundColor = "#e6f7ff";
            setTimeout(() => card.style.backgroundColor = "#ffffff", 200);
        };

        // ★ 발음(pron)이 위, 글자(char)가 아래!
        card.innerHTML = `
            <div class="kana-pron">${pron || '?'}</div>
            <div class="kana-char">${displayChar}</div>
        `;
        container.appendChild(card);
    });
}

// 단어장 버튼
function showCategorySelect() {
    if (fullSheetData.length === 0) {
        alert("데이터 로딩 실패 ㅠㅠ");
        return;
    }
    showScreen('category-select-screen');
}

// 자동 생성
function generateCategoryButtons() {
    const listArea = document.getElementById('category-list-area');
    if (!listArea) return; 

    listArea.innerHTML = ''; 
    const categories = [...new Set(fullSheetData.map(item => item.category))];

    categories.forEach(categoryName => {
        if (!categoryName) return; 
        const btn = document.createElement('button');
        btn.className = 'btn-sheet'; 
        btn.innerHTML = `📂 ${categoryName} 단어`;
        btn.onclick = function() { selectSheetCategory(categoryName); };
        listArea.appendChild(btn);
    });
}

function selectSheetCategory(categoryName) {
    currentDataList = fullSheetData.filter(item => item.category === categoryName);
    if (currentDataList.length === 0) {
        alert("단어가 없어요!");
        return;
    }
    currentMode = 'sheet';
    document.getElementById('selected-mode-title').innerText = categoryName;
    showScreen('mode-select-screen');
}

function selectCharType(type) {
    showKanaRowSelect(type);
}

// ============================================================
// 🦊 4. 학습 & 시험 (리스트, 20문제)
// ============================================================

function startStudyList() {
    showTotalList();
}

function showTotalList() {
    const tbody = document.getElementById('total-list-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    currentDataList.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.onclick = () => showDetailView(index);
        tr.style.cursor = 'pointer';
        tr.innerHTML = `
            <td style="font-weight:bold; color:#FF8C00;">${item.jp}</td>
            <td>${item.pron}</td>
            <td>${item.mean}</td>
        `;
        tbody.appendChild(tr);
    });
    showScreen('list-view-screen');
}

function showDetailView(index) {
    if (index < 0 || index >= currentDataList.length) return;
    currentDetailIndex = index;
    const item = currentDataList[currentDetailIndex];

    if (currentMode !== 'sheet' || item.jp === item.pron) {
        document.getElementById('detail-pron').innerText = "";
    } else {
        document.getElementById('detail-pron').innerText = item.pron;
    }

    setSmartText('detail-jp', item.jp);
    document.getElementById('detail-meaning').innerText = item.mean;
    showScreen('detail-view-screen');
}

function showPrevDetail() {
    if (currentDetailIndex > 0) showDetailView(currentDetailIndex - 1);
    else alert("첫 번째 단어예요! 🦊");
}

function showNextDetail() {
    if (currentDetailIndex < currentDataList.length - 1) showDetailView(currentDetailIndex + 1);
    else alert("마지막 단어예요! 🦊");
}

function playDetailSound() {
    const item = currentDataList[currentDetailIndex];
    if (item) {
        if (currentMode === 'sheet') speakText(item.pron);
        else speakText(item.jp);
    }
}

// ============================================================
// 🦊 5. 시험 모드
// ============================================================
function startTest() {
    isProcessing = false;
    let temp = [...currentDataList];
    temp.sort(() => Math.random() - 0.5);

    const qCount = Math.min(TEST_QUESTION_COUNT, temp.length);
    quizList = temp.slice(0, qCount);
    wrongList = []; currentIndex = 0; score = 0;
    
    renderTestQuestion(); 
    showScreen('test-screen');
}

function renderTestQuestion() {
    if (currentIndex >= quizList.length) { 
        finishGame();
        return; 
    }
    isProcessing = false;
    const correctItem = quizList[currentIndex];
    currentTestItem = correctItem;

    if (currentMode !== 'sheet' || correctItem.jp === correctItem.pron) {
        document.getElementById('test-pron').innerText = "";
    } else {
        document.getElementById('test-pron').innerText = correctItem.pron;
    }

    setSmartText('test-jp', correctItem.jp);
    document.getElementById('test-progress').innerText = `${currentIndex + 1} / ${quizList.length}`;

    const soundBtn = document.querySelector('.btn-test-sound');
    if (currentMode !== 'sheet') soundBtn.style.display = 'none';
    else soundBtn.style.display = 'inline-block';

    let options = [correctItem];
    if (currentDataList.length >= 3) {
        while (options.length < 3) {
            const randomItem = currentDataList[Math.floor(Math.random() * currentDataList.length)];
            if (!options.some(opt => opt.jp === randomItem.jp)) options.push(randomItem);
        }
    } else {
        options = [...currentDataList];
    }
    options.sort(() => Math.random() - 0.5);

    const container = document.getElementById('options-container');
    container.innerHTML = '';
    options.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'btn-option';
        btn.innerText = item.mean;
        btn.onclick = () => checkTestAnswer(item, correctItem);
        container.appendChild(btn);
    });
}

function playTestSound() {
    if (currentTestItem) {
        if (currentMode === 'sheet') speakText(currentTestItem.pron);
        else speakText(currentTestItem.jp);
    }
}

function checkTestAnswer(selectedItem, correctItem) {
    if (isProcessing) return; 
    isProcessing = true;
    const isCorrect = (selectedItem.jp === correctItem.jp);

    if (isCorrect) { score++; showFeedback(true); }
    else { wrongList.push(correctItem); showFeedback(false); }

    setTimeout(() => { currentIndex++; renderTestQuestion(); }, 800);
}

// ============================================================
// 🦊 6. 공통 기능
// ============================================================
function toggleGlobalMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('global-mute-btn');
    if (isMuted) {
        btn.innerText = '🔇';
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    } else {
        btn.innerText = '🔊';
    }
}

function speakText(text) {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
}

function showFeedback(isCorrect) {
    const box = document.getElementById('feedback-box');
    if (isCorrect) {
        box.innerText = "정답! ⭕"; box.style.color = "green"; box.style.borderColor = "green";
    } else {
        box.innerText = "땡! ❌"; box.style.color = "red"; box.style.borderColor = "red";
    }
    box.style.display = 'flex';
    setTimeout(() => { box.style.display = 'none'; }, 800);
}

function finishGame() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const total = quizList.length;
    const finalScore = total === 0 ? 0 : Math.round((score / total) * 100);
    
    document.getElementById('score-count').innerText = `맞은 개수: ${score} / ${total}`;
    
    const circle = document.querySelector('.score-circle');
    circle.style.background = `conic-gradient(#20B2AA ${finalScore}%, #ddd ${finalScore}%)`;

    let message = "", color = "#333";
    if (finalScore === 100) { message = "완벽해요! 🎉"; color = "#32CD32"; }
    else if (finalScore >= 80) { message = "대단해! 🔥"; color = "#1E90FF"; }
    else if (finalScore >= 60) { message = "잘했어! 👍"; color = "#00CED1"; }
    else { message = "복습 필수! 😭"; color = "red"; }

    const gradeMsg = document.getElementById('grade-msg');
    gradeMsg.innerText = message; 
    gradeMsg.style.color = color;
    document.getElementById('final-score').innerText = `${finalScore} 점`;
    
    if (wrongList.length > 0) document.getElementById('wrong-msg').style.display = 'block';
    else document.getElementById('wrong-msg').style.display = 'none';
    
    showScreen('result-screen');
}

function openWrongList() {
    const tbody = document.getElementById('wrong-table-body');
    tbody.innerHTML = '';
    document.getElementById('wrong-count-display').innerText = `총 ${wrongList.length}개 틀림`;
    wrongList.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item.jp}</td><td>${item.pron}</td><td>${item.mean}</td>`;
        tbody.appendChild(tr);
    });
    document.getElementById('wrong-list-popup').style.display = 'flex';
}

function closeWrongList() {
    document.getElementById('wrong-list-popup').style.display = 'none';
}

function setSmartText(elementId, text) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerText = text;
    const len = text.length;
    if (len <= 2) el.style.fontSize = "100px";
    else if (len === 3) el.style.fontSize = "80px";
    else if (len === 4) el.style.fontSize = "60px";
    else el.style.fontSize = "clamp(30px, 14vw, 55px)"; 
}