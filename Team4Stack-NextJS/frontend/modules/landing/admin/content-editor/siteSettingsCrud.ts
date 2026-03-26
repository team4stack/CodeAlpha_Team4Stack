import { landingApi } from '@/lib/api';

export const deleteSiteSettingsWithFallback = async (keys: string[]) => {
  if (!keys.length) return { error: null as string | null };

  const deleteResult = await landingApi.deleteSiteSettings(keys);
  if (!deleteResult.error) {
    return { error: null as string | null };
  }

  const clearEntries = keys.map((key) => ({ key, value: '' }));
  const upsertResult = await landingApi.upsertSiteSettings(clearEntries);
  if (upsertResult.error) {
    return { error: upsertResult.error as string };
  }

  return { error: null as string | null };
};
