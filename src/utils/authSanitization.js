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
  subscriptionNameMin: 2,
  subscriptionNameMax: 80,
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

export function validatePasswordChangeInput({
  currentPassword,
  newPassword,
  confirmPassword,
}) {
  const errors = [];

  const wantsPasswordChange =
    Boolean(currentPassword) ||
    Boolean(newPassword) ||
    Boolean(confirmPassword);

  if (!wantsPasswordChange) {
    return errors;
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    errors.push(
      "Current password, new password, and confirmation are required to change password.",
    );
  }

  if (
    newPassword &&
    (newPassword.length < LIMITS.passwordMin ||
      newPassword.length > LIMITS.passwordMax)
  ) {
    errors.push("Password must be between 8 and 128 characters.");
  }

  if (newPassword && !STRONG_PASSWORD_REGEX.test(newPassword)) {
    errors.push(
      "Password must include uppercase, lowercase, number, and special character.",
    );
  }

  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    errors.push("Passwords do not match.");
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push("New password must be different from the current password.");
  }

  return [...new Set(errors)];
}

export function sanitizeSubscriptionNameInput(value = "") {
  return normalizeInput(value)
    .replace(/[<>]/g, "")
    .replace(/[^a-zA-Z0-9\s&+.'-]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, LIMITS.subscriptionNameMax)
    .trimStart();
}

export function sanitizeAmountInput(value = "") {
  const normalized = normalizeInput(value).replace(/[^\d.]/g, "");
  const parts = normalized.split(".");

  if (parts.length === 1) {
    return parts[0];
  }

  const integerPart = parts[0];
  const decimalPart = parts.slice(1).join("").slice(0, 2);
  return `${integerPart}.${decimalPart}`;
}

export function sanitizeFrequencyInput(value = "") {
  const allowed = ["Weekly", "Monthly", "Yearly"];
  return allowed.includes(value) ? value : "Monthly";
}

function toYyyyMmDd(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);

  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    return "";
  }

  if (y < 1900 || y > 9999 || m < 1 || m > 12 || d < 1 || d > 31) {
    return "";
  }

  const test = new Date(Date.UTC(y, m - 1, d));
  if (
    test.getUTCFullYear() !== y ||
    test.getUTCMonth() !== m - 1 ||
    test.getUTCDate() !== d
  ) {
    return "";
  }

  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(
    d,
  ).padStart(2, "0")}`;
}

export function sanitizeNextPaymentDateInput(value = "") {
  const normalized = normalizeInput(value).trim();
  if (!normalized) {
    return "";
  }

  const dashed = normalized
    .replace(/[./\s]+/g, "-")
    .replace(/[^\d-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  let match = dashed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const fixed = toYyyyMmDd(match[1], match[2], match[3]);
    if (fixed) {
      return fixed;
    }
  }

  match = dashed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (match) {
    const fixed = toYyyyMmDd(match[3], match[1], match[2]);
    if (fixed) {
      return fixed;
    }
  }

  const digits = dashed.replace(/-/g, "");

  if (digits.length === 8) {
    const mmddyyyy = toYyyyMmDd(
      digits.slice(4, 8),
      digits.slice(0, 2),
      digits.slice(2, 4),
    );
    if (mmddyyyy) {
      return mmddyyyy;
    }

    const ddmmyyyy = toYyyyMmDd(
      digits.slice(4, 8),
      digits.slice(2, 4),
      digits.slice(0, 2),
    );
    if (ddmmyyyy) {
      return ddmmyyyy;
    }
  }

  if (digits.length === 7) {
    const mddyyyy = toYyyyMmDd(
      digits.slice(3, 7),
      digits.slice(0, 1),
      digits.slice(1, 3),
    );
    if (mddyyyy) {
      return mddyyyy;
    }

    const mmdyyyy = toYyyyMmDd(
      digits.slice(3, 7),
      digits.slice(0, 2),
      digits.slice(2, 3),
    );
    if (mmdyyyy) {
      return mmdyyyy;
    }
  }

  return "";
}

export function parseNextPaymentDateInputToIso(value = "") {
  const clean = sanitizeNextPaymentDateInput(value);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return null;
  }

  const [year, month, day] = clean.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
}

export function validateSubscriptionInput({
  provider,
  amount,
  frequency,
  nextPaymentDate,
}) {
  const errors = [];

  if (!provider || provider.length < LIMITS.subscriptionNameMin) {
    errors.push("Provider name must be at least 2 characters.");
  }

  if (provider && hasSuspiciousPattern(provider)) {
    errors.push("Provider name contains blocked patterns.");
  }

  if (provider && provider.length > LIMITS.subscriptionNameMax) {
    errors.push("Provider name is too long.");
  }

  const parsedAmount = Number.parseFloat(sanitizeAmountInput(amount));
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    errors.push("Amount must be a valid number greater than 0.");
  }

  if (!["Weekly", "Monthly", "Yearly"].includes(frequency)) {
    errors.push("Frequency must be Weekly, Monthly, or Yearly.");
  }

  if (
    nextPaymentDate &&
    parseNextPaymentDateInputToIso(nextPaymentDate) === null
  ) {
    errors.push("Next payment date must be in YYYY-MM-DD format.");
  }

  return [...new Set(errors)];
}
