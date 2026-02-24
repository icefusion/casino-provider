export type ProviderSimulateRequest = {
  casinoSessionId: string;
  providerSessionId: string;
  betAmount?: number;
  winAmount?: number;
};

export type ProviderSimulateResponse = {
  ok: true;
  steps: Array<{ name: string; response: any }>;
};
