const PREFIX = "nightdesk:onboarded:";

/** Key by operator id (stable identity after /enter). */
export function onboardingKey(operatorId: string): string {
  return `${PREFIX}${operatorId}`;
}

export function isOnboardingComplete(operatorId: string | undefined): boolean {
  if (!operatorId || typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(onboardingKey(operatorId)) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingComplete(operatorId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(onboardingKey(operatorId), "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearOnboarding(operatorId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(onboardingKey(operatorId));
  } catch {
    /* ignore */
  }
}
