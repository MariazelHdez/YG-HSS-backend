
DROP VIEW "CONSTELLATION_HEALTH"."STATUS_V";
DROP VIEW "GENERAL"."AUDIT_TIMELINE_V";
DROP VIEW "GENERAL"."SUBMISSIONS_MONTH_V";
DROP VIEW "GENERAL"."SUBMISSIONS_STATUS_MONTH_V";
DROP VIEW "GENERAL"."SUBMISSIONS_STATUS_WEEK_V";
DROP VIEW "GENERAL"."SUBMISSIONS_WEEK_V";
DROP VIEW "GENERAL"."USER_PERMISSIONS_V";
DROP VIEW "HIPMA"."STATUS_V";
DROP VIEW "MIDWIFERY"."STATUS_V";
DROP INDEX "CONSTELLATION_HEALTH"."CONSTELLATION_DUPLICATED_REQUESTS_PK";
DROP INDEX "CONSTELLATION_HEALTH"."CONSTELLATION_HEALTH_PK";
DROP INDEX "CONSTELLATION_HEALTH"."CONSTELLATION_HEALTH_REV_PK";
DROP INDEX "CONSTELLATION_HEALTH"."CONSTELLATION_HEALTH_REV_STATUS_INDEX";
DROP INDEX "CONSTELLATION_HEALTH"."CONSTELLATION_HEALTH_STATUS_INDEX";
-- DROP INDEX "CONSTELLATION_HEALTH"."SYS_IL0000075847C00024$$";
-- DROP INDEX "CONSTELLATION_HEALTH"."SYS_IL0000075855C00020$$";
-- DROP INDEX "CONSTELLATION_HEALTH"."SYS_IL0000076201C00025$$";
DROP INDEX "GENERAL"."CONFIG_PK";
DROP INDEX "GENERAL"."EVENTS_PK";
DROP INDEX "GENERAL"."PERMISSION_DATA_INDEX1";
DROP INDEX "GENERAL"."PERMISSION_DATA_INDEX2";
DROP INDEX "GENERAL"."PERMISSION_DATA_INDEX3";
DROP INDEX "GENERAL"."PERMISSION_DATA_PK";
DROP INDEX "GENERAL"."ROLES_DATA_INDEX1";
DROP INDEX "GENERAL"."ROLES_DATA_PK";
DROP INDEX "GENERAL"."ROLE_PERMISSIONS_INDEX1";
DROP INDEX "GENERAL"."ROLE_PERMISSIONS_INDEX2";
DROP INDEX "GENERAL"."ROLE_PERMISSIONS_PK";
-- DROP INDEX "GENERAL"."SYS_IL0000075922C00009$$";
DROP INDEX "GENERAL"."USER_DATA_INDEX1";
DROP INDEX "GENERAL"."USER_DATA_INDEX2";
DROP INDEX "GENERAL"."USER_DATA_PK";
DROP INDEX "GENERAL"."USER_ROLES_INDEX1";
DROP INDEX "GENERAL"."USER_ROLES_INDEX2";
DROP INDEX "GENERAL"."USER_ROLES_INDEX3";
DROP INDEX "GENERAL"."USER_ROLES_PK";
DROP INDEX "HIPMA"."HIPMA_DUPLICATED_REQUESTS_PK";
-- DROP INDEX "HIPMA"."SYS_IL0000075877C00025$$";
-- DROP INDEX "HIPMA"."SYS_IL0000075877C00026$$";
-- DROP INDEX "HIPMA"."SYS_IL0000075877C00027$$";
-- DROP INDEX "HIPMA"."SYS_IL0000075889C00007$$";
-- DROP INDEX "HIPMA"."SYS_IL0000076581C00026$$";
-- DROP INDEX "HIPMA"."SYS_IL0000076581C00027$$";
-- DROP INDEX "HIPMA"."SYS_IL0000076581C00028$$";
DROP INDEX "MIDWIFERY"."MIDWIFERY_DUPLICATED_REQUESTS_PK";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_CONFIRMATION_NUMBER";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_CREATED";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_DOB";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_FIRST_NAME";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_LAST_NAME";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_PK";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_REV_CONFIRMATION_NUMBER";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_REV_CREATED";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_REV_DOB";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_REV_FIRST_NAME";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_REV_LAST_NAME";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_REV_PK";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_REV_STATUS";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_REV_UPDATED";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_STATUS";
DROP INDEX "MIDWIFERY"."MIDWIFERY_SERVICES_UPDATED";
DROP INDEX "MIDWIFERY"."MIDWIFERY_STATUS_DESCRIPTION";
DROP INDEX "MIDWIFERY"."MIDWIFERY_STATUS_PK";
-- DROP INDEX "MIDWIFERY"."SYS_IL0000076010C00024$$";
-- DROP INDEX "MIDWIFERY"."SYS_IL0000076010C00028$$";
-- DROP INDEX "MIDWIFERY"."SYS_IL0000076010C00034$$";
-- DROP INDEX "MIDWIFERY"."SYS_IL0000076010C00035$$";
-- DROP INDEX "MIDWIFERY"."SYS_IL0000076010C00036$$";
-- DROP INDEX "MIDWIFERY"."SYS_IL0000076593C00025$$";
-- DROP INDEX "MIDWIFERY"."SYS_IL0000076593C00029$$";
-- DROP INDEX "MIDWIFERY"."SYS_IL0000076593C00035$$";
-- DROP INDEX "MIDWIFERY"."SYS_IL0000076593C00036$$";
-- DROP INDEX "MIDWIFERY"."SYS_IL0000076593C00037$$";
DROP TRIGGER "CONSTELLATION_HEALTH"."CONSTELLATION_HEALTH_LOG_SUBMISSIONS";
DROP TRIGGER "HIPMA"."HEALTH_INFORMATION_LOG_SUBMISSIONS";
DROP TRIGGER "MIDWIFERY"."MIDWIFERY_SERVICES_LOG_SUBMISSIONS";
DROP FUNCTION "GENERAL"."GETTRANSFORMVALUE";
DROP FUNCTION "GENERAL"."GETVALUEFORRULENAME";
DROP FUNCTION "GENERAL"."GETVALUEFORRULESTATUS";
