import type { Metadata } from 'next'
import ProjectsPage from '@/modules/projects/pages/ProjectsPage'

export const metadata: Metadata = {
  title: 'Projects | Team4Stack — MERN Portfolio',
  description:
    'Explore production-ready MERN stack projects by Team4Stack — responsive apps, e-commerce builds, and full-stack solutions with live demos and source code.',
}

export default function Projects() {
  return <ProjectsPage />
}
