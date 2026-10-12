import { useEffect } from "react";
import { useAuth } from "@clerk/react";

import { configureClerkTokenProvider } from "./clerkTokenProvider";

export default function ClerkApiAuthBridge({ children }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return undefined;
    }

    const currentTokenProvider = isSignedIn
      ? () => getToken()
      : () => Promise.resolve(null);

    return configureClerkTokenProvider(currentTokenProvider);
  }, [getToken, isLoaded, isSignedIn]);

  return children;
}
