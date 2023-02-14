
import * as config from "./config";

export const LOGIN_URL = `${config.apiBaseUrl}/api/auth/login`;
export const AUTH_CHECK_URL = `${config.apiBaseUrl}/api/auth/isAuthenticated`;
export const LOGOUT_URL = `${config.apiBaseUrl}/api/auth/logout`;
export const PROFILE_URL = `${config.apiBaseUrl}/api/user`;

export const CONSTELLATION_URL = `${config.apiBaseUrl}/api/constellation`;
export const CONSTELLATION_SHOW_URL = `${CONSTELLATION_URL}/show/`;
export const CONSTELLATION_VALIDATE_URL = `${CONSTELLATION_URL}/validateRecord/`;
export const CONSTELLATION_EXPORT_FILE_URL = `${CONSTELLATION_URL}/export`;
export const CONSTELLATION_SUBMISSIONS_URL = `${CONSTELLATION_URL}/submissions`;
export const CONSTELLATION_STATUS_URL = `${CONSTELLATION_SUBMISSIONS_URL}/status`;

export const HIPMA_URL = `${config.apiBaseUrl}/api/hipma`;
export const HIPMA_SHOW_URL = `${HIPMA_URL}/show/`;
export const HIPMA_VALIDATE_URL = `${HIPMA_URL}/validateRecord/`;
export const HIPMA_DOWNLOAD_FILE_URL = `${HIPMA_URL}/downloadFile/`;
export const HIPMA_CHANGE_STATUS_URL = `${HIPMA_URL}/changeStatus/`;
export const HIPMA_EXPORT_FILE_URL = `${HIPMA_URL}/export`;
export const HIPMA_SUBMISSIONS_URL = `${HIPMA_URL}/submissions`
export const HIPMA_STATUS_URL = `${HIPMA_SUBMISSIONS_URL}/status`
export const HIPMA_DELETE_FILE = `${HIPMA_URL}/deleteFile/`;

export const GENERAL_URL = `${config.apiBaseUrl}/api/general`;
export const SUBMISSION_URL = `${GENERAL_URL}/submissions`;
export const SUBMISSION_STATUS_URL = `${SUBMISSION_URL}/status`;
export const AUDIT_URL = `${GENERAL_URL}/audit`;
export const AUDIT_DATA_URL = `${AUDIT_URL}/data`;
export const AUDIT_TIMELINE_URL = `${AUDIT_URL}/timeline`;

export const MIDWIFERY_URL = `${config.apiBaseUrl}/api/midwifery`;
export const MIDWIFERY_SHOW_URL = `${MIDWIFERY_URL}/show/`;
export const MIDWIFERY_VALIDATE_URL = `${MIDWIFERY_URL}/validateRecord/`;
export const MIDWIFERY_DOWNLOAD_FILE_URL = `${MIDWIFERY_URL}/downloadFile/`;
export const MIDWIFERY_CHANGE_STATUS_URL = `${MIDWIFERY_URL}/changeStatus/`;
export const MIDWIFERY_EXPORT_FILE_URL = `${MIDWIFERY_URL}/export`;
export const MIDWIFERY_SUBMISSIONS_URL = `${MIDWIFERY_URL}/submissions`;
export const MIDWIFERY_STATUS_URL = `${MIDWIFERY_SUBMISSIONS_URL}/status`;
