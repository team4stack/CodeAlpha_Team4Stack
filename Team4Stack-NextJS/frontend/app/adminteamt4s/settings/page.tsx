'use client'

import Link from 'next/link'

export default function TeamSettingsPage() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl">
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Team Settings</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Team member and mentor profiles are managed through the Landing Admin CMS.
      </p>

      <div className="space-y-3">
        <Link
          href="/adminlandingt4s/team_members"
          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
        >
          <div>
            <div className="font-medium text-gray-800 dark:text-white">Team Members</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Add, edit, and reorder team profiles</div>
          </div>
          <span className="text-blue-500">→</span>
        </Link>

        <Link
          href="/adminlandingt4s/mentor_profiles"
          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
        >
          <div>
            <div className="font-medium text-gray-800 dark:text-white">Mentor Profiles</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Manage lead mentor information</div>
          </div>
          <span className="text-blue-500">→</span>
        </Link>

        <Link
          href="/team"
          target="_blank"
          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
        >
          <div>
            <div className="font-medium text-gray-800 dark:text-white">View Public Team Page</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Preview how team profiles appear to visitors</div>
          </div>
          <span className="text-blue-500">↗</span>
        </Link>
      </div>
    </div>
  )
}
