const TOKEN_KEY = 'donation_token';
const USER_KEY = 'donation_user';

const STORES = [localStorage, sessionStorage];

const getStoreWithToken = () => STORES.find((s) => s.getItem(TOKEN_KEY)) || null;

export const saveAuth = ({ token, user }, remember) => {
  const target = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  target.setItem(TOKEN_KEY, token);
  target.setItem(USER_KEY, JSON.stringify(user));
  other.removeItem(TOKEN_KEY);
  other.removeItem(USER_KEY);
};

export const loadAuth = () => {
  const store = getStoreWithToken();
  if (!store) return { token: null, user: null };
  let user = null;
  try {
    const raw = store.getItem(USER_KEY);
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }
  return { token: store.getItem(TOKEN_KEY), user };
};

export const persistUser = (user) => {
  const store = getStoreWithToken();
  if (store) store.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  STORES.forEach((s) => {
    s.removeItem(TOKEN_KEY);
    s.removeItem(USER_KEY);
  });
};

export const getAuthToken = () => {
  const store = getStoreWithToken();
  return store ? store.getItem(TOKEN_KEY) : null;
};
