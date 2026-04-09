export function renderFoundational(container, requirements) {
  container.innerHTML = `
    <h1 class="page-title">Foundational Requirements</h1>
    <p class="page-subtitle">
      The following conditions must be in place before any AI use case can be effectively implemented.
      These requirements apply across all capability dimensions.
    </p>
    <ul class="req-list">
      ${requirements.map((req, i) => `
        <li class="req-item">
          <strong>${i + 1}. ${req.name}</strong>
          <p>${req.description}</p>
        </li>
      `).join('')}
    </ul>
  `;
}
