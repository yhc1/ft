import { isChecked } from '../state.js';
import { useCaseReadiness } from '../state.js';

export function renderDimension(container, dim, prereqById) {
  container.innerHTML = `
    <h1 class="page-title">${dim.name}</h1>
    <p class="page-subtitle">${dim.description}</p>

    <div class="section">
      <div class="section-title">Prerequisites</div>
      <ol class="prereq-numbered">
        ${dim.prerequisites.map((p, i) => {
          const checked = isChecked(p.globalId);
          return `
            <li>
              <span class="prereq-num">${i + 1}</span>
              <div class="prereq-content">
                <div class="prereq-name-row">
                  <strong>${p.displayName}</strong>
                  <span class="prereq-status-badge ${checked ? 'have' : 'missing'}">
                    ${checked ? '✓ You have this' : '✗ Not selected'}
                  </span>
                </div>
                <ul class="prereq-sub">
                  ${p.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            </li>
          `;
        }).join('')}
      </ol>
    </div>

    <div class="section">
      <div class="section-title">Modelling Processes &amp; Model Outputs</div>
      <table class="use-case-table">
        <thead>
          <tr>
            <th>Use Case</th>
            <th>Required Data</th>
            <th>Modelling Process</th>
            <th>Model Output</th>
            <th>Reference Case</th>
          </tr>
        </thead>
        <tbody>
          ${dim.useCases.map(uc => {
            const ready = useCaseReadiness(uc.requiredPrereqIds) === 'ready';
            return `
              <tr>
                <td>
                  <div class="uc-name-cell">
                    ${uc.name}
                    <span class="ready-badge ${ready ? 'ready' : 'not-ready'}">
                      ${ready ? '✓ Ready' : '✗ Not ready'}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="prereq-dots-row">
                    ${uc.requiredPrereqIds.map(id => {
                      const p = prereqById[id];
                      const has = isChecked(id);
                      return `<span class="prereq-pill ${has ? 'has' : 'missing'}" title="${p ? p.description : ''}">
                        <span class="prereq-dot ${has ? 'has' : 'missing'}"></span>
                        ${p ? p.name : id}
                      </span>`;
                    }).join('')}
                  </div>
                </td>
                <td>${uc.modellingProcess}</td>
                <td>${uc.modelOutput}</td>
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
          Technical Assessments
          <span style="font-size:0.75rem;font-weight:400;color:#94a3b8">${dim.technicalAssessments.length} points</span>
        </span>
        <span class="tech-arrow">▼</span>
      </div>
      <div class="tech-body hidden" id="tech-body">
        ${dim.technicalAssessments.map(a => `
          <div class="tech-item">
            <strong>${a.title}</strong>
            <p>${a.content}</p>
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
