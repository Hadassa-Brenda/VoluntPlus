function readUsers() {
  try {
    const users = JSON.parse(localStorage.getItem("volunt-users") || "[]");
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

export function getVoluntUserByClerkId(clerkUserId) {
  if (!clerkUserId) {
    return null;
  }

  return (
    readUsers().find((user) => user.clerkUserId === clerkUserId) || null
  );
}

export function getVoluntUserForClerkUser(clerkUser) {
  const clerkUserId = clerkUser?.id;
  const emailAddress =
    clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase() ||
    clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

  if (!clerkUserId && !emailAddress) {
    return null;
  }

  const users = readUsers();
  const matchingUser = users.find(
    (user) =>
      (clerkUserId && user.clerkUserId === clerkUserId) ||
      (emailAddress && user.email?.toLowerCase() === emailAddress),
  );

  if (matchingUser) {
    return matchingUser;
  }

  try {
    const currentUser = JSON.parse(localStorage.getItem("volunt-user") || "null");

    if (
      currentUser &&
      ((clerkUserId && currentUser.clerkUserId === clerkUserId) ||
        (emailAddress && currentUser.email?.toLowerCase() === emailAddress))
    ) {
      return currentUser;
    }
  } catch {
    return null;
  }

  return null;
}

export function saveVoluntUser(user) {
  const users = readUsers();
  const existingIndex = users.findIndex(
    (item) =>
      (user.clerkUserId && item.clerkUserId === user.clerkUserId) ||
      (user.id && String(item.id) === String(user.id)),
  );
  const existingUser = existingIndex >= 0 ? users[existingIndex] : {};
  const nextId = Math.max(Date.now(), ...users.map((item) => Number(item.id) || 0));
  const savedUser = {
    ...existingUser,
    ...user,
    id: user.id || existingUser.id || nextId,
  };
  const updatedUsers =
    existingIndex >= 0
      ? users.map((item, index) => (index === existingIndex ? savedUser : item))
      : [...users, savedUser];

  localStorage.setItem("volunt-users", JSON.stringify(updatedUsers));
  localStorage.setItem("volunt-user", JSON.stringify(savedUser));
  window.dispatchEvent(new Event("volunt-user-profile-updated"));

  return savedUser;
}