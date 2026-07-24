const TARGETS = ['.hero__content', '.validator', '.privacy'];
const STYLE_ID = 'otg-real-flow-field-styles';

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .neural-flow-section {
      position: relative !important;
      isolation: isolate;
      overflow: hidden;
      background:
        radial-gradient(circle at 15% 20%, rgba(34, 197, 94, .18), transparent 34%),
        radial-gradient(circle at 86% 82%, rgba(16, 185, 129, .16), transparent 38%),
        linear-gradient(135deg, #041f18 0%, #063b2b 48%, #05271e 100%) !important;
      color: #f5fbf7;
    }

    .neural-flow-section::before,
    .neural-flow-section::after {
      content: none !important;
      display: none !important;
      background: none !important;
    }

    .neural-flow-canvas {
      position: absolute;
      inset: 0;
      z-index: -2;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: .95;
    }

    .neural-flow-section > :not(.neural-flow-canvas) {
      position: relative;
      z-index: 1;
    }

    .hero__content.neural-flow-section h1,
    .hero__content.neural-flow-section .hero__copy,
    .hero__content.neural-flow-section .hero__note,
    .neural-flow-section .eyebrow,
    .neural-flow-section .section-heading h2,
    .neural-flow-section .privacy__copy,
    .neural-flow-section .privacy h2 {
      color: #f5fbf7 !important;
    }

    .hero__content.neural-flow-section .hero__copy,
    .hero__content.neural-flow-section .hero__note,
    .neural-flow-section .section-heading > span,
    .neural-flow-section .privacy__copy p {
      color: rgba(235, 255, 244, .80) !important;
    }

    .hero__content.neural-flow-section .button--primary {
      border-color: #f5fbf7;
      background: #f5fbf7;
      color: #06271d;
    }

    .neural-flow-section .dropzone,
    .neural-flow-section .panel {
      border-color: rgba(196, 232, 211, .34) !important;
      background: rgba(250, 252, 248, .96) !important;
      box-shadow: 0 24px 70px rgba(0, 17, 11, .30) !important;
      color: #071b16;
      backdrop-filter: blur(8px);
    }

    .neural-flow-section .dropzone {
      background: rgba(246, 249, 244, .94) !important;
    }

    .neural-flow-section .privacy__copy {
      padding: clamp(1.3rem, 3vw, 2.25rem);
      border: 1px solid rgba(190, 232, 207, .25);
      border-radius: 1.25rem;
      background: rgba(2, 32, 23, .46);
      box-shadow: 0 24px 70px rgba(0, 17, 11, .22);
      backdrop-filter: blur(10px);
    }

    .steps.field-section {
      background: var(--color-paper-strong) !important;
    }

    .steps.field-section::before,
    .steps.field-section::after {
      content: none !important;
      display: none !important;
    }

    @media (prefers-reduced-motion: reduce) {
      .neural-flow-canvas { opacity: .55; }
    }
  `;
  document.head.appendChild(style);
}

function createFlowField(section, sectionIndex) {
  if (section.querySelector(':scope > .neural-flow-canvas')) return;

  section.classList.add('neural-flow-section');
  const canvas = document.createElement('canvas');
  canvas.className = 'neural-flow-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  section.prepend(canvas);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particles = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let raf = 0;
  let lastTime = 0;
  const pointer = { x: -9999, y: -9999, active: false };

  function randomParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      px: 0,
      py: 0,
      age: Math.random() * 180,
      life: 110 + Math.random() * 170,
      speed: .55 + Math.random() * .9,
      alpha: .18 + Math.random() * .48,
      width: .45 + Math.random() * 1.1,
      hue: 136 + Math.random() * 30,
    };
  }

  function resetParticle(particle) {
    Object.assign(particle, randomParticle());
    particle.px = particle.x;
    particle.py = particle.y;
  }

  function resize() {
    const rect = section.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.7);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const targetCount = reducedMotion
      ? Math.min(180, Math.floor((width * height) / 7500))
      : Math.min(900, Math.max(320, Math.floor((width * height) / 2200)));

    particles.length = 0;
    for (let index = 0; index < targetCount; index += 1) particles.push(randomParticle());
    ctx.fillStyle = '#052b20';
    ctx.fillRect(0, 0, width, height);
  }

  function noiseAngle(x, y, time) {
    const scale = .0026;
    const nx = x * scale;
    const ny = y * scale;
    const waveA = Math.sin(nx * 3.1 + time * .22 + sectionIndex * 1.7);
    const waveB = Math.cos(ny * 2.6 - time * .18);
    const waveC = Math.sin((nx + ny) * 2.15 + time * .13);
    return (waveA + waveB + waveC) * 1.35;
  }

  function draw(timestamp) {
    const delta = Math.min(32, timestamp - lastTime || 16.7);
    lastTime = timestamp;
    frame += delta * .001;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = reducedMotion ? 'rgba(4, 37, 27, .13)' : 'rgba(4, 31, 24, .065)';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    for (const particle of particles) {
      particle.px = particle.x;
      particle.py = particle.y;

      let angle = noiseAngle(particle.x, particle.y, frame);
      if (pointer.active) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distanceSq = dx * dx + dy * dy;
        if (distanceSq < 34000 && distanceSq > 1) {
          angle += Math.atan2(dy, dx) * (1 - distanceSq / 34000) * .72;
        }
      }

      const velocity = particle.speed * (reducedMotion ? .18 : 1) * (delta / 16.7);
      particle.x += Math.cos(angle) * velocity;
      particle.y += Math.sin(angle) * velocity;
      particle.age += delta / 16.7;

      if (
        particle.x < -20 || particle.x > width + 20 ||
        particle.y < -20 || particle.y > height + 20 ||
        particle.age > particle.life
      ) {
        resetParticle(particle);
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(particle.px, particle.py);
      ctx.lineTo(particle.x, particle.y);
      ctx.strokeStyle = `hsla(${particle.hue}, 78%, 64%, ${particle.alpha})`;
      ctx.lineWidth = particle.width;
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(draw);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(section);

  section.addEventListener('pointermove', (event) => {
    const rect = section.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  });
  section.addEventListener('pointerleave', () => {
    pointer.active = false;
  });

  resize();
  raf = requestAnimationFrame(draw);

  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(raf);
    observer.disconnect();
  }, { once: true });
}

function initializeFlowFields() {
  ensureStyles();
  document.querySelectorAll('.steps').forEach((section) => {
    section.classList.remove('neural-flow-section');
    section.querySelectorAll(':scope > .neural-flow-canvas').forEach((canvas) => canvas.remove());
  });
  TARGETS.forEach((selector, index) => {
    document.querySelectorAll(selector).forEach((section) => createFlowField(section, index));
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFlowFields, { once: true });
} else {
  initializeFlowFields();
}

const appObserver = new MutationObserver(() => initializeFlowFields());
appObserver.observe(document.documentElement, { childList: true, subtree: true });
