/** Sandbox payments must never be enabled by a production rollout flag. */
export function sandboxPaymentsEnabled(env: {
  NODE_ENV?: string;
  ENABLE_SANDBOX_PAYMENTS?: string;
}): boolean {
  return (
    (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') &&
    env.ENABLE_SANDBOX_PAYMENTS === 'true'
  );
}

/** Customer payment endpoints do not grant blanket access to staff roles. */
export function ownsPayment(actorId: string, ownerId: string): boolean {
  return actorId === ownerId;
}
