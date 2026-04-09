import { isChecked, togglePrereq, useCaseReadiness } from '../state.js';

export function renderReadiness(container, data, onUpdate) {
  const { prerequisites, dimensions } = data;
  const groups = data.prereqGroups;

  const prereqById = Object.fromEntries(prerequisites.map(p => [p.id, p]));

  const allUseCases = dimensions.flatMap(dim =>
    dim.useCases.map(uc => ({ ...uc, dimensionName: dim.name }))
  );

  function mount() {
    container.innerHTML = `
      <h1 class="page-title">Readiness Check</h1>
      <p class="page-subtitle">
        Select the data and resources your organisation currently has.
        The matrix below will update to show which experiments are ready to run.
      </p>

      ${groups.map(group => {
        const groupPrereqs = prerequisites.filter(p => p.group === group.id);
        const checkedCount = groupPrereqs.filter(p => isChecked(p.id)).length;
        return `
          <div class="prereq-group">
            <div class="prereq-group-header">
              <div>
                <div class="prereq-group-label">${group.label}</div>
                <div class="prereq-group-desc">${group.description}</div>
              </div>
              <div class="prereq-group-count">${checkedCount} / ${groupPrereqs.length}</div>
            </div>
            <div class="prereq-card-grid">
              ${groupPrereqs.map(p => `
                <button class="prereq-card ${isChecked(p.id) ? 'checked' : ''}" data-id="${p.id}">
                  <div class="prereq-card-check">${isChecked(p.id) ? '✓' : ''}</div>
                  <div class="prereq-card-body">
                    <div class="prereq-card-name">${p.name}</div>
                    <div class="prereq-card-desc">${p.description}</div>
                  </div>
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}

      <h2 class="matrix-heading">
        Use Case Readiness
        <span class="matrix-legend">
          <span class="dot-legend has"></span> Have &nbsp;
          <span class="dot-legend missing"></span> Missing
        </span>
      </h2>

      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Use Case</th>
              <th>Dimension</th>
              <th>Required Prerequisites</th>
              <th>Ready?</th>
            </tr>
          </thead>
          <tbody>
            ${allUseCases.map(uc => {
              const status = useCaseReadiness(uc.requiredPrereqIds);
              return `
                <tr>
                  <td class="uc-name">${uc.name}</td>
                  <td class="uc-dim">${uc.dimensionName}</td>
                  <td>
                    <div class="prereq-dots-row">
                      ${uc.requiredPrereqIds.map(id => {
                        const p = prereqById[id];
                        const has = isChecked(id);
                        return `<span class="prereq-pill ${has ? 'has' : 'missing'}" title="${p.description}">
                          <span class="prereq-dot ${has ? 'has' : 'missing'}"></span>
                          ${p.name}
                        </span>`;
                      }).join('')}
                    </div>
                  </td>
                  <td>
                    <span class="ready-badge ${status}">
                      ${status === 'ready' ? '✓ Ready' : '✗ Not ready'}
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
