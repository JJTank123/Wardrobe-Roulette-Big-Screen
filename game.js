/* ======================================================
   CLOTHING BUDGET GAME
   One JS file handles BOTH pages
====================================================== */

/* ---------------- GLOBAL STATE ---------------- */


// Exact placement anchors for mannequin layers
const layerAnchors = {
  top: {
    top: 20,
    left: 0,
    width:70
  },
  bottom: {
    top: 150,
    left: 40,
    width: 60
  },
  shoes: {
    top: 220,
    left: 0,
    width: 100
  },
  outerwear: {
    top: 15,
    left: 0,
    width: 100
  }
};
// Controls visual stacking order
const layerOrder = {
  shoes: 1,
  bottom: 2,
  top: 3,
  outerwear: 4,
  accessory: 5
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
  name: "T-Shirt",
  category: "top",
  price: 35,
  images: ["images/tshirt1-1.png","images/tshirt1-2.png","images/tshirt1-3.png"]
},
{
  name: "Long Sleeve",
  category: "top",
  price: 65,
   yOffset: -20,
  images: ["images/tshirt2-1.png","images/tshirt2-2.png","images/tshirt2-3.png"]
},
{
  name: "Polo Shirt",
  category: "top",
   yOffset: -8,
  price: 110,
  images: ["images/tshirt3-1.png","images/tshirt3-2.png","images/tshirt3-3.png"]
},
{
  name: "Bottoms",
  category: "bottom",
  price: 35,
  images: ["images/jeans1.png","images/jeans2.png","images/jeans3.png"]
}
];


/* ======================================================
   PAGE DETECTION
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

  // INDEX PAGE (wheel exists)
  if (document.getElementById("wheel")) {
    initWheel();
  }

  // GAME PAGE (rack exists)
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

  const center = canvas.width / 2;
  const radius = canvas.width / 2;
  const angleStep = (2 * Math.PI) / budgets.length;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  budgets.forEach((value, i) => {

    const startAngle = i * angleStep;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, startAngle + angleStep);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.stroke();

    // text
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + angleStep / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "bold 18px Arial";
    ctx.fillText("$" + value, radius - 10, 0);
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

  const rotationToSlice =
    (selectedIndex * segmentAngle) + (segmentAngle / 2);

  const totalRotation = (360 * 5) + (270 - rotationToSlice);

  canvas.style.transition =
    "transform 4s cubic-bezier(.15,.85,.25,1)";

  canvas.style.transform = `rotate(${totalRotation}deg)`;

  setTimeout(() => {

    document.getElementById("budgetDisplay").innerText =
      "Your Budget: $" + budget;

    document.getElementById("startGameBtn").style.display =
      "inline-block";

    localStorage.setItem("budget", budget);

    spinning = false;

  }, 4000);
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

const img = document.createElement("img");
img.src = item.images[currentColors[index]];
img.id = "layer-" + item.category;

img.style.position = "absolute";
img.style.zIndex = layerOrder[item.category] || 1;

// ⭐ apply anchor positioning
const anchor = layerAnchors[item.category];
if (anchor) {
  const offset = item.yOffset || 0;
  img.style.top = anchor.top + offset + "px";
  img.style.left = "50%";
  img.style.transform = "translateX(-50%)";

  // All shirts same width
  img.style.width = anchor.width + "%";

  img.style.height = "auto"; // maintain aspect ratio
}


mannequinLayer.appendChild(img);

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
    submitBtn.innerText = "Wait 60 seconds..."; // show countdown text

    let timeLeft = 10;
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
