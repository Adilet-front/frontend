export type EmailValidationError =
  | "invalid"
  | "missingDomainDot";

/**
 * Validates email format with a focused check for missing dot in the domain:
 * user@domain -> missingDomainDot
 */
export const getEmailValidationError = (
  email: string,
): EmailValidationError | null => {
  const normalized = email.trim();

  if (!normalized) {
    return "invalid";
  }

  const atIndex = normalized.indexOf("@");
  const lastAtIndex = normalized.lastIndexOf("@");
  if (atIndex <= 0 || atIndex !== lastAtIndex || atIndex >= normalized.length - 1) {
    return "invalid";
  }

  const localPart = normalized.slice(0, atIndex);
  const domainPart = normalized.slice(atIndex + 1);
  if (!localPart || !domainPart) {
    return "invalid";
  }

  if (!domainPart.includes(".")) {
    return "missingDomainDot";
  }

  if (domainPart.startsWith(".") || domainPart.endsWith(".")) {
    return "invalid";
  }

  const domainSegments = domainPart.split(".");
  if (domainSegments.some((segment) => !segment.trim())) {
    return "invalid";
  }

  const basicPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicPattern.test(normalized)) {
    return "invalid";
  }

  return null;
};
