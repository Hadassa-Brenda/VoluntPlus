const CURRENT_USER_STORAGE_KEY = "volunt-user";
const USERS_STORAGE_KEY = "volunt-users";

const PERSON_TYPE_TO_FRONTEND = {
  INDIVIDUAL: "PF",
  ORGANIZATION: "PJ",
};

const ROLE_TO_FRONTEND = {
  OFFERER: "PF",
  BENEFICIARY: "BF",
};

const GENDER_TO_FRONTEND = {
  MALE: "M",
  FEMALE: "F",
  NON_BINARY: "O",
  OTHER: "O",
  PREFER_NOT_TO_SAY: "O",
};

export function mapBackendUserToFrontend(profile, currentUser = {}) {
  if (!profile) {
    return null;
  }

  const fullName =
    profile.organizationName || profile.fullName || currentUser.fullName || "";
  const personType = profile.personType ?? currentUser.personType;
  const currentRole = profile.currentRole;
  const birthDate = profile.birthDate ?? currentUser.birthDate;
  const gender = profile.gender ?? currentUser.gender;

  return {
    ...currentUser,
    ...profile,
    id: profile.id ?? profile.userId ?? currentUser.id,
    currentRole: currentRole ?? null,
    fullName,
    name: fullName,
    tipoUsuario:
      PERSON_TYPE_TO_FRONTEND[personType] ?? currentUser.tipoUsuario ?? "PF",
    perfilUsuario:
      ROLE_TO_FRONTEND[currentRole] ?? null,
    dataNascimento: birthDate ?? currentUser.dataNascimento ?? null,
    gender: GENDER_TO_FRONTEND[gender] ?? currentUser.gender ?? null,
    genero:
      GENDER_TO_FRONTEND[gender] ??
      currentUser.genero ??
      currentUser.gender ??
      null,
  };
}

export function loadStoredCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function persistBackendUser(profile, currentUser = loadStoredCurrentUser()) {
  const mappedUser = mapBackendUserToFrontend(profile, currentUser ?? {});

  if (!mappedUser?.id) {
    return mappedUser;
  }

  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(mappedUser));

  try {
    const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
    const users = Array.isArray(storedUsers) ? storedUsers : [];
    const userExists = users.some(
      (user) => String(user.id) === String(mappedUser.id),
    );
    const updatedUsers = userExists
      ? users.map((user) =>
          String(user.id) === String(mappedUser.id) ? mappedUser : user,
        )
      : [...users, mappedUser];

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  } catch {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([mappedUser]));
  }

  return mappedUser;
}

export function clearStoredCurrentUser() {
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
}
