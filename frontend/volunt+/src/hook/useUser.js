import { useEffect, useState } from "react";
import { userDTO } from "types/DTOs/userDTO";

export function getUserById(id) {
  return userDTO.find((user) => String(user.id) === String(id));
}

import { getUserById } from "services/userService";

export function useUser(id) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setLoading(true);

      const foundUser = getUserById(id);

      if (!foundUser) {
        setError("Usuário não encontrado");
      }

      setUser(foundUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    user,
    loading,
    error,
  };
}
export function getUserById(id) {
    return userDTO.find((user) => String(user.id) === String(id));
}
