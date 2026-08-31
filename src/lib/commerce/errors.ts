export class CommerceIntegrationError extends Error {
  constructor(
    public readonly code: string,
    public readonly retryable = false,
  ) {
    super(code);
    this.name = "CommerceIntegrationError";
  }
}

export function integrationErrorCode(reason: unknown) {
  return reason instanceof CommerceIntegrationError
    ? reason.code
    : "COMMERCE_INTEGRATION_FAILED";
}
