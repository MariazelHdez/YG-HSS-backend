
import * as config from "./config";

export const LOGIN_URL = `${config.apiBaseUrl}/api/auth/login`;
export const AUTH_CHECK_URL = `${config.apiBaseUrl}/api/auth/isAuthenticated`;
export const LOGOUT_URL = `${config.apiBaseUrl}/api/auth/logout`;
export const PROFILE_URL = `${config.apiBaseUrl}/api/user`;

export const CONSTELLATION_URL = `${config.apiBaseUrl}/api/constellation`;
export const CONSTELLATION_SHOW_URL = `${CONSTELLATION_URL}/show/`;
export const CONSTELLATION_VALIDATE_URL = `${CONSTELLATION_URL}/validateRecord/`;