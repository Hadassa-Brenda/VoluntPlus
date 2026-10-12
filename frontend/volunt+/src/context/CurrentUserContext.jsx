import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/react";

import {
  changeCurrentUserRole,
  fetchCurrentUserProfile,
} from "../api/usersApi";
import {
  clearStoredCurrentUser,
  persistBackendUser,
} from "../api/userProfileStorage";

const CLERK_USER_STORAGE_KEY = "volunt-clerk-user-id";

const CurrentUserContext = createContext(null);

export function CurrentUserProvider({ children }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const operationIdRef = useRef(0);

  const refreshUser = useCallback(
    async (providedToken) => {
      const operationId = ++operationIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const token = providedToken || (await getToken());

        if (!token) {
          throw new Error("Não foi possível obter o token da sessão atual.");
        }

        const profile = await fetchCurrentUserProfile(token);
        const mappedUser = persistBackendUser(profile, {});

        if (operationId === operationIdRef.current) {
          setUser(mappedUser);
        }

        return mappedUser;
      } catch (refreshError) {
        if (operationId === operationIdRef.current) {
          const status = refreshError?.response?.status;

          clearStoredCurrentUser();
          setUser(null);

          setError(refreshError);
        }

        throw refreshError;
      } finally {
        if (operationId === operationIdRef.current) {
          setLoading(false);
        }
      }
    },
    [getToken],
  );

  const changeRole = useCallback(
    async (role) => {
      if (role !== "OFFERER" && role !== "BENEFICIARY") {
        throw new Error("Papel de usuário inválido.");
      }

      const operationId = ++operationIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const changedProfile = await changeCurrentUserRole(role);
        const updatedUser = persistBackendUser(
          changedProfile,
          user ?? {},
        );

        if (operationId === operationIdRef.current) {
          setUser(updatedUser);
        }

        return updatedUser;
      } catch (changeError) {
        if (operationId === operationIdRef.current) {
          setError(changeError);
        }

        throw changeError;
      } finally {
        if (operationId === operationIdRef.current) {
          setLoading(false);
        }
      }
    },
    [user],
  );

  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    if (!isSignedIn) {
      operationIdRef.current += 1;
      clearStoredCurrentUser();
      localStorage.removeItem(CLERK_USER_STORAGE_KEY);
      setUser(null);
      setError(null);
      setLoading(false);
      return;
    }

    const storedClerkUserId = localStorage.getItem(CLERK_USER_STORAGE_KEY);

    if (userId && storedClerkUserId !== userId) {
      clearStoredCurrentUser();
      setUser(null);
    }

    if (userId) {
      localStorage.setItem(CLERK_USER_STORAGE_KEY, userId);
    }

    refreshUser().catch(() => undefined);
  }, [isLoaded, isSignedIn, refreshUser, userId]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      refreshUser,
      changeRole,
    }),
    [changeRole, error, loading, refreshUser, user],
  );

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error("useCurrentUser deve ser usado dentro de CurrentUserProvider.");
  }

  return context;
}
