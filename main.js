// ======== グローバル変数 ========
let score = 0;
let slots = [];
let achievements = JSON.parse(localStorage.getItem('achievements')) || {};

const scoreEl = document.getElementById('score');
const clickBtn = document.getElementById('clickBtn');
const slotsContainer = document.getElementById('slotsContainer');
const githubLoginBtn = document.getElementById('githubLoginBtn');

// 効果音
const clickSound = new Audio('click.mp3');
const slotSound = new Audio('slot.mp3');

// ======== クリック処理 ========
clickBtn.addEventListener('click', () => {
    score++;
    scoreEl.textContent = score;

    clickBtn.style.transform = 'scale(1.1)';
    setTimeout(() => clickBtn.style.transform = 'scale(1)', 100);

    clickSound.play();
    checkAchievements();
    saveToGithub();
});

// ======== スロット操作 ========
function createSlot(name='Slot') {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.textContent = name;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.onclick = () => removeSlot(slot);

    slot.appendChild(deleteBtn);
    slotsContainer.appendChild(slot);

    slotSound.play();
    slot.style.opacity = 0;
    setTimeout(() => slot.style.opacity = 1, 50); // fade in

    slots.push({name});
    localStorage.setItem('slots', JSON.stringify(slots));
    saveToGithub();
}

function removeSlot(slotEl) {
    slotEl.style.opacity = 0; // fade out
    setTimeout(() => slotEl.remove(), 300);

    const index = slots.findIndex(s => s.name === slotEl.textContent.replace('✕',''));
    if(index>=0) slots.splice(index,1);

    slotSound.play();
    localStorage.setItem('slots', JSON.stringify(slots));
    saveToGithub();
}

// ======== 実績チェック ========
function checkAchievements() {
    if(slots.length >= 5 && !achievements['5slots']){
        achievements['5slots']=true;
        score += 10;
        showAchievement("スロット5個達成！+10ポイント");
        levelUpAnimation(true);
    }
    if(slots.length >= 10 && !achievements['10slots']){
        achievements['10slots']=true;
        score += 50;
        showAchievement("スロット10個達成！+50ポイント");
        levelUpAnimation(true);
    }
    if(score >= 100 && !achievements['score100']){
        achievements['score100']=true;
        showAchievement("スコア100達成！");
        levelUpAnimation(true);
    }
    if(score >= 500 && !achievements['score500']){
        achievements['score500']=true;
        showAchievement("スコア500達成！");
        levelUpAnimation(true);
    }

    localStorage.setItem('achievements', JSON.stringify(achievements));
    scoreEl.textContent = score;
}

// ======== 実績表示 ========
function showAchievement(msg){
    const div = document.createElement('div');
    div.className = 'achievement';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(()=>div.remove(),3000);
}

// ======== レベルアップアニメ ========
function levelUpAnimation(big=false){
    scoreEl.style.animation = big ? 'levelUpBig 1s' : 'levelUp 0.5s';
    scoreEl.addEventListener('animationend',()=>scoreEl.style.animation='');
}

// ======== GitHub OAuth ログイン ========
const clientId = 'YOUR_CLIENT_ID';
const redirectUri = window.location.origin + window.location.pathname;

githubLoginBtn.addEventListener('click', () => {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
});

window.addEventListener('load', async ()=>{
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if(code){
        const token = await exchangeCodeForToken(code);
        localStorage.setItem('github_token', token);
        window.history.replaceState({}, document.title, redirectUri);
        loadFromGithub();
    }
});

// サーバー経由でトークン取得
async function exchangeCodeForToken(code){
    const resp = await fetch('/.netlify/functions/exchange_token',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({code})
    });
    const data = await resp.json();
    return data.access_token;
}

// ======== GitHubクラウド同期 ========
async function saveToGithub(){
    const token = localStorage.getItem('github_token');
    if(!token) return;

    const data = { score, slots, achievements };
    await fetch('https://api.github.com/repos/USERNAME/REPO/contents/data.json',{
        method:'PUT',
        headers:{
            'Authorization':'token '+token,
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            message:'update clicker data',
            content:btoa(JSON.stringify(data))
        })
    });
}

async function loadFromGithub(){
    const token = localStorage.getItem('github_token');
    if(!token) return;

    const resp = await fetch('https://api.github.com/repos/USERNAME/REPO/contents/data.json',{
        headers:{ 'Authorization':'token '+token }
    });
    const data = await resp.json();
    const jsonData = JSON.parse(atob(data.content));

    score = jsonData.score;
    slots = jsonData.slots;
    achievements = jsonData.achievements || {};

    scoreEl.textContent = score;
    slotsContainer.innerHTML='';
    slots.forEach(s=>createSlot(s.name));
}

// ======== 自動増加バフ ========
setInterval(()=>{
    if(slots.length>0){
        score += slots.length; // スロット数に応じて自動増加
        scoreEl.textContent = score;
        checkAchievements();
    }
},1000);
