import { coursesApi, landingApi, teamApi } from '@/lib/api';
import { retryWithBackoff } from '@/lib/utils/retry';
import { CONTACT_SITE_SETTING_KEYS, FOOTER_SITE_SETTING_KEYS, HERO_SITE_SETTING_KEYS } from '@/modules/landing/admin/content-editor/siteSettingsKeys';

interface FetchLandingContentRowsArgs {
  table: string;
  isReviews: boolean;
  isTeamLike: boolean;
  isCourses: boolean;
  isServices: boolean;
  isContact: boolean;
  isFooter: boolean;
  isHero: boolean;
  isSupport: boolean;
  isProjects: boolean;
}

const sortByOrderAndNewest = (items: any[]) =>
  items.sort((a: any, b: any) => {
    if (a.order_index !== b.order_index) return (a.order_index || 999) - (b.order_index || 999);
    return (b.id || 0) - (a.id || 0);
  });

export const fetchLandingContentRows = async ({
  table,
  isReviews,
  isTeamLike,
  isCourses,
  isServices,
  isContact,
  isFooter,
  isHero,
  isSupport,
  isProjects
}: FetchLandingContentRowsArgs): Promise<{ data: any[]; error: Error | null }> => {
  try {
    if (isReviews) {
      const result = await retryWithBackoff(async () => await landingApi.getReviews());
      const data = (result.data || []) as any[];
      data.sort((a: any, b: any) => {
        if (a.order_index !== b.order_index) return (a.order_index || 999) - (b.order_index || 999);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      return { data, error: null };
    }

    if (isTeamLike) {
      const result = table === 'team_members'
        ? await retryWithBackoff(async () => await teamApi.getTeamMembers())
        : await retryWithBackoff(async () => await teamApi.getMentorProfiles());
      const data = (result.data || []) as any[];
      data.sort((a: any, b: any) => {
        if (a.is_head !== b.is_head) return b.is_head ? 1 : -1;
        if (a.order_index !== b.order_index) return (a.order_index || 999) - (b.order_index || 999);
        return (b.id || 0) - (a.id || 0);
      });
      return { data, error: null };
    }

    if (isCourses) {
      const result = await retryWithBackoff(async () => await coursesApi.getAllCourses());
      return { data: sortByOrderAndNewest((result.data || []) as any[]), error: null };
    }

    if (isServices) {
      const result = await retryWithBackoff(async () => await landingApi.getServices());
      return { data: sortByOrderAndNewest((result.data || []) as any[]), error: null };
    }

    if (isContact || isFooter || isHero) {
      const keys = [
        ...(isContact ? CONTACT_SITE_SETTING_KEYS : []),
        ...(isFooter ? FOOTER_SITE_SETTING_KEYS : []),
        ...(isHero ? HERO_SITE_SETTING_KEYS : [])
      ];
      const result = await retryWithBackoff(async () => await landingApi.getSiteSettings(keys));
      return { data: (result.data || []) as any[], error: null };
    }

    if (isSupport) {
      const result = await retryWithBackoff(
        async () => await landingApi.getSupportRequests({ target_area: 'site' })
      );
      const data = (result.data || []) as any[];
      data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return { data, error: null };
    }

    if (isProjects) {
      const result = await retryWithBackoff(async () => await landingApi.getProjects());
      return { data: sortByOrderAndNewest((result.data || []) as any[]), error: null };
    }

    return { data: [], error: new Error('Unknown content type') };
  } catch (error) {
    return { data: [], error: error as Error };
  }
};

export const buildAvailableOrders = ({
  data,
  isServices,
  isReviews,
  isProjects,
  editingId
}: {
  data: any[];
  isServices: boolean;
  isReviews: boolean;
  isProjects: boolean;
  editingId: number | null;
}): number[] => {
  if (isServices) {
    const usedOrders = new Set(
      data.map((row: any) => row.order_index).filter((value: any) => value !== null && value !== undefined)
    );
    const maxOrder = Math.max(...Array.from(usedOrders), 0);
    const available: number[] = [];

    for (let order = 1; order <= maxOrder + 10; order += 1) {
      if (!usedOrders.has(order)) available.push(order);
    }

    if (editingId !== null) {
      const currentItem = data.find((row: any) => row.id === editingId);
      if (currentItem && currentItem.order_index !== null && currentItem.order_index !== undefined) {
        if (!available.includes(currentItem.order_index)) {
          available.push(currentItem.order_index);
          available.sort((a, b) => a - b);
        }
      }
    }

    return available;
  }

  if (isReviews || isProjects) {
    const usedOrders = new Set(
      data.map((row: any) => row.order_index).filter((value: any) => value !== null && value !== undefined)
    );
    const available: number[] = [];
    for (let order = 1; order <= 30; order += 1) {
      if (!usedOrders.has(order)) available.push(order);
    }
    return available;
  }

  return [];
};

export const parseSiteSettingsArray = <T,>({
  rows,
  key,
  fallback,
  maxItems
}: {
  rows: any[];
  key: string;
  fallback: T[];
  maxItems?: number;
}): T[] => {
  const raw = rows.find((row: any) => row.key === key)?.value;
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const merged = [...parsed, ...fallback];
    return typeof maxItems === 'number' ? merged.slice(0, maxItems) : merged;
  } catch {
    return fallback;
  }
};
