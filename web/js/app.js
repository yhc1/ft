import { renderSidebar } from './sidebar.js';
import { renderFoundational } from './pages/foundational.js';
import { renderReadiness } from './pages/readiness.js';
import { renderDimension } from './pages/dimension.js';

let appData = null;

async function loadData() {
  const [prereqRes, dimRes] = await Promise.all([
    fetch('./data/prerequisites.json'),
    fetch('./data/dimensions.json')
  ]);
  const prereqs = await prereqRes.json();
  const dims = await dimRes.json();
  return { prerequisites: prereqs.prerequisites, prereqGroups: prereqs.groups, ...dims };
}

function navigate(pageId) {
  history.replaceState(null, '', `#${pageId}`);
  render(pageId);
}

function render(pageId) {
  const content = document.getElementById('content');
  const prereqById = Object.fromEntries(appData.prerequisites.map(p => [p.id, p]));

  if (pageId === 'foundational') {
    renderFoundational(content, appData.foundationalRequirements);
  } else if (pageId === 'readiness') {
    renderReadiness(content, appData, () => {
      renderSidebar(appData, navigate, pageId);
    });
  } else {
    const dim = appData.dimensions.find(d => d.id === pageId);
    if (dim) renderDimension(content, dim, prereqById);
  }

  renderSidebar(appData, navigate, pageId);
}

function getCurrentPage() {
  return location.hash.slice(1) || 'foundational';
}

async function init() {
  appData = await loadData();
  render(getCurrentPage());
  window.addEventListener('hashchange', () => render(getCurrentPage()));
}

init();
