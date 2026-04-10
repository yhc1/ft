import { t } from '../lang.js';

export function renderFoundational(container, requirements) {
  container.innerHTML = `
    <h1 class="page-title">${t({en: 'Foundational Requirements', zh: '基礎需求'})}</h1>
    <p class="page-subtitle">
      ${t({
        en: 'The following conditions must be in place before any AI use case can be effectively implemented. These requirements apply across all capability dimensions.',
        zh: '以下條件必須在任何AI應用情境有效實施之前到位。這些需求適用於所有能力維度。'
      })}
    </p>
    <ul class="req-list">
      ${requirements.map((req, i) => `
        <li class="req-item">
          <strong>${i + 1}. ${t(req.name)}</strong>
          <p>${t(req.description)}</p>
        </li>
      `).join('')}
    </ul>
  `;
}
