/* ══════════════════════════════════════════════════════════════
   Sidebar — slide-out panel replacing toolbar dropdowns
   ══════════════════════════════════════════════════════════════ */
import type { AppState } from "./map-state";
import { closeAllDropdowns } from "./style-system";

export type SidebarSection = 'title' | 'style' | 'layers' | 'export' | 'overlays';

const SECTION_TITLES: Record<SidebarSection, string> = {
  title: 'Title',
  style: 'Style',
  layers: 'Layers',
  export: 'Export',
  overlays: 'Overlays',
};

let currentSection: SidebarSection | null = null;

function isOpen(): boolean {
  return document.getElementById('sidebar')?.classList.contains('open') ?? false;
}

export function openSidebar(section: SidebarSection): void {
  const sidebar = document.getElementById('sidebar');
  const title = document.getElementById('sidebar-title');
  if (!sidebar) return;

  // Show the right section, hide others
  document.querySelectorAll('.sidebar-section').forEach(el => {
    (el as HTMLElement).style.display = (el as HTMLElement).dataset.section === section ? '' : 'none';
  });

  if (title) title.textContent = SECTION_TITLES[section];
  currentSection = section;

  sidebar.classList.add('open');
  document.getElementById('page')?.classList.add('sidebar-open');

  // Update active toolbar button
  document.querySelectorAll('#toolbar .tb-btn').forEach(btn => {
    const tool = (btn as HTMLElement).dataset.tool;
    const sectionMap: Record<string, SidebarSection> = { title: 'title', style: 'style', layers: 'layers', export: 'export' };
    btn.classList.toggle('active', tool !== undefined && sectionMap[tool] === section);
  });
}

export function closeSidebar(): void {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.classList.remove('open');
  document.getElementById('page')?.classList.remove('sidebar-open');
  currentSection = null;

  // Clear active states on toolbar buttons tied to sidebar
  ['tool-title', 'tool-style', 'tool-layers', 'tool-export'].forEach(id => {
    document.getElementById(id)?.classList.remove('active');
  });
}

export function toggleSidebar(section: SidebarSection): void {
  if (isOpen() && currentSection === section) {
    closeSidebar();
  } else {
    closeAllDropdowns();
    openSidebar(section);
  }
}

export function setupSidebar(_state: AppState): void {
  const closeBtn = document.getElementById('sidebar-close');
  closeBtn?.addEventListener('click', closeSidebar);

  // Style button
  document.getElementById('tool-style')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSidebar('style');
  });

  // Layers button
  document.getElementById('tool-layers')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSidebar('layers');
  });

  // Export button (replaces download dropdown)
  document.getElementById('tool-export')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSidebar('export');
  });

  // Close sidebar on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      closeSidebar();
    }
  });

  // Close sidebar when clicking on the map (not on mobile where sidebar is a bottom sheet)
  document.getElementById('map')?.addEventListener('click', () => {
    if (isOpen() && window.innerWidth > 768) {
      closeSidebar();
    }
  });
}
