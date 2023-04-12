EVENT_RULES
--INSERT INTO GENERAL.EVENT_RULES VALUES (1, 2, 'The $1 has changed from $2 to $3', 'getValueForRuleStatus($1)', 'status');
INSERT INTO GENERAL.EVENT_RULES VALUES (1, 3, 'Submission %s', 'GETVALUEFORRULESTATUS(:1, :2, :3, :4)', 'status', '1');
INSERT INTO GENERAL.EVENT_RULES VALUES (2, 3, 'Name Changed to %s', 'GETVALUEFORRULENAME(:1, :2, :3, :4)', 'first_name', '0');
INSERT INTO GENERAL.EVENT_RULES VALUES (3, 1, 'New Submission', NULL, NULL, '1');
INSERT INTO GENERAL.EVENT_RULES VALUES (4, 4, 'Submission Deleted', NULL, NULL, '1');

EVENT_TYPE
INSERT INTO GENERAL.EVENT_TYPE VALUES (1, 'Inserted', CURRENT_TIMESTAMP);
INSERT INTO GENERAL.EVENT_TYPE VALUES (2, 'Updated New', CURRENT_TIMESTAMP);
INSERT INTO GENERAL.EVENT_TYPE VALUES (3, 'Updated Old', CURRENT_TIMESTAMP);
INSERT INTO GENERAL.EVENT_TYPE VALUES (4, 'Deleted', CURRENT_TIMESTAMP);

CONFIG
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(1, 'SCHEMA_TITLE', 'bizont_edms_constellation_health', 'Constellation Health', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(2, 'SCHEMA_TITLE', 'bizont_edms_hipma', 'Hipma', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(4, 'SCHEMA_CHART_COLOR', 'bizont_edms_constellation_health', '#DC4405', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(5, 'SCHEMA_CHART_COLOR', 'bizont_edms_hipma', '#522A44', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(6, 'SCHEMA_CHART_COLOR', 'bizont_edms_midwifery', '#0097A9', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(7, 'ICONS', 'event_type_insert', 'event_type_insert.png', NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(8, 'ICONS', 'event_type_update', 'event_type_update.png', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(9, 'ICONS', 'event_type_delete', 'event_type_delete.png', NULL, NULL, 4, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(3, 'SCHEMA_TITLE', 'bizont_edms_midwifery', 'Midwifery Services', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(10, 'SCHEMA_PERMISSION_VIEW', 'bizont_edms_constellation_health', 'constellation_view', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(11, 'SCHEMA_PERMISSION_VIEW', 'bizont_edms_hipma', 'hipma_view', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(12, 'SCHEMA_PERMISSION_VIEW', 'bizont_edms_midwifery', 'midwifery_view', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(13, 'STATUS_CHART_COLOR', 'bizont_edms_constellation_health', '#41b883', NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(14, 'STATUS_CHART_COLOR', 'bizont_edms_constellation_health', '#1a1aff', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(15, 'STATUS_CHART_COLOR', 'bizont_edms_constellation_health', '#f3b228', NULL, NULL, 3, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(16, 'STATUS_CHART_COLOR', 'bizont_edms_constellation_health', '#dd3e22', NULL, NULL, 4, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(17, 'STATUS_CHART_COLOR', 'bizont_edms_hipma', '#41b883', NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(18, 'STATUS_CHART_COLOR', 'bizont_edms_hipma', '#1a1aff', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(19, 'STATUS_CHART_COLOR', 'bizont_edms_hipma', '#f3b228', NULL, NULL, 3, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(20, 'STATUS_CHART_COLOR', 'bizont_edms_hipma', '#dd3e22', NULL, NULL, 4, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(21, 'STATUS_CHART_COLOR', 'bizont_edms_midwifery', '#41b883', NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(22, 'STATUS_CHART_COLOR', 'bizont_edms_midwifery', '#1a1aff', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(23, 'STATUS_CHART_COLOR', 'bizont_edms_midwifery', '#f3b228', NULL, NULL, 3, NULL, NULL, NULL, NULL, NULL);
INSERT INTO GENERAL.CONFIG (id, type, name, val_str1, val_str2, val_str3, val_int1, val_int2, val_int3, val_date1, val_date2, val_date3) VALUES(24, 'STATUS_CHART_COLOR', 'bizont_edms_midwifery', '#dd3e22', NULL, NULL, 4, NULL, NULL, NULL, NULL, NULL);

