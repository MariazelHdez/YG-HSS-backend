
import * as config from "./config";

export const LOGIN_URL = `${config.apiBaseUrl}/api/auth/login`;
export const AUTH_CHECK_URL = `${config.apiBaseUrl}/api/auth/isAuthenticated`;
export const LOGOUT_URL = `${config.apiBaseUrl}/api/auth/logout`;
export const PROFILE_URL = `${config.apiBaseUrl}/api/user`;

export const CONSTELLATION_URL = `${config.apiBaseUrl}/api/constellation`;
export const CONSTELLATION_SHOW_URL = `${CONSTELLATION_URL}/show/`;
export const CONSTELLATION_VALIDATE_URL = `${CONSTELLATION_URL}/validateRecord/`;

export const HIPMA_URL = `${config.apiBaseUrl}/api/hipma`;
export const HIPMA_SHOW_URL = `${HIPMA_URL}/show/`;
export const HIPMA_VALIDATE_URL = `${HIPMA_URL}/validateRecord/`;
export const HIPMA_DOWNLOAD_FILE_URL = `${HIPMA_URL}/downloadFile/`;
export const GENERAL_URL = `${config.apiBaseUrl}/api/general`;
export const SUBMISSION_STATUS_URL = `${GENERAL_URL}/submissions/status`
export const HIPMA_CHANGE_STATUS_URL = `${HIPMA_URL}/changeStatus/`
export const HIPMA_EXPORT_FILE_URL = `${HIPMA_URL}/export`;

export const MIDWIFERY_URL = `${config.apiBaseUrl}/api/midwifery`;
export const MIDWIFERY_SHOW_URL = `${MIDWIFERY_URL}/show/`;
export const MIDWIFERY_VALIDATE_URL = `${MIDWIFERY_URL}/validateRecord/`;
export const MIDWIFERY_DOWNLOAD_FILE_URL = `${MIDWIFERY_URL}/downloadFile/`;
export const MIDWIFERY_CHANGE_STATUS_URL = `${MIDWIFERY_URL}/changeStatus/`
export const MIDWIFERY_EXPORT_FILE_URL = `${MIDWIFERY_URL}/export`;
