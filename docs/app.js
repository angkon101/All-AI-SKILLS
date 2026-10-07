/**
 * MASTER AI AGENT SKILLS - PRODUCTION GITHUB PAGES APP
 * Features:
 * - 60 FPS Particle Constellation Canvas with Mouse Gravity
 * - Real-Time Dynamic Search & Track Filtering across 110 Skills
 * - Interactive Modal Inspector & Instant Prompt Snippet Copy
 * - Animated Stats Counters & Terminal Tab Switcher
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initStatsCounter();
  initTerminalTabs();
  renderTrackFilterPills();
  renderSkillCards();
  initSearch();
  initModalEvents();
});

// ============================================================================
// 1. PARTICLE CONSTELLATION 60 FPS CANVAS
// ============================================================================
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const mouse = { x: null, y: null, radius: 140 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle configuration
  const particleCount = Math.min(Math.floor((width * height) / 16000), 75);
  const particles = [];

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1;
      this.baseColor = Math.random() > 0.4 ? '#00f2fe' : '#9b51e0';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse gentle repulsion/attraction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.baseColor;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.baseColor;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const alpha = 1 - dist / 130;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.18})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// ============================================================================
// 2. STATS COUNTER ANIMATION
// ============================================================================
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach((el) => {
    const target = parseInt(el.getAttribute('data-target') || '0', 10);
    if (!target) return;

    let current = 0;
    const increment = Math.max(1, Math.ceil(target / 40));
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current + (el.getAttribute('data-suffix') || '');
    }, 25);
  });
}

// ============================================================================
// 3. TERMINAL TAB SWITCHER (PowerShell vs Bash)
// ============================================================================
function initTerminalTabs() {
  const tabs = document.querySelectorAll('.terminal-tab');
  const cmdDisplay = document.getElementById('terminal-cmd-display');

  const commands = {
    powershell: '.\\install-skills.ps1 -Destination "C:\\Path\\To\\MyProject"',
    bash: './install-skills.sh /path/to/my-project',
    global: '.\\install-skills.ps1 -Global'
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const mode = tab.getAttribute('data-tab');
      if (commands[mode] && cmdDisplay) {
        cmdDisplay.textContent = commands[mode];
      }
    });
  });

  const copyBtn = document.getElementById('terminal-copy-btn');
  if (copyBtn && cmdDisplay) {
    copyBtn.addEventListener('click', () => {
      copyToClipboard(cmdDisplay.textContent.trim(), 'Install command copied to clipboard!');
    });
  }
}

// ============================================================================
// 4. TRACK FILTER PILLS
// ============================================================================
let currentTrackFilter = 'ALL';
let currentSearchQuery = '';

function renderTrackFilterPills() {
  const container = document.getElementById('track-filter-container');
  if (!container || !window.SKILLS_DATA || !window.SKILLS_DATA.tracks) return;

  const tracks = window.SKILLS_DATA.tracks;
  const totalCount = window.SKILLS_DATA?.skills?.length || 110;
  let html = `<button class="track-pill active" data-track-id="ALL">⚡ All Tracks (${totalCount})</button>`;

  tracks.forEach((track) => {
    const shortName = track.name.split(':')[1]?.trim() || track.name;
    const count = track.skills.length;
    html += `<button class="track-pill" data-track-id="${track.id}">${shortName} (${count})</button>`;
  });

  container.innerHTML = html;

  const pills = container.querySelectorAll('.track-pill');
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentTrackFilter = pill.getAttribute('data-track-id');
      filterAndRenderSkills();
    });
  });
}

// ============================================================================
// 5. RENDER SKILL CARDS & FILTERING
// ============================================================================
function filterAndRenderSkills() {
  if (!window.SKILLS_DATA || !window.SKILLS_DATA.skills) return;

  const allSkills = window.SKILLS_DATA.skills;
  const tracks = window.SKILLS_DATA.tracks;

  const filtered = allSkills.filter((skill) => {
    // 1. Filter by Track
    if (currentTrackFilter !== 'ALL') {
      const activeTrack = tracks.find((t) => t.id === currentTrackFilter);
      if (!activeTrack || !activeTrack.skills.includes(skill.id)) {
        return false;
      }
    }

    // 2. Filter by Search Query
    if (currentSearchQuery.trim() !== '') {
      const query = currentSearchQuery.toLowerCase();
      const matchName = skill.name.toLowerCase().includes(query);
      const matchSummary = skill.summary.toLowerCase().includes(query);
      const matchCategory = skill.category.toLowerCase().includes(query);
      const matchId = skill.id.toLowerCase().includes(query);

      if (!matchName && !matchSummary && !matchCategory && !matchId) {
        return false;
      }
    }

    return true;
  });

  renderCardsHtml(filtered);
}

function renderSkillCards() {
  filterAndRenderSkills();
}

function renderCardsHtml(skillsList) {
  const container = document.getElementById('skills-grid-container');
  const countDisplay = document.getElementById('filtered-count-display');

  if (countDisplay) {
    const totalCount = window.SKILLS_DATA?.skills?.length || 110;
    countDisplay.textContent = `Showing ${skillsList.length} of ${totalCount} Skills`;
  }

  if (!container) return;

  if (skillsList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #94a3b8;">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
        <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: #fff;">No matching skills found</h3>
        <p style="margin-top: 6px;">Try adjusting your search query or track filter.</p>
      </div>
    `;
    return;
  }

  const html = skillsList
    .map((skill) => {
      const order = skill.id.split('-')[0];
      const cleanName = skill.name.replace(/-/g, ' ');

      return `
      <div class="skill-card" data-skill-id="${skill.id}">
        <div>
          <div class="card-header">
            <span class="skill-order-badge">#${order}</span>
            <span class="skill-track-badge">${skill.category}</span>
          </div>
          <h3 class="skill-title">${capitalizeWords(cleanName)}</h3>
          <p class="skill-summary">${skill.summary}</p>
        </div>
        <div class="card-footer">
          <span class="skill-action-hint">View Runbook →</span>
          <button class="card-copy-btn" data-copy-name="${skill.name}" title="Copy Skill Name">
            Copy Prompt
          </button>
        </div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = html;

  // Add click events to cards to open modal
  container.querySelectorAll('.skill-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-copy-btn')) return;
      const skillId = card.getAttribute('data-skill-id');
      openSkillModal(skillId);
    });
  });

  // Add click events to card copy buttons
  container.querySelectorAll('.card-copy-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const skillName = btn.getAttribute('data-copy-name');
      const prompt = `Act as an expert software engineer using ${skillName} to solve this task: `;
      copyToClipboard(prompt, `Copied prompt activation for ${skillName}!`);
    });
  });
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

// ============================================================================
// 6. SEARCH INPUT DEBOUNCING
// ============================================================================
function initSearch() {
  const searchInput = document.getElementById('search-skills-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    filterAndRenderSkills();
  });
}

// ============================================================================
// 7. MODAL INSPECTOR
// ============================================================================
function initModalEvents() {
  const backdrop = document.getElementById('skill-modal-backdrop');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn && backdrop) {
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  const modalCopyBtn = document.getElementById('modal-copy-prompt-btn');
  if (modalCopyBtn) {
    modalCopyBtn.addEventListener('click', () => {
      const promptEl = document.getElementById('modal-prompt-content');
      if (promptEl) {
        copyToClipboard(promptEl.textContent.trim(), 'Skill activation prompt copied!');
      }
    });
  }
}

function openSkillModal(skillId) {
  if (!window.SKILLS_DATA || !window.SKILLS_DATA.skills) return;

  const skill = window.SKILLS_DATA.skills.find((s) => s.id === skillId);
  if (!skill) return;

  const backdrop = document.getElementById('skill-modal-backdrop');
  const title = document.getElementById('modal-skill-title');
  const orderBadge = document.getElementById('modal-order-badge');
  const categoryBadge = document.getElementById('modal-category-badge');
  const path = document.getElementById('modal-skill-path');
  const summary = document.getElementById('modal-skill-summary');
  const promptContent = document.getElementById('modal-prompt-content');

  const order = skill.id.split('-')[0];
  const cleanName = capitalizeWords(skill.name.replace(/-/g, ' '));

  if (title) title.textContent = cleanName;
  if (orderBadge) orderBadge.textContent = `#${order}`;
  if (categoryBadge) categoryBadge.textContent = skill.category;
  if (path) path.textContent = skill.path;
  if (summary) summary.textContent = skill.summary;

  const samplePrompt = `Act as an expert specialist using ${skill.name} to design and implement production-ready specifications, code, and test suites.`;
  if (promptContent) promptContent.textContent = samplePrompt;

  backdrop.classList.add('active');
}

function closeModal() {
  const backdrop = document.getElementById('skill-modal-backdrop');
  if (backdrop) backdrop.classList.remove('active');
}

// ============================================================================
// 8. CLIPBOARD & TOAST NOTIFICATION HELPER
// ============================================================================
function copyToClipboard(text, successMsg) {
  navigator.clipboard.writeText(text).then(
    () => {
      showToast(successMsg || 'Copied to clipboard!');
    },
    (err) => {
      console.error('Failed to copy: ', err);
    }
  );
}

function showToast(message) {
  const toast = document.getElementById('global-toast');
  const toastMsg = document.getElementById('toast-message');

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('active');

  setTimeout(() => {
    toast.classList.remove('active');
  }, 2800);
}
