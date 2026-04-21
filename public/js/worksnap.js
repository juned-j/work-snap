let timer = null;
let seconds = 0;
let isRunning = false;

const timerEl = document.getElementById('wsTimer');
const statusEl = document.getElementById('wsStatus');

function format(sec) {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function render() {
    timerEl.innerText = format(seconds);
}

function startTimer() {
    if (isRunning) return;

    isRunning = true;
    timer = setInterval(() => {
        seconds++;
        render();
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timer);
}

function stopTimer() {
    isRunning = false;
    clearInterval(timer);
    seconds = 0;
    render();
}

/* =========================
   BUTTON ACTIONS (API CALLS)
========================= */

document.getElementById('wsStartBtn').addEventListener('click', async () => {
    await fetch('/worksnap/start', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrfToken } });

    statusEl.innerText = 'Active';
    startTimer();
});

document.getElementById('wsPauseBtn').addEventListener('click', async () => {
    await fetch('/worksnap/pause', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrfToken } });

    statusEl.innerText = 'Paused';
    pauseTimer();
});

document.getElementById('wsStopBtn').addEventListener('click', async () => {
    await fetch('/worksnap/stop', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrfToken } });

    statusEl.innerText = 'Stopped';
    stopTimer();
});