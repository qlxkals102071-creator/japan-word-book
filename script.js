// ============================================================
// [중요] 구글 시트 CSV 링크 (주인님 링크로 꼭 바꿔주세요!)
// ============================================================
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGxiRP3J-FthdSErZu8BhWc85O2_eeOGqYaX_YILIqoB0HbZBGkLFsOCsoe55-0ZTzVKLxpicjie4n/pub?gid=0&single=true&output=csv";
// ============================================================

// 기본 데이터 (히라가나/카타카나)
// 기본 데이터 (한글 발음으로 변경!)
const hiraganaRaw = {
    'あ': '아', 'い': '이', 'う': '우', 'え': '에', 'お': '오', 'か': '카', 'き': '키', 'く': '쿠', 'け': '케', 'こ': '코', 'さ': '사', 'し': '시', 'す': '스', 'せ': '세', 'そ': '소', 'た': '타', 'ち': '치', 'つ': '츠', 'て': '테', 'と': '토', 'な': '나', 'に': '니', 'ぬ': '누', 'ね': '네', 'の': '노', 'は': '하', 'ひ': '히', 'ふ': '후', 'へ': '헤', 'ほ': '호', 'ま': '마', 'み': '미', 'む': '무', 'め': '메', 'も': '모', 'や': '야', 'ゆ': '유', 'よ': '요', 'ら': '라', 'り': '리', 'る': '루', 'れ': '레', 'ろ': '로', 'わ': '와', 'を': '오', 'ん': '응',
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

// 데이터 변수
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

// 🦊 [핵심] 앱이 켜지자마자 실행되는 함수!
window.onload = async function () {
    await loadSheetData(); // 데이터부터 가져와!
};

// --- 구글 시트 불러오기 (캐시 박살내기 적용!) ---
async function loadSheetData() {
    if (GOOGLE_SHEET_URL.includes("여기에")) {
        alert("스크립트 파일에서 구글 시트 주소를 수정해주세요!");
        document.getElementById('loading-screen').style.display = 'none';
        showScreen('start-screen'); // 에러나도 일단 시작화면은 보여줌
        return;
    }

    try {
        // [강력한 새로고침] 주소 뒤에 시간을 붙여서 매번 새롭게 요청함!
        const uniqueUrl = GOOGLE_SHEET_URL + "&t=" + new Date().getTime();

        const response = await fetch(uniqueUrl);
        const text = await response.text();
        fullSheetData = parseCSV(text);

        console.log("불러온 데이터 개수:", fullSheetData.length); // F12 눌러서 확인 가능

        if (fullSheetData.length === 0) {
            alert("데이터를 가져왔는데 내용이 없어요 ㅠㅠ");
        }

        // 로딩 끝! 로딩 화면 끄고 시작 화면 보여주기
        document.getElementById('loading-screen').style.display = 'none';
        showScreen('start-screen');

    } catch (error) {
        console.error(error);
        alert("인터넷 연결을 확인해주세요! 데이터를 못 가져왔어요.");
        document.getElementById('loading-screen').style.display = 'none';
        showScreen('start-screen');
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
            const category = parts[3] ? parts[3].trim().replace(/^"|"$/g, '') : '기타';

            if (jp && mean) {
                data.push({ jp: jp, pron: pron, mean: mean, category: category });
            }
        }
    });
    return data;
}

// [NEW] 버튼 누르면 분류 선택 화면으로 이동
function showCategorySelect() {
    if (fullSheetData.length === 0) {
        alert("데이터 로딩에 실패해서 단어장을 열 수 없어요 ㅠㅠ\n새로고침 해보세요!");
        return;
    }
    showScreen('category-select-screen');
}

// 카테고리 선택 후 모드 선택으로 이동
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

// --- 기본 로직 ---
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

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function goHome() {
    if (confirm("처음 화면으로 돌아갈까요?")) {
        showScreen('start-screen');
        if (window.speechSynthesis) window.speechSynthesis.cancel();
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

    // 🦊 [수정] 1. 기본 모드(히라/카타)면 무조건 숨김 (정답 스포 방지!)
    // 🦊 [수정] 2. 시트 모드라도 글자가 같으면 숨김 (중복 방지!)
    if (currentMode !== 'sheet' || item.jp === item.pron) {
        document.getElementById('study-pron').innerText = "";
    } else {
        document.getElementById('study-pron').innerText = item.pron;
    }

    document.getElementById('study-jp').innerText = item.jp;
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
    if (currentMode === 'sheet') {
        speakText(item.pron); // 시트는 B열(히라가나) 읽기
    } else {
        speakText(item.jp);   // 히라/카타는 일본어 글자 읽기 (그래야 발음 정확함!)
    }
}

function checkStudyAnswer(isCorrect) {
    const item = quizList[currentIndex];
    if (isCorrect) score++; else wrongList.push(item);
    currentIndex++; updateStudyScreen();
}

// --- 시험 모드 ---
function startTest() {
    isProcessing = false;
    let temp = [...currentDataList];
    temp.sort(() => Math.random() - 0.5);

    const qCount = Math.min(TEST_QUESTION_COUNT, temp.length);
    quizList = temp.slice(0, qCount);

    wrongList = []; currentIndex = 0; score = 0;
    renderTestQuestion(); showScreen('test-screen');
}

// 시험 문제 표시 함수 (문자 시험일 땐 소리 버튼 압수!)
function renderTestQuestion() {
    if (currentIndex >= quizList.length) { finishGame(); return; }
    isProcessing = false;
    const correctItem = quizList[currentIndex];
    currentTestItem = correctItem;

    // 1. 발음 텍스트(작은 글씨) 숨기기 로직 (아까 한 거)
    if (currentMode !== 'sheet' || correctItem.jp === correctItem.pron) {
        document.getElementById('test-pron').innerText = "";
    } else {
        document.getElementById('test-pron').innerText = correctItem.pron;
    }

    // 2. 일본어(큰 글씨) 표시
    document.getElementById('test-jp').innerText = correctItem.jp;
    document.getElementById('test-progress').innerText = `${currentIndex + 1} / ${quizList.length}`;

    // 🦊 [NEW] 소리 버튼 숨기기 (여기가 핵심!) 🦊
    // 히라가나/카타카나 모드(문자 공부)일 때는 소리 들으면 바로 정답이니까 버튼을 없애버려요!
    const soundBtn = document.querySelector('.btn-test-sound');
    if (currentMode !== 'sheet') {
        soundBtn.style.display = 'none'; // 버튼 숨김! (커닝 방지)
    } else {
        soundBtn.style.display = 'inline-block'; // 단어장일 땐 보여줌!
    }

    // 3. 정답 보기 버튼들 만들기 (기존 그대로)
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


// ============================================================
// 🦊 [업그레이드] 전체 목록 & 상세 보기 (이전/다음 버튼 기능)
// ============================================================

// 1. 전체 목록 화면 보여주기
function showTotalList() {
    const tbody = document.getElementById('total-list-body');
    tbody.innerHTML = '';

    currentDataList.forEach((item, index) => {
        const tr = document.createElement('tr');
        // 🦊 [중요] 단어를 누르면 그 단어의 '번호표(index)'를 가지고 상세 화면으로 이동!
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

// 🦊 현재 보고 있는 단어의 번호를 기억하는 '전역 변수' (장부)
let currentDetailIndex = 0;

// 2. 상세 보기 화면 보여주기
function showDetailView(index) {
    // 안전장치: 없는 번호를 보여달라고 하면 무시!
    if (index < 0 || index >= currentDataList.length) return;

    currentDetailIndex = index; // 장부에 현재 번호 기록!
    const item = currentDataList[currentDetailIndex];

    // 화면 업데이트
    if (currentMode !== 'sheet' || item.jp === item.pron) {
        document.getElementById('detail-pron').innerText = "";
    } else {
        document.getElementById('detail-pron').innerText = item.pron;
    }

    document.getElementById('detail-jp').innerText = item.jp;
    document.getElementById('detail-meaning').innerText = item.mean;

    showScreen('detail-view-screen');
}

// 3. [이전] 버튼 기능
function showPrevDetail() {
    if (currentDetailIndex > 0) {
        showDetailView(currentDetailIndex - 1); // 번호 - 1
    } else {
        alert("첫 번째 단어예요콩! 🦊");
    }
}

// 4. [다음] 버튼 기능
function showNextDetail() {
    if (currentDetailIndex < currentDataList.length - 1) {
        showDetailView(currentDetailIndex + 1); // 번호 + 1
    } else {
        alert("마지막 단어예요콩! 🦊");
    }
}

// 5. 소리 듣기
function playDetailSound() {
    const item = currentDataList[currentDetailIndex]; // 장부에서 현재 단어 찾기
    if (item) {
        if (currentMode === 'sheet') speakText(item.pron);
        else speakText(item.jp);
    }
}

// 6. 목록으로 돌아가기
function backToList() {
    showScreen('list-view-screen');
}