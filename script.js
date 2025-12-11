// ============================================================
// 🦊 [설정] 구글 시트 CSV 링크
// ============================================================
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGxiRP3J-FthdSErZu8BhWc85O2_eeOGqYaX_YILIqoB0HbZBGkLFsOCsoe55-0ZTzVKLxpicjie4n/pub?gid=0&single=true&output=csv";

// ============================================================
// 🦊 1. 데이터 및 변수 설정
// ============================================================
const hiraganaRaw = {
    'あ': '아', 'い': '이', 'う': '우', 'え': '에', 'お': '오', 'か': '카', 'き': '키', 'く': '쿠', 'け': '케', 'こ': '코', 'さ': '사', 'し': '시', 'す': '스', 'せ': '세', 'そ': '소', 'た': '타', 'ち': '치', 'つ': '츠', 'て': '테', 'と': '토', 'な': '나', 'に': '니', 'ぬ': '누', 'ね': '네', 'の': '노', 'は': '하', 'ひ': '히', 'ふ': '후', 'へ': '헤', 'ほ': '호', 'ま': '마', 'み': '미', 'む': '무', 'め': '메', 'も': '모', 'や': '야', 'ゆ': '유', 'よ': '요', 'ら': '라', 'り': '리', 'る': '루', 'れ': '레', 
    'ろ': '로', 'わ': '와', 'を': '오', 'ん': '응',
    'が': '가', 'ぎ': '기', 'ぐ': '구', 'げ': '게', 'ご': '고', 'ざ': '자', 'じ': '지', 'ず': '즈', 'ぜ': '제', 'ぞ': '조', 'だ': '다', 'ぢ': '지', 'づ': '즈', 'で': '데', 'ど': '도', 'ば': '바', 'び': '비', 'ぶ': '부', 'べ': '베', 'ぼ': '보', 'ぱ': '파', 'ぴ': '피', 'ぷ': '푸', 'ぺ': '페', 'ぽ': '포'
};
const katakanaRaw = {
    'ア': '아', 'イ': '이', 'ウ': '우', 'エ': '에', 'オ': '오', 'カ': '카', 'キ': '키', 'ク': '쿠', 'ケ': '케', 'コ': '코', 'サ': '사', 'シ': '시', 'ス': '스', 'セ': '세', 'ソ': '소', 'タ': '타', '치': '치', 'ツ': '츠', 'テ': '테', 'ト': '토', 'ナ': '나', 'ニ': '니', 'ヌ': '누', '네': '네', 'ノ': '노', 'ハ': '하', 'ヒ': '히', 'フ': '후', '헤': '헤', 'ホ': '호', 'マ': '마', 'ミ': '미', 'ム': '무', '메': '메', 'モ': '모', 'ヤ': '야', 'ユ': '유', 'ヨ': '요', 'ラ': '라', '리': '리', 'ル': '루', 'レ': '레', '로': '로', 'ワ': '와', 'ヲ': '오', 'ン': '응',
    'ガ': '가', 'ギ': '기', 'グ': '구', '게': '게', 'ゴ': '고', 'ザ': '자', 'ジ': '지', 'ズ': '즈', 'ゼ': '제', '조': '조', 'ダ': '다', 'ヂ': '지', 'ヅ': '즈', 'デ': '데', 'ド': '도', 'バ': '바', '비': '비', 'ブ': '부', 'ベ': '베', '보': '보', 'パ': '파', '피': '피', 'プ': '푸', '페': '페', 'ポ': '포'
};

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
let currentMode = '';     // 'sheet'(단어장), 'hiragana', 'katakana'
let fullSheetData = [];   // 구글 시트 전체 데이터
let currentDataList = []; // 현재 선택된 학습 리스트
let quizList = [];        // 퀴즈/공부용 섞인 리스트
let wrongList = [];       // 오답 노트
let currentIndex = 0;     // 현재 문제 번호
let score = 0;            // 점수
const TEST_QUESTION_COUNT = 20;
let isMuted = false;
let isProcessing = false;
let currentTestItem = null;
let currentDetailIndex = 0; // 단어장 상세 보기용 인덱스

// ============================================================
// 🦊 2. 초기화 및 데이터 로드
// ============================================================
window.onload = async function () {
    await loadSheetData(); 
};

async function loadSheetData() {
    try {
        const uniqueUrl = GOOGLE_SHEET_URL + "&t=" + new Date().getTime();
        const response = await fetch(uniqueUrl);
        const text = await response.text();
        fullSheetData = parseCSV(text);

        console.log("불러온 데이터 개수:", fullSheetData.length);

        if (fullSheetData.length === 0) {
            alert("데이터를 가져왔는데 내용이 없어요 ㅠㅠ");
        }
        
        // 로딩 완료 후 시작 화면
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
// 🦊 3. 화면 전환 및 공통 헤더 제어 (핵심!)
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
            if (currentMode === 'sheet') showScreen('category-select-screen'); 
            else goHome(); 
        }
        else if (currentScreenId === 'quantity-select-screen') showScreen('mode-select-screen');
        else if (currentScreenId === 'list-view-screen') showScreen('quantity-select-screen');
        else if (currentScreenId === 'detail-view-screen') showScreen('list-view-screen');
        else if (currentScreenId === 'study-screen' || currentScreenId === 'test-screen') {
            if(confirm("공부를 그만하고 나갈까요콩?")) showScreen('mode-select-screen');
        }
        else if (currentScreenId === 'category-select-screen') goHome();
        else goHome();
    };
}

function goHome() {
    if (confirm("처음 화면으로 돌아갈까요?")) {
        showScreen('start-screen');
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
}

// ============================================================
// 🦊 4. 모드 선택 및 카테고리 로직
// ============================================================

function showCategorySelect() {
    if (fullSheetData.length === 0) {
        alert("데이터 로딩에 실패해서 단어장을 열 수 없어요 ㅠㅠ\n새로고침 해보세요!");
        return;
    }
    showScreen('category-select-screen');
}

function selectSheetCategory(categoryName) {
    currentDataList = fullSheetData.filter(item => item.category === categoryName);
    if (currentDataList.length === 0) {
        alert(`'${categoryName}' 카테고리에 단어가 하나도 없어요!\n구글 시트 D열을 확인해주세요!`);
        return;
    }
    currentMode = 'sheet';
    document.getElementById('selected-mode-title').innerText = categoryName + " 단어";
    showScreen('mode-select-screen');
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

function gotoQuantitySelect() { 
    showScreen('quantity-select-screen'); 
}

// ============================================================
// 🦊 5. 단어 목록 & 상세 보기
// ============================================================

function showTotalList() {
    const tbody = document.getElementById('total-list-body');
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

    // ★ [핵심] 스마트 폰트 크기 조절 함수 사용
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
// 🦊 6. 공부 모드 (카드 뒤집기)
// ============================================================
function startStudy(amount) {
    let temp = [...currentDataList];
    temp.sort(() => Math.random() - 0.5); 

    if (amount === 'all') quizList = temp;
    else quizList = temp.slice(0, parseInt(amount));

    wrongList = [];
    currentIndex = 0; score = 0;
    updateStudyScreen(); 
    showScreen('study-screen');
}

function updateStudyScreen() {
    if (currentIndex >= quizList.length) { 
        finishGame();
        return; 
    }
    const item = quizList[currentIndex];

    if (currentMode !== 'sheet' || item.jp === item.pron) {
        document.getElementById('study-pron').innerText = "";
    } else {
        document.getElementById('study-pron').innerText = item.pron;
    }

    // ★ [핵심] 스마트 폰트 크기 조절 함수 사용
    setSmartText('study-jp', item.jp);

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
    
    if (currentMode === 'sheet') speakText(item.pron);
    else speakText(item.jp);
}

function checkStudyAnswer(isCorrect) {
    const item = quizList[currentIndex];
    if (isCorrect) score++; 
    else wrongList.push(item);
    
    currentIndex++; 
    updateStudyScreen();
}

// ============================================================
// 🦊 7. 시험 모드 (객관식)
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

    // ★ [핵심] 스마트 폰트 크기 조절 함수 사용
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
// 🦊 8. 공통 기능 (소리, 피드백, 결과) 및 [NEW] 스마트 폰트
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
    

    let message = "", color = "#333";
    if (finalScore === 100) { message = "완벽해요! 당신은 일본어 천재! 🎉"; color = "#32CD32"; }
    else if (finalScore >= 80) { message = "대단해! 아주 조금만 더 하면 만점이야! 🔥"; color = "#1E90FF"; }
    else if (finalScore >= 60) { message = "잘했어! 합격점이야! 👍"; color = "#00CED1"; }
    else if (finalScore >= 40) { message = "절반은 넘었어! 조금만 더 힘내자! 💪"; color = "#FFA500"; }
    else if (finalScore >= 20) { message = "아직 헷갈리는 게 많구나... 복습 필수! 📚"; color = "#FF6347"; }
    else if (finalScore > 0) { message = "이제 시작이야! 포기하지 마! 🌱"; color = "#FF4500"; }
    else { message = "0점이라니... 찍어도 이것보단 잘 나오겠다! 😭"; color = "red"; }

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

// ★★★★★ [NEW] 글자 수에 맞춰 폰트 크기 바꿔주는 똑똑한 함수 ★★★★★
function setSmartText(elementId, text) {
    const el = document.getElementById(elementId);
    el.innerText = text;
    
    const len = text.length;

    // 글자 수별 크기 규칙 (원하시는 대로 설정!)
    if (len <= 2) {
        el.style.fontSize = "100px";  // 1~2글자: 엄청 크게
    } else if (len === 3) {
        el.style.fontSize = "80px";   // 3글자: 적당히 크게
    } else if (len === 4) {
        el.style.fontSize = "60px";   // 4글자: 중간
    } else {
        // 5글자 이상: 화면 폭(vw)에 맞춰서 반응형으로 (절대 안 잘림)
        el.style.fontSize = "14vw"; 
    }
}