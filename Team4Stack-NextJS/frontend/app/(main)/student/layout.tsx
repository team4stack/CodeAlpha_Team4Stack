import StudentRouteGuard from '@/components/guards/StudentRouteGuard'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StudentRouteGuard>{children}</StudentRouteGuard>
}
