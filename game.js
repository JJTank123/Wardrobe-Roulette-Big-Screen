/* ======================================================
   CLOTHING BUDGET GAME
   One JS file handles BOTH pages
====================================================== */

/* ---------------- GLOBAL STATE ---------------- */


// Exact placement anchors for mannequin layers
const layerAnchors = {
  top: {
    top: 20,
    width: 220,
    height: 160
  },
  bottom: {
    top: 170,
    width: 200,
    height: 180
  }
};
// Controls visual stacking order
const layerOrder = {

  bottom:1,
  top: 2,

};
// Vertical positioning for each clothing category
const layerOffsets = {
  top: 0,        // shirts stay normal
    // move pants down (adjust this number)
  shoes: 140,
  outerwear: 0,
  accessory: -20
};

const budgets = [70, 90, 120, 150,180,220];

let budget = 0;
let spinning = false;
let totalSpent = 0;

let selectedItems = {};     // { category : itemData }
let currentColors = [];     // color index per clothing item


/* ---------------- CLOTHING DATA ---------------- */

const clothingItems = [
{
  name: "Budget Pick: Tops",
  category: "top",
  price: 35,
  images: ["budget_pick1.png","budget_pick2.png","budget_pick3.png"]
},
{
  name: "Smart Choice: Tops",
  category: "top",
  price: 65,
   yOffset: -20,
  images: ["smart_choice1.png","smart_choice2.png","smart_choice3.png"]
},
{
  name: "Luxury Choice: Tops",
  category: "top",
   yOffset: -8,
  price: 110,
  images: ["luxury_pick1.png","luxury_pick2.png","luxury_pick3.png"]
},
{
  name: "Budget Pick: Bottoms",
  category: "bottom",
  price: 35,
  images: ["budget_pants1.png","budget_pants2.png","budget_pants3.png"]
}
,
{
  name: "Smart Choice: Bottoms",
  category: "bottom",
  price: 65,
  images: ["smart_pants1.png","smart_pants2.png","smart_pants3.png"]
}
,
{
  name: "Luxury Pick: Bottoms",
  category: "bottom",
  price: 110,
  images: ["luxury_pants1.png","luxury_pants2.png","luxury_pants3.png"]
}
];


/* ======================================================
   PAGE DETECTION
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

  // Wheel page
  if (document.getElementById("wheel")) {
    document.fonts.ready.then(initWheel);
    initWheel();
  }

  // Game page
  if (document.getElementById("itemsContainer")) {
    initGame();
  }

});



/* ======================================================
   WHEEL PAGE LOGIC
====================================================== */

function initWheel() {
  drawWheel();
}


function drawWheel() {

  const canvas = document.getElementById("wheel");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const colors = ["#FF6384","#36A2EB","#FFCE56","#8BC34A"];

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = Math.min(centerX, centerY);

  const angleStep = (2 * Math.PI) / budgets.length;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  budgets.forEach((value, i) => {

    const startAngle = i * angleStep;

    ctx.beginPath();
ctx.moveTo(centerX, centerY);
ctx.arc(centerX, centerY, radius, startAngle, startAngle + angleStep);

    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.stroke();

    // text
// text
ctx.save();

ctx.translate(centerX, centerY);
ctx.rotate(startAngle + angleStep / 2);

ctx.textAlign = "right";
ctx.textBaseline = "middle";

ctx.fillStyle = "#222";
ctx.font = "bold 44px Fredoka";
ctx.letterSpacing = "2px";

/* white outline for game look */
ctx.lineWidth = 4;
ctx.strokeStyle = "white";
ctx.strokeText("$" + value, radius - 25, 0);



ctx.fillText("$" + value, radius - 25, 0);

ctx.restore();

  });
}

function spinWheel() {
  const canvas = document.getElementById("wheel");
  if (!canvas || spinning) return;
  spinning = true;

  const segments = budgets.length;
  const segmentAngle = 360 / segments;

  const selectedIndex = Math.floor(Math.random() * segments);
  budget = budgets[selectedIndex];

  const rotationToSlice = (selectedIndex * segmentAngle) + (segmentAngle / 2);
  const totalRotations = 5; 
  const finalRotation = totalRotations * 360 + (270 - rotationToSlice); // pointer at top

  let start = null;
  function animate(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;

    const t = Math.min(elapsed / 4000, 1); // 4s
    const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out

    canvas.style.transform = `rotate(${ease * finalRotation}deg)`;

    if (t < 1) requestAnimationFrame(animate);
    else {
      document.getElementById("budgetDisplay").innerText = "Your Budget: $" + budget;
      document.getElementById("startGameBtn").style.display = "inline-block";
      localStorage.setItem("budget", budget);
      spinning = false;
    }
  }

  requestAnimationFrame(animate);
}


function pointerBounce() {
  const pointer = document.getElementById('stopper');
  pointer.style.transform = 'translateX(-50%) translateY(-10px)';
  setTimeout(() => {
    pointer.style.transform = 'translateX(-50%) translateY(0)';
  }, 100);
}

function launchConfetti() {
  const confettiContainer = document.createElement('div');
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = 0;
  confettiContainer.style.left = 0;
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none';
  document.body.appendChild(confettiContainer);

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.width = '8px';
    confetti.style.height = '8px';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
    confetti.style.top = '0px';
    confetti.style.left = `${Math.random() * window.innerWidth}px`;
    confetti.style.opacity = 1;
    confetti.style.transform = `rotate(${Math.random()*360}deg)`;
    confettiContainer.appendChild(confetti);

    const fall = confetti.animate([
      { transform: `translateY(0px) rotate(${Math.random()*360}deg)`, opacity: 1 },
      { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random()*720}deg)`, opacity: 0 }
    ], {
      duration: 2000 + Math.random() * 1000,
      easing: 'ease-out',
      iterations: 1
    });

    fall.onfinish = () => confetti.remove();
  }

  setTimeout(() => confettiContainer.remove(), 3000);
}



function startGame() {
  if (budget === 0) {
    alert("Spin first!");
    return;
  }
  window.location.href = "game.html";
}


/* ======================================================
   GAME PAGE LOGIC
====================================================== */

function initGame() {

  const savedBudget = localStorage.getItem("budget");

  if (!savedBudget) {
    alert("Spin the wheel first!");
    window.location.href = "index.html";
    return;
  }

  budget = parseInt(savedBudget);
  document.getElementById("budget").innerText = budget;

  currentColors = clothingItems.map(() => 0);

  renderRack();
  updateTotal();
  
}


/* ---------------- RACK RENDER ---------------- */

function renderRack() {

  const container = document.getElementById("itemsContainer");
  container.innerHTML = "";

  clothingItems.forEach((item, i) => {

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <button class="arrow left"
        onclick="prevColor(${i}, event)">&#8592;</button>

      <img src="${item.images[currentColors[i]]}"
           width="60"
           id="img-${i}">

      <button class="arrow right"
        onclick="nextColor(${i}, event)">&#8594;</button>

      <br>${item.name}<br>$${item.price}
    `;

    div.onclick = () => selectItem(i);

    container.appendChild(div);
  });
}


/* ---------------- COLOR CYCLING ---------------- */

function nextColor(index, event) {
  event.stopPropagation();

  const item = clothingItems[index];

  currentColors[index] =
    (currentColors[index] + 1) % item.images.length;

  document.getElementById("img-"+index).src =
    item.images[currentColors[index]];
}

function prevColor(index, event) {
  event.stopPropagation();

  const item = clothingItems[index];

  currentColors[index] =
    (currentColors[index] - 1 + item.images.length)
    % item.images.length;

  document.getElementById("img-"+index).src =
    item.images[currentColors[index]];
}


/* ---------------- SELECT CLOTHING ---------------- */

function selectItem(index) {

  const item = clothingItems[index];
  const category = item.category;

  // remove previous category item
  if (selectedItems[category]) {

    totalSpent -= selectedItems[category].price;

    const oldLayer =
      document.getElementById("layer-" + category);

    if (oldLayer) oldLayer.remove();
  }

  selectedItems[category] = {
    ...item,
    colorIndex: currentColors[index]
  };

  totalSpent += item.price;

  const mannequinLayer =
    document.getElementById("mannequinLayer");

// Remove old slot if exists
const oldLayer = document.getElementById("layer-" + category);
if (oldLayer) oldLayer.remove();

const anchor = layerAnchors[item.category];

// ---------- SLOT ----------
const slot = document.createElement("div");
slot.id = "layer-" + item.category;
slot.style.position = "absolute";
slot.style.left = "50%";
slot.style.transform = "translateX(-50%)";
slot.style.top = anchor.top + "px";
slot.style.width = anchor.width + "px";
slot.style.height = anchor.height + "px";
slot.style.zIndex = layerOrder[item.category] || 1;
slot.style.pointerEvents = "none";

// ---------- IMAGE ----------
const img = document.createElement("img");
img.src = item.images[currentColors[index]];

img.style.width = "100%";
img.style.height = "100%";
img.style.objectFit = "contain"; // ⭐ MAGIC LINE

slot.appendChild(img);
mannequinLayer.appendChild(slot);


  updateTotal();
}


/* ---------------- UI UPDATES ---------------- */

function updateTotal() {

  const totalDisplay =
    document.getElementById("totalSpent");

  totalDisplay.innerText = totalSpent;

  totalDisplay.style.color =
    totalSpent > budget ? "red" : "black";
}


/* ---------------- SUBMIT ---------------- */

function submitOutfit() {

  const drawer = document.getElementById("drawer");

  if (totalSpent === 0) {
    alert("Put clothes on first!");
    return;
  }

  if (totalSpent <= budget) {
    drawer.classList.remove("locked");
    drawer.classList.add("unlocked");
    drawer.innerText = "🗄️ Drawer Unlocked! Code: 371";
  } else {
    alert("Over budget!");
  }
}


/* ---------------- RESET ---------------- */

function resetOutfit() {

  selectedItems = {};
  totalSpent = 0;

  document.getElementById("mannequinLayer").innerHTML = "";

  currentColors = clothingItems.map(() => 0);

  renderRack();
  updateTotal();

  const drawer = document.getElementById("drawer");
  drawer.className = "locked";
  drawer.innerText = "🔒 Locked Drawer";
}

function initGame() {
  const savedBudget = localStorage.getItem("budget");

  if (!savedBudget) {
    alert("Spin the wheel first!");
    window.location.href = "index.html";
    return;
  }

  budget = parseInt(savedBudget);
  document.getElementById("budget").innerText = budget;

  currentColors = clothingItems.map(() => 0);

  renderRack();
  updateTotal();

  // --------- Disable submit for 1 minute ----------
  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) {
    submitBtn.disabled = true; // prevent clicks
    submitBtn.innerText = "Wait 30 seconds..."; // show countdown text

    let timeLeft = 30;
    const timer = setInterval(() => {
      timeLeft--;
      submitBtn.innerText = `Wait ${timeLeft} seconds...`;
      if (timeLeft <= 0) {
        clearInterval(timer);
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Outfit";
      }
    }, 1000);
  }
}

function backToWheel() {
  // Clear saved budget
  localStorage.removeItem("budget");

  // Optional: reset selected items
  resetOutfit();

  // Go back to wheel page
  window.location.href = "wheel.html";
}

