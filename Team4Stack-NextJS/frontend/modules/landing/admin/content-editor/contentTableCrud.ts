import { coursesApi, landingApi, teamApi } from '@/lib/api';

const getApiForTable = (tableName: string) => {
  if (tableName === 'reviews' || tableName === 'projects' || tableName === 'services') {
    return landingApi;
  }
  if (tableName === 'team_members' || tableName === 'mentor_profiles') {
    return teamApi;
  }
  if (tableName === 'courses') {
    return coursesApi;
  }
  return null;
};

export const updateContentTableRecord = async (tableName: string, id: number, payload: any) => {
  const api = getApiForTable(tableName) as any;
  if (!api) {
    return { error: `Unknown table: ${tableName}` };
  }

  if (tableName === 'reviews') return await api.updateReview(id, payload);
  if (tableName === 'projects') return await api.updateProject(id, payload);
  if (tableName === 'services') return await api.updateService(id, payload);
  if (tableName === 'team_members') return await api.updateTeamMember(id, payload);
  if (tableName === 'mentor_profiles') return await api.updateMentorProfile(id, payload);
  if (tableName === 'courses') return await api.updateCourse(id, payload);

  return { error: `Update not implemented for table: ${tableName}` };
};

export const createContentTableRecord = async (tableName: string, payload: any) => {
  const api = getApiForTable(tableName) as any;
  if (!api) {
    return { error: `Unknown table: ${tableName}` };
  }

  if (tableName === 'reviews') return await api.createReview(payload);
  if (tableName === 'projects') return await api.createProject(payload);
  if (tableName === 'services') return await api.createService(payload);
  if (tableName === 'team_members') return await api.createTeamMember(payload);
  if (tableName === 'mentor_profiles') return await api.createMentorProfile(payload);
  if (tableName === 'courses') return await api.createCourse(payload);

  return { error: `Create not implemented for table: ${tableName}` };
};

export const deleteContentTableRecord = async (tableName: string, id: number) => {
  const api = getApiForTable(tableName) as any;
  if (!api) {
    return { error: `Unknown table: ${tableName}` };
  }

  if (tableName === 'reviews') return await api.deleteReview(id);
  if (tableName === 'projects') return await api.deleteProject(id);
  if (tableName === 'services') return await api.deleteService(id);
  if (tableName === 'team_members') return await api.deleteTeamMember(id);
  if (tableName === 'mentor_profiles') return await api.deleteMentorProfile(id);
  if (tableName === 'courses') return await api.deleteCourse(id);

  return { error: `Delete not implemented for table: ${tableName}` };
};

// Accept JSON array or comma/newline separated text from form input.
export const toFeaturesJson = (raw?: string | null) => {
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
    return [String(parsed)];
  } catch {
    const parts = value
      .split(/[\n,;•|]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    return parts.length ? parts : null;
  }
};
