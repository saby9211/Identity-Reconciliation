/**
 * Validates the /identify request body.
 * - At least one of email or phoneNumber must be present.
 * - phoneNumber is coerced to string.
 * - email is normalized to lowercase.
 * Returns { email, phoneNumber } (both possibly null) or throws.
 */
function validateIdentifyInput(body) {
    let { email, phoneNumber } = body || {};

    // Normalize: treat empty strings and undefined as null
    if (email === undefined || email === null || email === '') {
        email = null;
    }
    if (phoneNumber === undefined || phoneNumber === null || phoneNumber === '') {
        phoneNumber = null;
    }

    // Coerce phoneNumber to string if it's a number
    if (phoneNumber !== null) {
        phoneNumber = String(phoneNumber);
    }

    // Normalize email to lowercase
    if (email !== null) {
        email = email.trim().toLowerCase();
    }

    // At least one must be present
    if (email === null && phoneNumber === null) {
        const err = new Error('At least one of email or phoneNumber must be provided.');
        err.statusCode = 400;
        throw err;
    }

    return { email, phoneNumber };
}

module.exports = { validateIdentifyInput };
