import { dimensionStatus } from './state.js';
import { t } from './lang.js';

export function renderSidebar(data, navigate, activePage) {
  const nav = document.getElementById('sidebar-nav');

  const items = [
    { id: 'foundational', label: {en: 'Foundational Requirements', zh: '基礎需求'}, special: false },
    { id: 'readiness',    label: {en: '📋 Readiness Check',         zh: '📋 準備度檢核'}, special: true },
  ];

  const groups = [
    { label: {en: 'Content Production',    zh: '內容製作'},   ids: ['investigative-reporting', 'interactive-data-visualization', 'fact-checking'] },
    { label: {en: 'Audience Engagement',   zh: '受眾互動'},   ids: ['content-optimisation', 'publishing-platform-promotion', 'personalised-recommendations'] },
    { label: {en: 'Monetisation',          zh: '商業化'},     ids: ['advertising', 'subscription-growth', 'user-retention-ltv'] },
  ];

  const dimById = Object.fromEntries(data.dimensions.map(d => [d.id, d]));

  nav.innerHTML = `
    ${items.map(item => `
      <button class="nav-item ${item.special ? 'nav-item-special' : ''} ${activePage === item.id ? 'active' : ''}"
              data-page="${item.id}">
        ${t(item.label)}
      </button>
    `).join('')}
    ${groups.map(group => `
      <div class="nav-section-label">${t(group.label)}</div>
      ${group.ids.map(id => {
        const dim = dimById[id];
        if (!dim) return '';
        const status = dimensionStatus(dim);
        return `
          <button class="nav-item ${activePage === id ? 'active' : ''}" data-page="${id}">
            <span class="status-dot ${status}"></span>
            ${t(dim.name)}
          </button>
        `;
      }).join('')}
    `).join('')}
  `;

  nav.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });
}
