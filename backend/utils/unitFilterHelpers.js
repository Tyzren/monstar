/**
 * Helper functions for unit filtering and query building
 */

/**
 * Builds a MongoDB query object based on filter parameters
 * @param {Object} params - Filter parameters
 * @param {string} params.search - Search term for unit code or name
 * @param {string|string[]} params.faculty - Faculty filter(s)
 * @param {string|string[]} params.semesters - Semester filter(s)
 * @param {string|string[]} params.campuses - Campus filter(s)
 * @param {string} params.showReviewed - 'true' to show only reviewed units
 * @param {string} params.showUnreviewed - 'true' to show only unreviewed units
 * @param {string} params.hideNoOfferings - 'true' to hide units without offerings
 * @returns {Object} MongoDB query object
 */
function buildFilterQuery({
  search = '',
  faculty,
  semesters,
  campuses,
  showReviewed = 'false',
  showUnreviewed = 'false',
  hideNoOfferings = 'false',
}) {
  const query = {};

  // Search filter (unit code or name)
  if (search) {
    query.$or = [
      { unitCode: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ];
  }

  // Faculty filter
  if (faculty && Array.isArray(faculty) && faculty.length > 0) {
    query.school = { $in: faculty.map((f) => 'Faculty of ' + f) };
  } else if (faculty) {
    query.school = 'Faculty of ' + faculty;
  }

  // Semester filter
  if (semesters && Array.isArray(semesters) && semesters.length > 0) {
    query.offerings = { $elemMatch: { period: { $in: semesters } } };
  } else if (semesters) {
    query.offerings = { $elemMatch: { period: semesters } };
  }

  // Campus filter
  if (campuses && Array.isArray(campuses) && campuses.length > 0) {
    query.offerings = { $elemMatch: { location: { $in: campuses } } };
  } else if (campuses) {
    query.offerings = { $elemMatch: { location: campuses } };
  }

  // Reviewed/Unreviewed filters
  if (showReviewed === 'true') {
    query.reviews = { $exists: true, $not: { $size: 0 } };
  }
  if (showUnreviewed === 'true') {
    query.reviews = { $exists: true, $size: 0 };
  }

  // Hide units with no offerings
  if (hideNoOfferings === 'true') {
    query.offerings = { $not: { $eq: null } };
  }

  return query;
}

module.exports = {
  buildFilterQuery,
};
