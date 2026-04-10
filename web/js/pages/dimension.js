import { isChecked } from '../state.js';
import { useCaseReadiness } from '../state.js';
import { t } from '../lang.js';

export function renderDimension(container, dim, prereqById) {
  container.innerHTML = `
    <h1 class="page-title">${t(dim.name)}</h1>
    <p class="page-subtitle">${t(dim.description)}</p>

    <div class="section">
      <div class="section-title">${t({en: 'Prerequisites', zh: '前置條件'})}</div>
      <ol class="prereq-numbered">
        ${dim.prerequisites.map((p, i) => {
          const checked = isChecked(p.globalId);
          return `
            <li>
              <span class="prereq-num">${i + 1}</span>
              <div class="prereq-content">
                <div class="prereq-name-row">
                  <strong>${t(p.displayName)}</strong>
                  <span class="prereq-status-badge ${checked ? 'have' : 'missing'}">
                    ${checked ? `✓ ${t({en: 'You have this', zh: '已具備'})}` : t({en: 'Not yet', zh: '尚未具備'})}
                  </span>
                </div>
                <ul class="prereq-sub">
                  ${p.items.map(item => `<li>${t(item)}</li>`).join('')}
                </ul>
              </div>
            </li>
          `;
        }).join('')}
      </ol>
    </div>

    <div class="section">
      <div class="section-title">${t({en: 'Modelling Processes &amp; Model Outputs', zh: '建模流程與模型輸出'})}</div>
      <table class="use-case-table">
        <thead>
          <tr>
            <th>${t({en: 'Use Case', zh: '應用情境'})}</th>
            <th>${t({en: 'Required Data', zh: '所需資料'})}</th>
            <th>${t({en: 'Modelling Process', zh: '建模流程'})}</th>
            <th>${t({en: 'Model Output', zh: '模型輸出'})}</th>
            <th>${t({en: 'Reference Case', zh: '參考案例'})}</th>
          </tr>
        </thead>
        <tbody>
          ${dim.useCases.map(uc => {
            const ready = useCaseReadiness(uc.requiredPrereqIds) === 'ready';
            return `
              <tr>
                <td>
                  <div class="uc-name-cell">
                    ${t(uc.name)}
                    <span class="ready-badge ${ready ? 'ready' : 'not-ready'}">
                      ${ready ? `✓ ${t({en: 'Ready', zh: '已就緒'})}` : t({en: 'Prereqs needed', zh: '待備齊前置條件'})}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="prereq-dots-row">
                    ${uc.requiredPrereqIds.map(id => {
                      const p = prereqById[id];
                      const has = isChecked(id);
                      return `<span class="prereq-pill ${has ? 'has' : 'missing'}" title="${p ? t(p.description) : ''}">
                        <span class="prereq-dot ${has ? 'has' : 'missing'}"></span>
                        ${p ? t(p.name) : id}
                      </span>`;
                    }).join('')}
                  </div>
                </td>
                <td>${t(uc.modellingProcess)}</td>
                <td>${t(uc.modelOutput)}</td>
                <td class="ref">${uc.referenceCase}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="tech-toggle collapsed" id="tech-toggle">
        <span class="tech-toggle-label">
          ${t({en: 'Technical Assessments', zh: '技術評估'})}
          <span style="font-size:0.75rem;font-weight:400;color:#94a3b8">${dim.technicalAssessments.length} ${t({en: 'points', zh: '項'})}</span>
        </span>
        <span class="tech-arrow">▼</span>
      </div>
      <div class="tech-body hidden" id="tech-body">
        ${dim.technicalAssessments.map(a => `
          <div class="tech-item">
            <strong>${t(a.title)}</strong>
            <p>${t(a.content)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const toggle = container.querySelector('#tech-toggle');
  const body = container.querySelector('#tech-body');
  toggle.addEventListener('click', () => {
    const collapsed = body.classList.toggle('hidden');
    toggle.classList.toggle('collapsed', collapsed);
  });
}
