const JOB_STATUS = {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
    OPENING_SOON: 'Opening Soon',
};

const JOB_ROLE_TYPE = {
    CONSULTING: 'Consulting',
    EDUCATION: 'Education',
    EVENTS: 'Events',
    FINANCE: 'Finance',
    HR: 'HR',
    IT: 'IT',
    MARKETING_MEDIA: 'Marketing / Media',
    OTHER: 'Other',
    PARTNERSHIPS_SPONSORSHIPS: 'Partnerships / Sponsorships',
    SUBCOMMITTEE: 'Subcommittee',
};

/**
 * @param {string} status
 * @returns {boolean}
 */
function isValidJobStatus(status) {
    return Object.values(JOB_STATUS).some(
        (s) => s.toUpperCase() === status.toUpperCase()
    );
}

/**
 * @param {string} roleType
 * @returns {boolean}
 */
function isValidJobRoleType(roleType) {
    return Object.values(JOB_ROLE_TYPE).some(
        (rt) => rt.toLowerCase() === roleType.toLowerCase()
    );
}

/**
 * @param {string} status
 * @returns {string|null}
 */
function normalizeJobStatus(status) {
    const match = Object.values(JOB_STATUS).find(
        (s) => s.toUpperCase() === status.toUpperCase()
    );
    return match ?? null;
}

/**
 * @param {string} roleType
 * @returns {string|null}
 */
function normalizeJobRoleType(roleType) {
    const match = Object.values(JOB_ROLE_TYPE).find(
        (rt) => rt.toLowerCase() === roleType.toLowerCase()
    );
    return match ?? null;
}

module.exports = {
    JOB_STATUS,
    JOB_ROLE_TYPE,
    isValidJobStatus,
    isValidJobRoleType,
    normalizeJobStatus,
    normalizeJobRoleType,
};