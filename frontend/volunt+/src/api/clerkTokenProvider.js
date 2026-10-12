let tokenProvider = null;
let resolveProviderReady;
let providerReady = createProviderReadyPromise();

function createProviderReadyPromise() {
  return new Promise((resolve) => {
    resolveProviderReady = resolve;
  });
}

export function configureClerkTokenProvider(provider) {
  tokenProvider = provider;
  resolveProviderReady();

  return () => {
    if (tokenProvider !== provider) {
      return;
    }

    tokenProvider = null;
    providerReady = createProviderReadyPromise();
  };
}

export async function getClerkSessionToken() {
  await providerReady;

  if (!tokenProvider) {
    return null;
  }

  return tokenProvider();
}
