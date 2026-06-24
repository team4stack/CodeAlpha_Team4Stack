/** Shared colors & layout classes — matches Courses page design */

export const COURSE_ACCENT_GRADIENT = 'from-orange-500 via-red-500 to-pink-500'
export const COURSE_ACCENT_GRADIENT_SHORT = 'from-orange-500 to-red-500'
export const COURSE_PRIMARY_BTN =
  'bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300'

export const courseHeroBg = (isDarkMode: boolean) =>
  isDarkMode
    ? 'bg-gradient-to-b from-black via-gray-900 to-black'
    : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'

export const courseSectionBg = (isDarkMode: boolean) =>
  isDarkMode
    ? 'bg-gradient-to-b from-gray-900 via-black to-gray-900'
    : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'

export const courseBadge = (isDarkMode: boolean) =>
  isDarkMode
    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
    : 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm'

export const courseStatCard = (isDarkMode: boolean, hoverColor: string) =>
  isDarkMode
    ? `bg-gray-800/50 border border-gray-700/50 hover:border-${hoverColor}/50`
    : `bg-white border border-gray-200 shadow-lg hover:shadow-${hoverColor}-200`

export const courseHeading = (isDarkMode: boolean) =>
  isDarkMode ? 'text-white' : 'text-gray-900'

export const courseSubtext = (isDarkMode: boolean) =>
  isDarkMode ? 'text-gray-300' : 'text-gray-600'
