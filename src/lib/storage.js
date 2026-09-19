import { base44 } from '@/api/base44Client';
import { STYLES_LIST, generatePoeticDescription } from './promptEngine';

// ─── Normalize: DB record → internal project shape ────────────────────────────
function fromDB(record) {
  return {
    id:                  record.id,
    name:                record.name || '',
    number:              record.number || 0,
    poeticDescription:   record.poetic_description || '',
    inspirationImage:    record.inspiration_image || null,
    createdAt:           new Date(record.created_date).getTime(),
    updatedAt:           new Date(record.updated_date).getTime(),
    styleSynthesis:      record.style_synthesis      || { styleA: '', styleB: '' },
    visualDescription:   record.visual_description   || { materials: '', palette: '', light: '', atmosphere: '' },
    boards:              record.boards               || { materials: { prompt: '', resultImage: null }, colors: { prompt: '', resultImage: null }, mood: { prompt: '', resultImage: null } },
    rooms:               record.rooms                || { living: { prompt: '', resultImage: null }, kitchen: { prompt: '', resultImage: null }, bedroom: { prompt: '', resultImage: null }, bathroom: { prompt: '', resultImage: null } },
    buildingTypes:       record.building_types       || { private: { prompt: '', resultImage: null }, building: { prompt: '', resultImage: null } },
  };
}

// ─── Normalize: internal project → DB record ─────────────────────────────────
function toDB(project) {
  return {
    name:               project.name || '',
    number:             project.number || 0,
    poetic_description: generatePoeticDescription(project),
    inspiration_image:  project.inspirationImage || null,
    style_synthesis:    project.styleSynthesis    || {},
    visual_description: project.visualDescription || {},
    boards:             project.boards            || {},
    rooms:              project.rooms             || {},
    building_types:     project.buildingTypes     || {},
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function loadProjects() {
  const records = await base44.entities.Project.list('-updated_date', 100);
  return records.map(fromDB);
}

export async function saveProject(project) {
  const data = toDB(project);
  if (project._isNew) {
    // Assign sequential number based on existing count
    const existing = await base44.entities.Project.list('-updated_date', 100);
    data.number = existing.length + 1;
    const created = await base44.entities.Project.create(data);
    return fromDB(created);
  } else {
    const updated = await base44.entities.Project.update(project.id, data);
    return fromDB(updated);
  }
}

export async function deleteProject(id) {
  await base44.entities.Project.delete(id);
}

export function createProject(name) {
  return {
    id:               null,
    _isNew:           true,
    name:             name || '',
    number:           0,
    createdAt:        Date.now(),
    updatedAt:        Date.now(),
    poeticDescription: '',
    inspirationImage: null,
    styleSynthesis:   { styleA: '', styleB: '' },
    visualDescription: { materials: '', palette: '', light: '', atmosphere: '' },
    boards: {
      materials: { prompt: '', resultImage: null, status: 'empty' },
      colors:    { prompt: '', resultImage: null, status: 'empty' },
      mood:      { prompt: '', resultImage: null, status: 'empty' },
    },
    rooms: {
      living:   { prompt: '', resultImage: null, status: 'empty' },
      kitchen:  { prompt: '', resultImage: null, status: 'empty' },
      bedroom:  { prompt: '', resultImage: null, status: 'empty' },
      bathroom: { prompt: '', resultImage: null, status: 'empty' },
    },
    buildingTypes: {
      private:  { prompt: '', resultImage: null, status: 'empty' },
      building: { prompt: '', resultImage: null, status: 'empty' },
    },
  };
}

export function getProjectName(project) {
  if (!project) return '';
  const { styleSynthesis } = project;
  if (!styleSynthesis?.styleA && !styleSynthesis?.styleB) return project.name;
  const a = STYLES_LIST.find(s => s.id === styleSynthesis.styleA)?.label || '';
  const b = STYLES_LIST.find(s => s.id === styleSynthesis.styleB)?.label || '';
  return [a, b].filter(Boolean).join(' × ') || project.name;
}