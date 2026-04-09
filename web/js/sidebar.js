import { dimensionStatus } from './state.js';

export function renderSidebar(data, navigate, activePage) {
  const nav = document.getElementById('sidebar-nav');

  const items = [
    { id: 'foundational', label: 'Foundational Requirements', special: false },
    { id: 'readiness', label: '📋 Readiness Check', special: true },
  ];

  const groups = [
    { label: 'Content Production', ids: ['investigative-reporting', 'interactive-data-visualization', 'fact-checking'] },
    { label: 'Audience Engagement', ids: ['content-optimisation', 'publishing-platform-promotion', 'personalised-recommendations'] },
    { label: 'Monetisation', ids: ['advertising', 'subscription-growth', 'user-retention-ltv'] },
  ];

  const dimById = Object.fromEntries(data.dimensions.map(d => [d.id, d]));

  nav.innerHTML = `
    ${items.map(item => `
      <button class="nav-item ${item.special ? 'nav-item-special' : ''} ${activePage === item.id ? 'active' : ''}"
              data-page="${item.id}">
        ${item.label}
      </button>
    `).join('')}
    ${groups.map(group => `
      <div class="nav-section-label">${group.label}</div>
      ${group.ids.map(id => {
        const dim = dimById[id];
        if (!dim) return '';
        const status = dimensionStatus(dim);
        return `
          <button class="nav-item ${activePage === id ? 'active' : ''}" data-page="${id}">
            <span class="status-dot ${status}"></span>
            ${dim.name}
          </button>
        `;
      }).join('')}
    `).join('')}
  `;

  nav.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });
}
