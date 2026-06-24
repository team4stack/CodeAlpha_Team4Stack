import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.team4stack.com';

type MaybeCourse = { id?: number | string };
type MaybeProject = { id?: number | string };

function resolveApiBase(): string {
  const fromApi = process.env.NEXT_PUBLIC_API_URL?.trim() || '';
  if (fromApi) return fromApi.replace(/\/$/, '');
  const fromBackend = process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || '';
  if (!fromBackend) return '';
  const b = fromBackend.replace(/\/$/, '');
  return b.endsWith('/api') ? b : `${b}/api`;
}

async function fetchDynamicIds(): Promise<{ courseIds: number[]; projectIds: number[] }> {
  const apiBase = resolveApiBase();
  if (!apiBase) return { courseIds: [], projectIds: [] };

  const requestInit: RequestInit = {
    // sitemap route runs on server; keep fresh enough while avoiding over-fetch.
    next: { revalidate: 1800 }, // 30 min
  };

  const [coursesResult, projectsResult] = await Promise.allSettled([
    fetch(`${apiBase}/courses`, requestInit),
    fetch(`${apiBase}/landing/projects`, requestInit),
  ]);

  const courseIds: number[] = [];
  const projectIds: number[] = [];

  if (coursesResult.status === 'fulfilled' && coursesResult.value.ok) {
    try {
      const json = (await coursesResult.value.json()) as { data?: MaybeCourse[] };
      const rows = Array.isArray(json?.data) ? json.data : [];
      rows.forEach((c) => {
        const n = typeof c?.id === 'number' ? c.id : Number(c?.id);
        if (Number.isFinite(n) && n > 0) courseIds.push(n);
      });
    } catch {
      /* ignore malformed payload */
    }
  }

  if (projectsResult.status === 'fulfilled' && projectsResult.value.ok) {
    try {
      const json = (await projectsResult.value.json()) as { data?: MaybeProject[] };
      const rows = Array.isArray(json?.data) ? json.data : [];
      rows.forEach((p) => {
        const n = typeof p?.id === 'number' ? p.id : Number(p?.id);
        if (Number.isFinite(n) && n > 0) projectIds.push(n);
      });
    } catch {
      /* ignore malformed payload */
    }
  }

  return { courseIds, projectIds };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: string[] = [
    '/',
    '/courses',
    '/courses/apply',
    '/team',
    '/projects',
    '/contact',
    '/help',
    '/privacy',
    '/cookies',
    '/terms',
    '/student',
    '/student/courses',
    '/student/quiz',
    '/admin/login',
    '/admincourset4s/login',
    '/adminlandingt4s/login',
    '/adminstackt4s/login',
    '/adminteamt4s/login',
    '/supadmin/login',
  ];

  const { courseIds, projectIds } = await fetchDynamicIds();

  const dynamicCourseRoutes = courseIds.map((id) => `/courses/detail/${id}`);
  const dynamicProjectRoutes = projectIds.map((id) => `/projects?highlight=${id}`);

  const allRoutes = [...staticRoutes, ...dynamicCourseRoutes, ...dynamicProjectRoutes];

  return allRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : route.startsWith('/courses') ? 0.9 : 0.7,
  }));
}

