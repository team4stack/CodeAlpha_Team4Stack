export const STACK_PLATFORMS = [
  'MERN Stack',
  'Next.js',
  'React',
  'Vue.js',
  'Angular',
  'Django',
  'Laravel',
  'Flutter',
  'React Native',
  'Node.js API',
  'Other',
] as const;

export type StackPlatform = (typeof STACK_PLATFORMS)[number];

export function normalizePlatform(value: unknown): string {
  const raw = String(value || '').trim();
  if (!raw) return 'Other';
  const match = STACK_PLATFORMS.find((p) => p.toLowerCase() === raw.toLowerCase());
  return match || raw.slice(0, 80);
}
