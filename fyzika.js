const button = document.querySelector('.button');
const videoAnchor = document.querySelector('.video-anchor');
const videoContainer = document.querySelector('.video-container');
const video = document.querySelector('.video1');
let currentAnswer = 0;
let streak = 0;
let lastSolution = "";

const problemTypes = [
    { name: 'objem', units: ['dm³', 'cm³', 'm³', 'litrů', 'ml'] },
    { name: 'krychle', units: ['cm', 'dm', 'm'] }
];

// --- Level Bar Logic ---
function updateLevelBar() {
    const bar = document.getElementById('levelBar');
    const countText = document.getElementById('streakCount');
    if (bar && countText) {
        const percentage = (streak / 5) * 100;
        bar.style.width = `${percentage}%`;
        countText.innerText = streak;
        if (streak >= 5) {
            bar.style.background = 'linear-gradient(to right, #00ff88, #00f2fe)';
            bar.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.5)';
        } else {
            bar.style.background = 'linear-gradient(to right, #00f2fe, #4facfe)';
            bar.style.boxShadow = 'none';
        }
    }
}

// --- Floating Video Logic ---
let isFloatingSideRight = true;
let sideSwitchInterval = null;

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Pozorujeme ANCHOR (kotvu), která se nehýbe
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            if (!videoContainer.classList.contains('floating')) {
                videoContainer.classList.add('floating');
                videoContainer.classList.add(isFloatingSideRight ? 'floating-right' : 'floating-left');
                startSideSwitching();
            }
        } else if (entry.isIntersecting) {
            videoContainer.classList.remove('floating', 'floating-left', 'floating-right');
            stopSideSwitching();
        }
    });
}, { threshold: 0 });

if (videoAnchor) {
    observer.observe(videoAnchor);
}

function startSideSwitching() {
    if (sideSwitchInterval) return;
    sideSwitchInterval = setInterval(() => {
        isFloatingSideRight = !isFloatingSideRight;
        if (videoContainer.classList.contains('floating')) {
            videoContainer.classList.toggle('floating-right', isFloatingSideRight);
            videoContainer.classList.toggle('floating-left', !isFloatingSideRight);
        }
    }, 10000);
}

function stopSideSwitching() {
    clearInterval(sideSwitchInterval);
    sideSwitchInterval = null;
}

// --- Quiz Logic ---
button.addEventListener('click', () => {
    let exampleDiv = document.getElementById('example');
    if (!exampleDiv) {
        exampleDiv = document.createElement('div');
        exampleDiv.id = 'example';
        exampleDiv.className = 'example-container';
        button.after(exampleDiv);
    }

    const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    const unit = type.units[Math.floor(Math.random() * type.units.length)];
    let questionText = "";
    let volumeInDm3 = 0;
    let explanation = "";

    if (type.name === 'objem') {
        let volume;
        if (unit === 'm³') {
            volume = parseFloat((Math.random() * 1.5 + 0.1).toFixed(2));
            volumeInDm3 = volume * 1000;
        } else if (unit === 'cm³' || unit === 'ml') {
            volume = Math.floor(Math.random() * 2000) + 100;
            volumeInDm3 = volume / 1000;
        } else {
            volume = Math.floor(Math.random() * 30) + 1;
            volumeInDm3 = volume;
        }
        explanation = `V = ${volume} ${unit} = ${volumeInDm3} dm³ (litrů). Fv = V * 10 = ${volumeInDm3 * 10} N.`;
        questionText = `Těleso o objemu <strong>${volume} ${unit}</strong> je celé ponořeno do vody.`;
    } else {
        let side;
        if (unit === 'm') {
            const possibleSides = [0.1, 0.2, 0.3, 0.4, 0.5, 1];
            side = possibleSides[Math.floor(Math.random() * possibleSides.length)];
            const volM3 = Math.pow(side, 3);
            volumeInDm3 = volM3 * 1000;
            explanation = `V = a³ = ${side}³ = ${volM3.toFixed(4)} m³ = ${volumeInDm3.toFixed(2)} dm³. Fv = V * 10 = ${(volumeInDm3 * 10).toFixed(2)} N.`;
        } else if (unit === 'dm') {
            side = Math.floor(Math.random() * 5) + 1;
            volumeInDm3 = Math.pow(side, 3);
            explanation = `V = a³ = ${side}³ = ${volumeInDm3} dm³ (litrů). Fv = V * 10 = ${volumeInDm3 * 10} N.`;
        } else {
            side = (Math.floor(Math.random() * 4) + 1) * 10;
            const sideDm = side / 10;
            volumeInDm3 = Math.pow(sideDm, 3);
            explanation = `a = ${side} cm = ${sideDm} dm. V = a³ = ${sideDm}³ = ${volumeInDm3} dm³. Fv = V * 10 = ${volumeInDm3 * 10} N.`;
        }
        questionText = `Do vody ponoříme <strong>krychli</strong> o hraně <strong>${side} ${unit}</strong>.`;
    }

    currentAnswer = parseFloat((volumeInDm3 * 10).toFixed(2));
    lastSolution = explanation;

    exampleDiv.innerHTML = `
        <div class="example-card quiz-card">
            <h3>Fyzikální kvíz</h3>
            <p>${questionText}</p>
            <p>Jak velká vztlaková síla na ni působí? (g = 10 N/kg)</p>
            <div class="input-group">
                <input type="number" step="0.01" id="quizInput" placeholder="N">
                <button id="checkBtn">Ověřit</button>
            </div>
            <div id="resultFeedback" class="feedback"></div>
            <div id="gifContainer" class="gif-container"></div>
            <div id="solutionBox" class="solution-box" style="display:none; font-size:0.9rem; color:#94a3b8; margin-top:15px; border-top:1px solid #333; padding-top:10px;"></div>
        </div>
    `;

    exampleDiv.classList.add('show');
    exampleDiv.scrollIntoView({ behavior: 'smooth' });

    const checkBtn = document.getElementById('checkBtn');
    const quizInput = document.getElementById('quizInput');
    const feedback = document.getElementById('resultFeedback');
    const gifContainer = document.getElementById('gifContainer');
    const solutionBox = document.getElementById('solutionBox');

    checkBtn.addEventListener('click', () => {
        const userValue = parseFloat(quizInput.value);
        if (Math.abs(userValue - currentAnswer) < 0.1) {
            streak++;
            updateLevelBar();
            feedback.innerHTML = "Excelentní! 🔥";
            feedback.style.color = "#00ff88";
            solutionBox.style.display = "none";
            if (streak >= 5) {
                feedback.innerHTML = "LEGENDÁRNÍ STREAK! 🏆";
                gifContainer.innerHTML = `<img src="mgfitman.jfif" alt="MEGA REWARD" class="success-gif reward-img">`;
            } else {
                gifContainer.innerHTML = `<img src="IshowSpeed.gif" alt="Success" class="success-gif">`;
            }
        } else {
            streak = 0;
            updateLevelBar();
            feedback.innerHTML = `Chyba! Streak přerušen. (Správně bylo ${currentAnswer} N) ❌`;
            feedback.style.color = "#ff4444";
            gifContainer.innerHTML = "";
            solutionBox.innerHTML = `<strong>Postup:</strong> ${lastSolution}`;
            solutionBox.style.display = "block";
        }
    });
});

// Autoplay & Interaction
document.addEventListener('click', () => {
    if (video && video.paused) {
        video.play().catch(e => console.log("Video error", e));
    }
}, { once: true });
