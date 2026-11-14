const canvas = document.getElementById("scratch-canvas");
const ctx = canvas.getContext("2d");
const container = document.querySelector(".heart-container");
const instruction = document.getElementById("instruction");
const nextBtn = document.getElementById("next-btn");

// Zabránění nechtěnému označování nebo přetahování plátna
canvas.addEventListener('dragstart', (e) => e.preventDefault());
canvas.addEventListener('selectstart', (e) => e.preventDefault());

let scratching = false;

// 1. Načtení obrázku srdíčka
const heartImg = new Image();
heartImg.src = "heart.png";

// 2. Inicializace až po načtení obrázku
heartImg.onload = () => {
    initCanvas();
};

heartImg.onerror = () => {
    console.error("Obrázek heart.png se nepodařilo načíst! Používám záložní barvu.");
    initCanvas();
};

function initCanvas() {
    const w = container ? container.offsetWidth : 320;
    const h = container ? container.offsetHeight : 350;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.scale(dpr, dpr);

    if (heartImg.complete && heartImg.naturalWidth !== 0) {
        const goldCanvas = document.createElement("canvas");
        goldCanvas.width = canvas.width;
        goldCanvas.height = canvas.height;
        const gCtx = goldCanvas.getContext("2d");
        gCtx.scale(dpr, dpr);

        gCtx.drawImage(heartImg, 0, 0, w, h);
        gCtx.globalCompositeOperation = "source-in";
        gCtx.fillStyle = "#EA98A5";
        gCtx.fillRect(0, 0, w, h);

        const revealText = document.querySelector(".reveal-text");
        if (revealText) {
            revealText.style.backgroundImage = `url(${goldCanvas.toDataURL()})`;
            revealText.style.backgroundSize = "contain";
            revealText.style.backgroundRepeat = "no-repeat";
            revealText.style.backgroundPosition = "center";
        }

        ctx.drawImage(heartImg, 0, 0, w, h);
    }
}

window.addEventListener("resize", () => {
    if (canvas.style.display !== "none") {
        initCanvas();
    }
});

// Události pro stírání
["mousedown", "touchstart"].forEach(evt =>
    canvas.addEventListener(evt, (e) => {
        scratching = true;
        scratch(e);
    }, { passive: false })
);

["mouseup", "touchend"].forEach(evt =>
    canvas.addEventListener(evt, () => scratching = false)
);

["mousemove", "touchmove"].forEach(evt =>
    canvas.addEventListener(evt, scratch, { passive: false })
);

function scratch(e) {
    if (!scratching) return;

    if (e.cancelable) e.preventDefault();
    e.stopPropagation();

    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();

    checkReveal();
}

function checkReveal() {
    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let cleared = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 128) cleared++;
        }

        const percentage = (cleared / (pixels.length / 4)) * 100;

        if (percentage > 85) {
            revealEverything();
        }
    } catch (e) {
        if (!window.backupTimer) {
            window.backupTimer = setTimeout(revealEverything, 2000);
        }
    }
}

let hasRevealed = false;

function revealEverything() {
    if (hasRevealed) return;
    hasRevealed = true;

    const mainTitle = document.getElementById("main-title");
    if (mainTitle) {
        mainTitle.style.transition = "opacity 0.6s ease";
        mainTitle.style.opacity = "0";
    }

    if (typeof confetti === "function") {
        const diamond = confetti.shapeFromPath({
            path: 'M 0 -10 L 7 0 L 0 10 L -7 0 Z'
        });

        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            confetti({
                particleCount: 12,
                spread: 60,
                origin: { x: 0.2, y: 0.6 },
                colors: ['#B41313', '#ffdce2', '#5B7065', '#ffffff'],
                shapes: ['heart', diamond],
                scalar: 1.2
            });

            confetti({
                particleCount: 12,
                spread: 60,
                origin: { x: 0.8, y: 0.6 },
                colors: ['#B41313', '#ffdce2', '#5B7065', '#ffffff'],
                shapes: ['heart', diamond],
                scalar: 1.2
            });
        }, 200);
    }

    canvas.style.transition = "opacity 0.8s ease";
    canvas.style.opacity = "0";

    if (instruction) {
        instruction.style.transition = "opacity 0.5s ease";
        instruction.style.opacity = "0";
    }

    setTimeout(() => {
        canvas.style.display = "none";
        if (nextBtn) {
            nextBtn.classList.add("visible");
        }
    }, 800);
}

// Funkce pro otevření detailů pozvánky po kliknutí na tlačítko
function openDetails() {
    const scratchScreen = document.getElementById("scratch-screen");
    const contentScreen = document.getElementById("content-screen");

    if (scratchScreen) scratchScreen.style.display = "none";
    if (contentScreen) {
        contentScreen.classList.add("active");
        window.scrollTo(0, 0);
    }
}

// ==========================================
// ODPOČET DO SVATBY (2. 7. 2027 11:00)
// ==========================================
const targetDate = new Date("2027-07-02T11:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        const countdownEl = document.getElementById("countdown");
        if (countdownEl) countdownEl.innerHTML = "<p>Dnes je náš velký den!</p>";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const elDays = document.getElementById("days");
    const elHours = document.getElementById("hours");
    const elMinutes = document.getElementById("minutes");
    const elSeconds = document.getElementById("seconds");

    if (elDays) elDays.innerText = days;
    if (elHours) elHours.innerText = hours;
    if (elMinutes) elMinutes.innerText = minutes;
    if (elSeconds) elSeconds.innerText = seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ==========================================
// OBSLUHA RSVP FORMULÁŘE
// ==========================================
const rsvpForm = document.getElementById("rsvp-form");
if (rsvpForm) {
    rsvpForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const name = document.getElementById("guest-name").value;
        const msg = document.getElementById("rsvp-message");
        
        // Zde můžete v budoucnu napojit odesílání např. přes Formspree nebo Google Sheets
        msg.innerText = `Děkujeme, ${name}! Vaše odpověď byla zaznamenána.`;
        rsvpForm.reset();
    });
}


// ==========================================
// ROZBALOVACÍ MENU (NAVIGACE)
// ==========================================
function toggleMenu() {
    const menu = document.getElementById("side-menu");
    if (menu) {
        menu.classList.toggle("active");
    }
}

