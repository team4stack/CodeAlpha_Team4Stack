export const isTeamLead = (name: string) => /sami/i.test(name)

export const getTeamBadgeLabel = (name: string) =>
  isTeamLead(name) ? 'Team Leader' : 'Team Member'
