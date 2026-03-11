const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s-]+$/;
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
const SUSPICIOUS_INPUT_REGEX =
  /<\/?script|javascript:|on\w+\s*=|<|>|\$\{|\{\{|\}\}|;--|\/\*|\*\//i;

const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  emailMax: 254,
  passwordMin: 8,
  passwordMax: 128,
};

function normalizeInput(value = "") {
  return value.normalize("NFKC").replace(CONTROL_CHARS_REGEX, "");
}

function hasSuspiciousPattern(value = "") {
  return SUSPICIOUS_INPUT_REGEX.test(value);
}

export function sanitizeName(value = "") {
  return normalizeInput(value).replace(/\s+/g, " ").replace(/[<>]/g, "").trim();
}

export function sanitizeNameInput(value = "") {
  return normalizeInput(value)
    .replace(/[^a-zA-Z\s-]/g, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, LIMITS.nameMax);
}

export function sanitizeEmail(value = "") {
  return normalizeInput(value).trim().toLowerCase();
}

export function sanitizePassword(value = "") {
  return normalizeInput(value);
}

export function validateLoginInput(email, password) {
  if (!email || !password) {
    return "Email and password are required.";
  }

  if (email.length > LIMITS.emailMax) {
    return "Email address is too long.";
  }

  if (
    password.length < LIMITS.passwordMin ||
    password.length > LIMITS.passwordMax
  ) {
    return "Password length is invalid.";
  }

  if (hasSuspiciousPattern(email)) {
    return "Invalid characters detected in email.";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address.";
  }

  return "";
}

export function validateSignupInput({
  name,
  email,
  password,
  confirmPassword,
}) {
  if (!name || !email || !password || !confirmPassword) {
    return "All fields are required.";
  }

  if (name.length < LIMITS.nameMin || name.length > LIMITS.nameMax) {
    return "Full name must be between 2 and 80 characters.";
  }

  if (!NAME_REGEX.test(name)) {
    return "Full name contains unsupported characters.";
  }

  if (hasSuspiciousPattern(name) || hasSuspiciousPattern(email)) {
    return "Input contains blocked patterns.";
  }

  if (email.length > LIMITS.emailMax) {
    return "Email address is too long.";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address.";
  }

  if (
    password.length < LIMITS.passwordMin ||
    password.length > LIMITS.passwordMax
  ) {
    return "Password must be between 8 and 128 characters.";
  }

  if (!STRONG_PASSWORD_REGEX.test(password)) {
    return "Password must include uppercase, lowercase, number, and special character.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}

export function validateSignupInputAll({
  name,
  email,
  password,
  confirmPassword,
}) {
  const errors = [];

  if (!name || !email || !password || !confirmPassword) {
    errors.push("All fields are required.");
  }

  if (name && (name.length < LIMITS.nameMin || name.length > LIMITS.nameMax)) {
    errors.push("Full name must be between 2 and 80 characters.");
  }

  if (name && !NAME_REGEX.test(name)) {
    errors.push("Full name contains unsupported characters.");
  }

  if (
    (name && hasSuspiciousPattern(name)) ||
    (email && hasSuspiciousPattern(email))
  ) {
    errors.push("Input contains blocked patterns.");
  }

  if (email && email.length > LIMITS.emailMax) {
    errors.push("Email address is too long.");
  }

  if (email && !EMAIL_REGEX.test(email)) {
    errors.push("Please enter a valid email address.");
  }

  if (
    password &&
    (password.length < LIMITS.passwordMin ||
      password.length > LIMITS.passwordMax)
  ) {
    errors.push("Password must be between 8 and 128 characters.");
  }

  if (password && !STRONG_PASSWORD_REGEX.test(password)) {
    errors.push(
      "Password must include uppercase, lowercase, number, and special character.",
    );
  }

  if (password && confirmPassword && password !== confirmPassword) {
    errors.push("Passwords do not match.");
  }

  return [...new Set(errors)];
}
