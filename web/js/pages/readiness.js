import { isChecked, togglePrereq, useCaseReadiness } from '../state.js';
import { t } from '../lang.js';

export function renderReadiness(container, data, onUpdate) {
  const { prerequisites, dimensions } = data;
  const groups = data.prereqGroups;

  const prereqById = Object.fromEntries(prerequisites.map(p => [p.id, p]));

  const allUseCases = dimensions.flatMap(dim =>
    dim.useCases.map(uc => ({ ...uc, dimensionName: dim.name }))
  );

  function mount() {
    container.innerHTML = `
      <h1 class="page-title">${t({en: 'Readiness Check', zh: '準備度檢核'})}</h1>
      <p class="page-subtitle">
        ${t({
          en: 'Select the data and resources your organisation currently has. The matrix below will update to show which experiments are ready to run.',
          zh: '選擇您的組織目前擁有的資料與資源。下方矩陣將即時更新，顯示哪些應用情境已具備執行條件。'
        })}
      </p>

      ${groups.map(group => {
        const groupPrereqs = prerequisites.filter(p => p.group === group.id);
        const checkedCount = groupPrereqs.filter(p => isChecked(p.id)).length;
        return `
          <div class="prereq-group">
            <div class="prereq-group-header">
              <div>
                <div class="prereq-group-label">${t(group.label)}</div>
                <div class="prereq-group-desc">${t(group.description)}</div>
              </div>
              <div class="prereq-group-count">${checkedCount} / ${groupPrereqs.length}</div>
            </div>
            <div class="prereq-card-grid">
              ${groupPrereqs.map(p => `
                <button class="prereq-card ${isChecked(p.id) ? 'checked' : ''}" data-id="${p.id}">
                  <div class="prereq-card-check">${isChecked(p.id) ? '✓' : ''}</div>
                  <div class="prereq-card-body">
                    <div class="prereq-card-name">${t(p.name)}</div>
                    <div class="prereq-card-desc">${t(p.description)}</div>
                  </div>
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}

      <h2 class="matrix-heading">
        ${t({en: 'Use Case Readiness', zh: '應用情境準備度'})}
        <span class="matrix-legend">
          <span class="dot-legend has"></span> ${t({en: 'Have', zh: '已具備'})} &nbsp;
          <span class="dot-legend missing"></span> ${t({en: 'Missing', zh: '尚缺'})}
        </span>
      </h2>

      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>${t({en: 'Use Case', zh: '應用情境'})}</th>
              <th>${t({en: 'Dimension', zh: '維度'})}</th>
              <th>${t({en: 'Required Prerequisites', zh: '所需前置條件'})}</th>
              <th>${t({en: 'Ready?', zh: '是否就緒？'})}</th>
            </tr>
          </thead>
          <tbody>
            ${allUseCases.map(uc => {
              const status = useCaseReadiness(uc.requiredPrereqIds);
              return `
                <tr>
                  <td class="uc-name">${t(uc.name)}</td>
                  <td class="uc-dim">${t(uc.dimensionName)}</td>
                  <td>
                    <div class="prereq-dots-row">
                      ${uc.requiredPrereqIds.map(id => {
                        const p = prereqById[id];
                        const has = isChecked(id);
                        return `<span class="prereq-pill ${has ? 'has' : 'missing'}" title="${t(p.description)}">
                          <span class="prereq-dot ${has ? 'has' : 'missing'}"></span>
                          ${t(p.name)}
                        </span>`;
                      }).join('')}
                    </div>
                  </td>
                  <td>
                    <span class="ready-badge ${status}">
                      ${status === 'ready' ? `✓ ${t({en: 'Ready', zh: '已就緒'})}` : `✗ ${t({en: 'Not ready', zh: '尚未就緒'})}`}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.querySelectorAll('.prereq-card').forEach(btn => {
      btn.addEventListener('click', () => {
        togglePrereq(btn.dataset.id);
        mount();
        onUpdate();
      });
    });
  }

  mount();
}
