// --- Switch dark/light (icône SVG orange charte, mode clair par défaut, adaptation dynamique) ---
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-toggle-icon');

function setTheme(mode) {
  if (mode === 'dark') {
    document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    themeIcon.innerHTML = `<svg width='28' height='28' fill='none' viewBox='0 0 24 24'><path d='M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z' stroke='url(#moonOrange)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/><defs><linearGradient id='moonOrange' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#FFB347'/><stop offset='100%' stop-color='#FF9900'/></linearGradient></defs></svg>`;
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    themeIcon.innerHTML = `<svg width='28' height='28' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='5' fill='url(#sunOrange)'/><path d='M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' stroke='url(#sunOrange)' stroke-width='2' stroke-linecap='round'/><defs><linearGradient id='sunOrange' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#FFB347'/><stop offset='100%' stop-color='#FF9900'/></linearGradient></defs></svg>`;
  }
}

function getPreferredTheme() {
  const stored = localStorage.getItem('theme');
  if (stored) return stored;
  // Par défaut : clair
  return 'light';
}

function applySystemTheme(e) {
  // Si l'utilisateur n'a pas choisi, on suit l'appareil
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches ? 'dark' : 'light');
  }
}

const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
systemDark.addEventListener('change', applySystemTheme);
setTheme(getPreferredTheme());

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark')) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  });
}
// --- Animation SVG background lines ---
(function animateBackgroundLines() {
  const svg = document.getElementById('bg-lines-svg');
  if (!svg) return;
  // Beaucoup plus de lignes, couvrant toute la page, trajectoires variées, couleurs vives
  const paths = [];
  const h = 900, w = 1440;
  for (let i = 0; i < 12; i++) {
    // Haut vers bas, sinusoïdal
    const y1 = 60 + i * 60;
    const y2 = 200 + i * 30;
    const y3 = 400 + i * 20;
    paths.push(`M0 ${y1} Q ${w/3} ${y2}, ${w*2/3} ${y3} T ${w} ${y1}`);
  }
  for (let i = 0; i < 8; i++) {
    // Bas vers haut
    const y1 = h - 40 - i * 50;
    const y2 = h - 200 - i * 30;
    const y3 = h - 400 - i * 20;
    paths.push(`M0 ${y1} Q ${w/4} ${y2}, ${w*3/4} ${y3} T ${w} ${y1}`);
  }
  for (let i = 0; i < 8; i++) {
    // Diagonales et sinusoïdes
    const y1 = 100 + i * 90;
    const y2 = 300 + i * 40 + 60 * Math.sin(i);
    const y3 = 700 - i * 30 + 40 * Math.cos(i);
    paths.push(`M0 ${y1} Q ${w/2} ${y2}, ${w} ${y3}`);
  }
  // Couleurs vives (orange, jaune, bleu, violet, rose, vert, turquoise, magenta...)
  const colors = [
    '#FF9900', '#FFD600', '#FF3CAC', '#4FFFB0', '#00CFFF', '#7B61FF', '#FFB347', '#FF5E62',
    '#76cfff', '#a97ff7', '#FF0080', '#00FFB8', '#FFB300', '#FF1B6B', '#00FFA3', '#FF61A6',
    '#FFB347', '#FF9900', '#00CFFF', '#7B61FF', '#FF3CAC', '#4FFFB0', '#FFD600', '#FF0080',
    '#00FFB8', '#FFB300', '#FF1B6B', '#00FFA3', '#FF61A6'
  ];
  svg.innerHTML = '';
  const pathEls = paths.map((d, i) => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    p.setAttribute('stroke', colors[i % colors.length]);
    p.setAttribute('stroke-width', '2.5');
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke-linecap', 'round');
    svg.appendChild(p);
    return p;
  });
  // Animation
  let t0 = performance.now();
  function animate() {
    const t = (performance.now() - t0) / 1000;
    pathEls.forEach((p, i) => {
      const len = p.getTotalLength();
      // Dasharray animée
      const dash = 60 + 30 * Math.sin(t * 0.5 + i * 0.3);
      p.setAttribute('stroke-dasharray', `${dash} ${len}`);
      // Dashoffset animée
      const offset = (len * (0.5 + 0.5 * Math.sin(t * 0.3 + i * 0.7)));
      p.setAttribute('stroke-dashoffset', offset);
      // Opacité animée
      p.setAttribute('opacity', 0.18 + 0.18 * Math.sin(t * 0.7 + i));
    });
    requestAnimationFrame(animate);
  }
  animate();
  // Responsive
  function resize() {
    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', window.innerHeight);
  }
  window.addEventListener('resize', resize);
  resize();
})();
// --- Formulaire minimaliste ---
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Connexion réussie !');
  setTimeout(() => {
    window.location.href = '/index';
  }, 400);
}); 