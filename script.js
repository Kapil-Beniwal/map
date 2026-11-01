
        let currentMode = 'practice';
        let currentTargetArea = null;

        // Initialize and bind events
        window.addEventListener('DOMContentLoaded', () => {
            setupPracticeEvents();
            setupCanvasResizing();
        });

        function switchTab(mode) {
            currentMode = mode;
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            clearAllCanvases();

            if (mode === 'practice') {
                document.querySelectorAll('.tab-btn')[0].classList.add('active');
                document.getElementById('practice-panel').classList.add('active');
                document.getElementById('practice-status').innerText = "Click anywhere on the map to learn its name!";
            } else {
                document.querySelectorAll('.tab-btn')[1].classList.add('active');
                document.getElementById('quiz-panel').classList.add('active');
                document.getElementById('quiz-status').innerText = "Click \"Start Quiz\" to challenge yourself!";
                document.getElementById('options-container').innerHTML = '';
                document.getElementById('quiz-action-btn').style.display = 'block';
                document.getElementById('quiz-action-btn').innerText = 'Start Quiz';
            }
        }

        // --- DRAWING UTILITY ---
        function drawArea(area, canvas, fillStyle = 'rgba(0, 113, 227, 0.5)', strokeStyle = '#0071e3') {
            const ctx = canvas.getContext('2d');
            const img = canvas.previousElementSibling;
            
            canvas.width = img.clientWidth;
            canvas.height = img.clientHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const coords = area.coords.split(',').map(Number);
            const shape = area.shape.toLowerCase();

            ctx.fillStyle = fillStyle;
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = 3;
            ctx.beginPath();

            if (shape === 'poly') {
                for (let i = 0; i < coords.length; i += 2) {
                    if (i === 0) ctx.moveTo(coords[i], coords[i+1]);
                    else ctx.lineTo(coords[i], coords[i+1]);
                }
                ctx.closePath();
            } else if (shape === 'circle') {
                ctx.arc(coords[0], coords[1], coords[2], 0, 2 * Math.PI);
            } else if (shape === 'rect' || shape === 'rectangle') {
                ctx.rect(coords[0], coords[1], coords[2] - coords[0], coords[3] - coords[1]);
            }

            ctx.fill();
            ctx.stroke();
        }

        function clearAllCanvases() {
            document.querySelectorAll('.overlay-canvas').forEach(canvas => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        }

        // --- 1. PRACTICE MODULE LOGIC ---
        function setupPracticeEvents() {
            const areas = document.querySelectorAll('#map-element area');
            areas.forEach(area => {
                area.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (currentMode !== 'practice') return;

                    const panel = document.getElementById('practice-panel');
                    const canvas = panel.querySelector('.overlay-canvas');
                    const status = document.getElementById('practice-status');

                    status.innerText = `Selected Region: ${area.title || area.alt}`;
                    drawArea(area, canvas, 'rgba(52, 199, 89, 0.5)', '#34c759');
                });
            });
        }

        // --- 2. QUIZ MODULE LOGIC ---
        function nextQuizQuestion() {
            const areas = Array.from(document.querySelectorAll('#map-element area'));
            if (areas.length === 0) return;

            document.getElementById('quiz-action-btn').style.display = 'none';
            const status = document.getElementById('quiz-status');
status.innerText = "Identify the highlighted region:";
status.style.color = '#1d1d1f';
// Pick random target area
currentTargetArea = areas[Math.floor(Math.random() * areas.length)];
// Highlight target area on Quiz Canvas
const canvas = document.querySelector('#quiz-panel .overlay-canvas');
drawArea(currentTargetArea, canvas, 'rgba(255, 159, 10, 0.5)', '#ff9f0a');
// Generate options (1 correct + 3 unique random incorrect options)
const targetName = currentTargetArea.title || currentTargetArea.alt;
let pool = areas.map(a => a.title || a.alt).filter(name => name !== targetName);
pool = [...new Set(pool)]; // Deduplicate names
// Shuffle and pick 3 wrong answers
pool.sort(() => 0.5 - Math.random());
const options = [targetName];
for (let i = 0; i < Math.min(3, pool.length); i++) {
options.push(pool[i]);
}
// Randomize final grid positions
options.sort(() => 0.5 - Math.random());
// Build Option Buttons
const container = document.getElementById('options-container');
container.innerHTML = '';
options.forEach(optText => {
const btn = document.createElement('button');
btn.className = 'option-btn';
btn.innerText = optText;
btn.onclick = () => checkQuizAnswer(btn, optText, targetName);
container.appendChild(btn);
});
}
function checkQuizAnswer(selectedBtn, chosenName, correctName) {
const buttons = document.querySelectorAll('.option-btn');
buttons.forEach(btn => btn.disabled = true); // Lock selection
const status = document.getElementById('quiz-status');
const canvas = document.querySelector('#quiz-panel .overlay-canvas');
if (chosenName === correctName) {
selectedBtn.classList.add('correct');
status.innerText = "Correct! Well done.";
status.style.color = '#34c759';
// Turn highlight green
drawArea(currentTargetArea, canvas, 'rgba(52, 199, 89, 0.5)', '#34c759');
} else {
selectedBtn.classList.add('wrong');
status.innerText = `Incorrect. It was ${correctName}`;
status.style.color = '#ff3b30';
// Turn highlight red
drawArea(currentTargetArea, canvas, 'rgba(255, 59, 48, 0.5)', '#ff3b30');
// Highlight correct option button implicitly
buttons.forEach(btn => {
if (btn.innerText === correctName) btn.classList.add('correct');
});
}
// Repurpose action button to continue
const actionBtn = document.getElementById('quiz-action-btn');
actionBtn.innerText = 'Next Region →';
actionBtn.style.display = 'block';
}
function setupCanvasResizing() {
window.addEventListener('resize', () => {
clearAllCanvases();
// Reset active statuses to instruct re-clicks upon scale changes
if (currentMode === 'practice') {
document.getElementById('practice-status').innerText = "Window resized. Click a region to inspect.";
}
});
}

