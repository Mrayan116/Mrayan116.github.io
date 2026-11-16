const themeButton = document.querySelector('.theme-toggle');
const root = document.documentElement;
const stored = localStorage.getItem('rayan-theme');
if (stored === 'light' || stored === 'dark') root.dataset.theme = stored;
function updateTheme() {
  const light = root.dataset.theme === 'light';
  themeButton.querySelector('.theme-icon').textContent = light ? '☾' : '☼';
  themeButton.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
}
updateTheme();
themeButton.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('rayan-theme', root.dataset.theme);
  updateTheme();
});

const filters = document.querySelectorAll('.filter');
const projectCards = document.querySelectorAll('.project-card');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => {item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', item === button ? 'true' : 'false');});
  const filter = button.dataset.filter;
  projectCards.forEach(card => { card.hidden = filter !== 'all' && !card.dataset.category.split(' ').includes(filter); });
}));

const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    });
  }, {rootMargin: '-20% 0px -65% 0px'});
  sections.forEach(section => sectionObserver.observe(section));
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target);}
  }), {threshold: 0.07});
  document.querySelectorAll('.reveal').forEach(node => revealObserver.observe(node));
} else document.querySelectorAll('.reveal').forEach(node => node.classList.add('is-visible'));


// Lightweight gold snake cursor. No particles or per-frame DOM changes.

 // Golden skeletal dragon cursor
(() => {
  const canvas = document.getElementById("snake-cursor");
  const toggle = document.querySelector(".trail-toggle");

  if (!canvas || !toggle) return;

  const allowed = window.matchMedia(
    "(pointer: fine) and (prefers-reduced-motion: no-preference)"
  );

  if (!allowed.matches) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // CUSTOMIZATION
  const GOLD = "#cf531e";
  const DARK_GOLD = "#aa4f1b";
  const EYE = "#111111";
  const TONGUE = "#ef6969";

  const SEGMENT_COUNT = 27;
  const SPACING = 12;
  const FOLLOW_SPEED = 0.3;

  let enabled = true;
  let visible = false;
  let frameId = null;
  let mouseX = 0;
  let mouseY = 0;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let lastMove = 0;

  const body = Array.from({ length: SEGMENT_COUNT }, () => ({
    x: 0,
    y: 0
  }));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initializeBody(x, y) {
    body.forEach((part, index) => {
      part.x = x - index * SPACING;
      part.y = y;
    });
  }

  function updateBody() {
    const head = body[0];

    head.x += (mouseX - head.x) * FOLLOW_SPEED;
    head.y += (mouseY - head.y) * FOLLOW_SPEED;

    // Each segment follows the segment in front.
    for (let i = 1; i < body.length; i++) {
      const previous = body[i - 1];
      const current = body[i];

      const dx = previous.x - current.x;
      const dy = previous.y - current.y;
      const distance = Math.hypot(dx, dy);

      if (distance > 0.001) {
        const move = (distance - SPACING) * 0.65;

        current.x += (dx / distance) * move;
        current.y += (dy / distance) * move;
      }
    }
  }

  function drawSpine() {
    ctx.beginPath();
    ctx.moveTo(body[0].x, body[0].y);

    for (let i = 1; i < body.length; i++) {
      ctx.lineTo(body[i].x, body[i].y);
    }

    ctx.strokeStyle = DARK_GOLD;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Bright centre line
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawRibs(time) {
    for (let i = body.length - 2; i >= 2; i--) {
      const point = body[i];
      const before = body[i - 1];
      const after = body[i + 1];

      const angle = Math.atan2(
        before.y - after.y,
        before.x - after.x
      );

      const nx = -Math.sin(angle);
      const ny = Math.cos(angle);

      const progress = i / (body.length - 1);

      // Large ribs near the head, smaller toward the tail.
      const taper = Math.pow(1 - progress, 1.5);
      const ribLength = (8 + 40 * taper) *
        Math.min(1, i / 5);

      const wave = Math.sin(time * 0.003 + i * 0.5) * 2;

      for (const side of [-1, 1]) {
        const tipX =
          point.x + nx * side * (ribLength + wave);

        const tipY =
          point.y + ny * side * (ribLength + wave);

        const backwardX = -Math.cos(angle) * ribLength * 0.45;
        const backwardY = -Math.sin(angle) * ribLength * 0.45;

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);

        ctx.quadraticCurveTo(
          point.x + nx * side * ribLength * 0.65,
          point.y + ny * side * ribLength * 0.65,
          tipX + backwardX,
          tipY + backwardY
        );

        ctx.strokeStyle =
          i % 2 === 0 ? GOLD : DARK_GOLD;

        ctx.lineWidth = Math.max(0.7, 2.7 * taper);
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }
  }

  function drawWings(time) {
    // Two longer skeletal fins just behind the head.
    const anchor = body[5];
    const before = body[4];
    const after = body[6];

    const angle = Math.atan2(
      before.y - after.y,
      before.x - after.x
    );

    ctx.save();
    ctx.translate(anchor.x, anchor.y);
    ctx.rotate(angle);

    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const wave = Math.sin(time * 0.002 + i) * 3;
        const length = 36 + i * 12;

        ctx.beginPath();
        ctx.moveTo(-i * 5, 0);

        ctx.quadraticCurveTo(
          -18 - i * 6,
          side * (length * 0.8),
          -48 - i * 5 + wave,
          side * length
        );

        ctx.strokeStyle = i % 2 === 0 ? GOLD : DARK_GOLD;
        ctx.lineWidth = Math.max(0.8, 2.3 - i * 0.25);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawHead(time) {
    const head = body[0];
    const neck = body[1];

    const angle = Math.atan2(
      head.y - neck.y,
      head.x - neck.x
    );

    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(angle);

    // Dragon skull
    ctx.beginPath();
    ctx.moveTo(-18, -9);
    ctx.lineTo(-6, -15);
    ctx.lineTo(10, -12);
    ctx.lineTo(22, -5);
    ctx.lineTo(28, 0);
    ctx.lineTo(22, 7);
    ctx.lineTo(9, 12);
    ctx.lineTo(-8, 10);
    ctx.closePath();

    ctx.fillStyle = GOLD;
    ctx.fill();

    ctx.strokeStyle = DARK_GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Horns
    ctx.beginPath();
    ctx.moveTo(-7, -12);
    ctx.lineTo(-15, -26);
    ctx.lineTo(4, -13);

    ctx.moveTo(-7, 10);
    ctx.lineTo(-15, 25);
    ctx.lineTo(5, 12);

    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = EYE;
    ctx.fillRect(11, -9, 4, 4);
    ctx.fillRect(11, 5, 4, 4);

    // Small forked tongue that appears briefly
    if (Math.sin(time * 0.006) > 0.8) {
      ctx.beginPath();
      ctx.moveTo(27, 0);
      ctx.lineTo(40, 0);
      ctx.lineTo(45, -5);
      ctx.moveTo(40, 0);
      ctx.lineTo(45, 5);

      ctx.strokeStyle = TONGUE;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawTail() {
    const tail = body[body.length - 1];
    const previous = body[body.length - 2];

    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(tail.x, tail.y);

    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function animate(time) {
    frameId = null;

    if (!enabled || !visible || document.hidden) return;

    ctx.clearRect(0, 0, width, height);

    updateBody();

    // Draw from back to front.
    drawRibs(time);
    drawWings(time);
    drawSpine();
    drawTail();
    drawHead(time);

    frameId = requestAnimationFrame(animate);
  }

  function start() {
    if (frameId === null && enabled && visible) {
      frameId = requestAnimationFrame(animate);
    }
  }

  function stop() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    visible = false;
    canvas.classList.remove("active");
    ctx.clearRect(0, 0, width, height);
  }

  function move(event) {
    if (!enabled || event.pointerType === "touch") return;

    mouseX = event.clientX;
    mouseY = event.clientY;
    lastMove = performance.now();

    if (!visible) {
      initializeBody(mouseX, mouseY);
      visible = true;
      canvas.classList.add("active");
    }

    start();
  }

  function setEnabled(value) {
    enabled = value;

    document.body.classList.toggle("snake-enabled", enabled);
    toggle.setAttribute("aria-pressed", String(enabled));

    toggle.innerHTML = enabled
      ? '<span aria-hidden="true">✦</span> Dragon on'
      : '<span aria-hidden="true">✦</span> Dragon off';

    if (!enabled) stop();
  }

  resize();
  setEnabled(true);

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("pointermove", move, { passive: true });
  document.documentElement.addEventListener("pointerleave", stop);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });

  toggle.addEventListener("click", () => {
    setEnabled(!enabled);
  });
})();

