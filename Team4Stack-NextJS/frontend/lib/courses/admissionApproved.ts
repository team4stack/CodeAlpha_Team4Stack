/** Matches backend + CoursesPage logic for “at least one approved course” on an application. */
export function isApprovedCourseApplicant(app: Record<string, unknown>): boolean {
  const hasNew = app.approved_1 !== undefined || app.approved_2 !== undefined;
  if (hasNew) {
    const hasCourse1 = Boolean(app.course_name);
    const hasCourse2 = Boolean(app.course_name_2);
    if (hasCourse1 && hasCourse2) return app.approved_1 === true || app.approved_2 === true;
    if (hasCourse1) return app.approved_1 === true;
    return false;
  }
  return app.approved === true;
}

export function userHasApprovedCourseApplication(apps: Record<string, unknown>[]): boolean {
  return apps.some((a) => isApprovedCourseApplicant(a));
}
