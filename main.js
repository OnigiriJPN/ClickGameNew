let score=0,scoreEl=document.getElementById("score"),clickerBtn=document.getElementById("clickerBtn"),slotsContainer=document.getElementById("slotsContainer"),addSlotBtn=document.getElementById("addSlotBtn"),newGameBtn=document.getElementById("newGameBtn"),clickSound=document.getElementById("clickSound"),slotSound=document.getElementById("slotSound"),slots=[];

clickerBtn.addEventListener("click",()=>{score++;scoreEl.textContent=score;clickSound.currentTime=0;clickSound.play();localStorage.setItem("score",score)});

function createSlot(name="スロット"){
    let slot=document.createElement("div");slot.classList.add("slot","fade-in");
    slot.textContent=name;
    let deleteBtn=document.createElement("button");deleteBtn.textContent="削除";
    deleteBtn.addEventListener("click",()=>removeSlot(slot));
    slot.appendChild(deleteBtn);

    slot.addEventListener('dblclick',()=>{
        let newName=prompt("スロット名を入力",slot.childNodes[0].textContent);
        if(newName) slot.childNodes[0].textContent=newName;
    });

    slotsContainer.appendChild(slot);
    slotSound.currentTime=0;slotSound.play();
    slots.push({name});localStorage.setItem("slots",JSON.stringify(slots));
}

function removeSlot(slot){
    slot.classList.add("fade-out");
    slotSound.currentTime=0;slotSound.play();
    setTimeout(()=>{slotsContainer.removeChild(slot);slots=slots.filter(s=>s.name!==slot.childNodes[0].textContent);localStorage.setItem("slots",JSON.stringify(slots))},300);
}

addSlotBtn.addEventListener("click",()=>createSlot("スロット"+(slots.length+1)));

newGameBtn.addEventListener("click",()=>{
    score=0;scoreEl.textContent=score;slotsContainer.innerHTML="";slots=[];
    localStorage.removeItem("score");localStorage.removeItem("slots");
});

// 自動増加バフ
setInterval(()=>{score+=slots.length;scoreEl.textContent=score;localStorage.setItem("score",score)},1000);

// ロード時復元
window.addEventListener("load",()=>{
    let savedScore=parseInt(localStorage.getItem("score")||0);score=savedScore;scoreEl.textContent=score;
    let savedSlots=JSON.parse(localStorage.getItem("slots")||'[]');savedSlots.forEach(s=>createSlot(s.name));
});
