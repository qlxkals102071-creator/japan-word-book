// ============================================================
// [중요] 여기에 구글 시트 CSV 링크를 넣어주세요!
// ============================================================
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGxiRP3J-FthdSErZu8BhWc85O2_eeOGqYaX_YILIqoB0HbZBGkLFsOCsoe55-0ZTzVKLxpicjie4n/pub?gid=0&single=true&output=csv";
// ============================================================

// 기본 데이터 (히라가나/카타카나)
const hiraganaRaw = {
    'あ':'a','い':'i','う':'u','え':'e','お':'o','か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko','さ':'sa','し':'shi','す':'su','せ':'se','そ':'so','た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to','な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no','は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho','ま':'ma','み':'mi','む':'mu','め':'me','も':'mo','や':'ya','ゆ':'yu','よ':'yo','ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro','わ':'wa','を':'wo','ん':'n',
    'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go','ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo','だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do','ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo','ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po'
};

const katakanaRaw = {
    'ア':'a','イ':'i','ウ':'u','エ':'e','オ':'o','カ':'ka','キ':'ki','ク':'ku','ケ':'ke','コ':'ko','サ':'sa','シ':'shi','ス':'su','セ':'se','ソ':'so','タ':'ta','チ':'chi','ツ':'tsu','テ':'te','ト':'to','ナ':'na','ニ':'ni','ヌ':'nu','ネ':'ne','ノ':'no','ハ':'ha','ヒ':'hi','フ':'fu','ヘ':'he','ホ':'ho','マ':'ma','ミ':'mi','ム':'mu','メ':'me','モ':'mo','ヤ':'ya','ユ':'yu','ヨ':'yo','ラ':'ra','リ':'ri','ル':'ru','レ':'re','ロ':'ro','ワ':'wa','ヲ':'wo','ン':'n',
    'ガ':'ga','ギ':'gi','グ':'gu','ゲ':'ge','ゴ':'go','ザ':'za','ジ':'ji','ズ':'zu','ゼ':'ze','ゾ':'zo','ダ':'da','ヂ':'ji','ヅ':'zu','デ':'de','ド':'do','バ':'ba','ビ':'bi','ブ':'bu','ベ':'be','ボ':'bo','パ':'pa','ピ':'pi','プ':'pu','ペ':'pe','ポ':'po'
};

// 데이터 변환 함수
function convertToObjArray(rawData) {
    const arr = [];
    for (let key in rawData) {
        if(!key) continue;
        arr.push({ jp: key, pron: rawData[key], mean: rawData[key] }); 
    }
    return arr;
}

const hiraganaData = convertToObjArray(hiraganaRaw);
const katakanaData = convertToObjArray(katakanaRaw);

// 데이터 변수
let currentMode = ''; 
let currentDataList = []; 
let sheetData = []; 
let studyType = ''; 
let quizList = []; 
let wrongList = []; 
let currentIndex = 0; 
let score = 0;
const TEST_QUESTION_COUNT = 20;
let isMuted = false; 
let isProcessing = false; 
let currentTestItem = null;

// --- 구글 시트 불러오기 ---
async function loadSheetData() {
    if (GOOGLE_SHEET_URL.includes("여기에")) {
        alert("구글 시트 주소가 올바르지 않습니다!");
        return;
    }
    document.getElementById('loading-screen').style.display = 'flex';
    try {
        const response = await fetch(GOOGLE_SHEET_URL);
        const text = await response.text();
        sheetData = parseCSV(text);
        
        if (sheetData.length === 0) {
            alert("데이터가 없거나 불러오지 못했어요 ㅠㅠ");
            document.getElementById('loading-screen').style.display = 'none';
            return;
        }
        currentDataList = sheetData;
        currentMode = 'sheet';
        document.getElementById('selected-mode-title').innerText = "단어장 모드";
        document.getElementById('loading-screen').style.display = 'none';
        showScreen('mode-select-screen');
    } catch (error) {
        console.error(error);
        alert("구글 시트 연결 실패! 인터넷을 확인해주세요.");
        document.getElementById('loading-screen').style.display = 'none';
    }
}

// CSV 파싱
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const data = [];
    lines.forEach(line => {
        const parts = line.split(','); 
        if (parts.length >= 3) {
            const jp = parts[0].trim().replace(/^"|"$/g, '');
            const pron = parts[1].trim().replace(/^"|"$/g, '');
            const mean = parts[2].trim().replace(/^"|"$/g, '');
            if(jp && mean) data.push({ jp: jp, pron: pron, mean: mean });
        }
    });
    return data;
}

// --- 기본 로직 ---
function toggleGlobalMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('global-mute-btn');
    if (isMuted) {
        btn.innerText = '🔇';
        if(window.speechSynthesis) window.speechSynthesis.cancel();
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

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function goHome() {
    if(confirm("정말 처음 화면으로 돌아갈까요?")) {
        showScreen('start-screen');
        if(window.speechSynthesis) window.speechSynthesis.cancel();
    }
}

function selectCharType(type) {
    currentMode = type;
    if (type === 'hiragana') {
        currentDataList = hiraganaData;
        document.getElementById('selected-mode-title').innerText = "히라가나";
    } else {
        currentDataList = katakanaData;
        document.getElementById('selected-mode-title').innerText = "카타카나";
    }
    showScreen('mode-select-screen');
}

function gotoQuantitySelect() { showScreen('quantity-select-screen'); }

// --- 공부 모드 ---
function startStudy(amount) {
    studyType = 'study';
    let temp = [...currentDataList];
    temp.sort(() => Math.random() - 0.5);

    if (amount === 'all') quizList = temp; 
    else quizList = temp.slice(0, parseInt(amount)); 
    
    wrongList = []; currentIndex = 0; score = 0;
    updateStudyScreen(); showScreen('study-screen');
}

function updateStudyScreen() {
    if (currentIndex >= quizList.length) { finishGame(); return; }
    const item = quizList[currentIndex];
    
    document.getElementById('study-jp').innerText = item.jp;
    document.getElementById('study-pron').innerText = item.pron;
    document.getElementById('study-progress').innerText = `${currentIndex + 1} / ${quizList.length}`;
    
    const meanDisplay = document.getElementById('study-meaning');
    meanDisplay.style.visibility = 'hidden'; 
    meanDisplay.innerText = '';
}

function playSoundAndShowText() {
    const item = quizList[currentIndex];
    const meanDisplay = document.getElementById('study-meaning');
    meanDisplay.innerText = item.mean; 
    meanDisplay.style.visibility = 'visible';
    speakText(item.jp);
}

function checkStudyAnswer(isCorrect) {
    const item = quizList[currentIndex];
    if (isCorrect) score++; else wrongList.push(item);
    currentIndex++; updateStudyScreen();
}

// --- 시험 모드 ---
function startTest() {
    studyType = 'test'; isProcessing = false;
    let temp = [...currentDataList];
    temp.sort(() => Math.random() - 0.5);
    
    const qCount = Math.min(TEST_QUESTION_COUNT, temp.length);
    quizList = temp.slice(0, qCount);
    
    wrongList = []; currentIndex = 0; score = 0;
    renderTestQuestion(); showScreen('test-screen');
}

function renderTestQuestion() {
    if (currentIndex >= quizList.length) { finishGame(); return; }
    isProcessing = false; 
    const correctItem = quizList[currentIndex];
    currentTestItem = correctItem;
    
    document.getElementById('test-pron').innerText = correctItem.pron;
    document.getElementById('test-jp').innerText = correctItem.jp;
    document.getElementById('test-progress').innerText = `${currentIndex + 1} / ${quizList.length}`;

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

function playTestSound() { if(currentTestItem) speakText(currentTestItem.jp); }

function checkTestAnswer(selectedItem, correctItem) {
    if (isProcessing) return; isProcessing = true;
    const isCorrect = (selectedItem.jp === correctItem.jp);
    
    if (isCorrect) { score++; showFeedback(true); } 
    else { wrongList.push(correctItem); showFeedback(false); }
    
    setTimeout(() => { currentIndex++; renderTestQuestion(); }, 800); 
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
    if(window.speechSynthesis) window.speechSynthesis.cancel();
    const total = quizList.length;
    const finalScore = total === 0 ? 0 : Math.round((score / total) * 100);
    document.getElementById('score-count').innerText = `맞은 개수: ${score} / ${total}`;
    
    let message = "", color = "#333";
    if (finalScore === 100) { message = "완벽해요! 당신은 일본어 천재 여우야콩! 🎉"; color = "#32CD32"; }
    else if (finalScore >= 80) { message = "대단해콩! 아주 조금만 더 하면 만점이야콩! 🔥"; color = "#1E90FF"; }
    else if (finalScore >= 60) { message = "잘했어콩! 합격점이야콩! 👍"; color = "#00CED1"; }
    else if (finalScore >= 40) { message = "절반은 넘었어콩! 조금만 더 힘내자콩! 💪"; color = "#FFA500"; }
    else if (finalScore >= 20) { message = "아직 헷갈리는 게 많구나콩... 복습 필수! 📚"; color = "#FF6347"; }
    else if (finalScore > 0) { message = "이제 시작이야콩! 포기하지 마콩! 🌱"; color = "#FF4500"; }
    else { message = "0점이라니... 찍어도 이것보단 잘 나오겠다콩! 😭"; color = "red"; }

    const gradeMsg = document.getElementById('grade-msg');
    gradeMsg.innerText = message; gradeMsg.style.color = color;
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
    document.querySelector('.popup-scroll-area').scrollTop = 0;
}

function closeWrongList() { 
    document.getElementById('wrong-list-popup').style.display = 'none'; 
}