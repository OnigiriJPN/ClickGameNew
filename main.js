let score = 0;
const scoreEl = document.getElementById("score");
const clickerBtn = document.getElementById("clickerBtn");
const slotsContainer = document.getElementById("slotsContainer");
const addSlotBtn = document.getElementById("addSlotBtn");
const newGameBtn = document.getElementById("newGameBtn");
const clickSound = document.getElementById("clickSound");
const slotSound = document.getElementById("slotSound");

let slots = [];
let achievements = JSON.parse(localStorage.getItem('achievements') || '{}');

// クリックでポイント加算
clickerBtn.addEventListener("click", () => {
    score++;
    scoreEl.textContent = score;
    clickSound.currentTime = 0;
    clickSound.play();
    localStorage.setItem("score", score);
    checkAchievements();
});

// スロット作成
function createSlot(name = "スロット") {
    const slot = document.createElement("div");
    slot.classList.add("slot", "fade-in");
    slot.textContent = name;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => removeSlot(slot));
    slot.appendChild(deleteBtn);

    // 名前変更（ダブルクリック）
    slot.addEventListener("dblclick", () => {
        const newName = prompt("スロット名を入力", slot.childNodes[0].textContent);
        if (newName) slot.childNodes[0].textContent = newName;
        saveSlots();
    });

    slotsContainer.appendChild(slot);
    slotSound.currentTime = 0;
    slotSound.play();

    slots.push({ name });
    saveSlots();
    checkAchievements();
}

// スロット削除
function removeSlot(slot) {
    slot.classList.add("fade-out");
    slotSound.currentTime = 0;
    slotSound.play();
    setTimeout(() => {
        slotsContainer.removeChild(slot);
        slots = slots.filter(s => s.name !== slot.childNodes[0].textContent);
        saveSlots();
        checkAchievements();
    }, 300);
}

// スロット追加
addSlotBtn.addEventListener("click", () => createSlot("スロット" + (slots.length + 1)));

// ニューゲーム
newGameBtn.addEventListener("click", () => {
    score = 0;
    scoreEl.textContent = score;
    slotsContainer.innerHTML = '';
    slots = [];
    achievements = {};
    localStorage.removeItem("score");
    localStorage.removeItem("slots");
    localStorage.removeItem("achievements");
});

// 自動増加バフ
setInterval(() => {
    score += slots.length;
    scoreEl.textContent = score;
    localStorage.setItem("score", score);
    checkAchievements();
}, 1000);

// ローカル保存
function saveSlots() {
    localStorage.setItem("slots", JSON.stringify(slots));
}

// ロード時復元
window.addEventListener("load", () => {
    score = parseInt(localStorage.getItem("score") || 0);
    scoreEl.textContent = score;
    const savedSlots = JSON.parse(localStorage.getItem("slots") || '[]');
    savedSlots.forEach(s => createSlot(s.name));
});

// 実績チェック
function checkAchievements() {
    if (slots.length >= 5 && !achievements['5slots']) {
        achievements['5slots'] = true;
        score += 10;
        showAchievement("スロット5個達成！+10ポイント");
        localStorage.setItem("score", score);
    }
    if (score >= 100 && !achievements['score100']) {
        achievements['score100'] = true;
        showAchievement("スコア100達成！");
        levelUpAnimation();
        localStorage.setItem("score", score);
    }
    localStorage.setItem('achievements', JSON.stringify(achievements));
}

// 実績演出
function showAchievement(text) {
    const achEl = document.createElement('div');
    achEl.classList.add('achievement');
    achEl.textContent = text;
    document.body.appendChild(achEl);

    achEl.animate([
        { transform: 'translateY(-50px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
        { transform: 'translateY(-50px)', opacity: 0 }
    ], { duration: 2000 });

    setTimeout(() => achEl.remove(), 2000);
}

// レベルアップアニメーション
function levelUpAnimation() {
    scoreEl.style.animation = 'levelUp 0.5s';
    scoreEl.addEventListener('animationend', () => scoreEl.style.animation = '');
}

// --- クラウド同期（GitHub Gist / OAuth） ---
// GitHub OAuth token は localStorage に保存されている想定
async function saveToGithub() {
    const token = localStorage.getItem('github_token');
    if (!token) return;
    const data = { score, slots, achievements };
    const response = await fetch('https://api.github.com/repos/USERNAME/REPO/contents/data.json', {
        method: 'PUT',
        headers: {
            'Authorization': 'token ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'update clicker data',
            content: btoa(JSON.stringify(data))
        })
    });
    return response.json();
}

async function loadFromGithub() {
    const token = localStorage.getItem('github_token');
    if (!token) return;
    const response = await fetch('https://api.github.com/repos/USERNAME/REPO/contents/data.json', {
        headers: { 'Authorization': 'token ' + token }
    });
    const data = await response.json();
    const jsonData = JSON.parse(atob(data.content));
    score = jsonData.score;
    slots = jsonData.slots;
    achievements = jsonData.achievements || {};
    scoreEl.textContent = score;
    slotsContainer.innerHTML = '';
    slots.forEach(s => createSlot(s.name));
}
