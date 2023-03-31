CREATE OR REPLACE VIEW bizont_edms_general.submissions_status_month_v
AS SELECT 'bizont_edms_constellation_health' AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    cs.description AS status,
    to_char(ch.created_at, 'yyyymm') AS monthid
   FROM bizont_edms_constellation_health.constellation_health ch
     JOIN bizont_edms_constellation_health.constellation_status cs ON cs.id = ch.status
     JOIN bizont_edms_general.config cd ON cd.type = 'SCHEMA_TITLE' AND cd.name = 'bizont_edms_constellation_health'
     JOIN bizont_edms_general.config cc ON cc.type = 'STATUS_CHART_COLOR' AND cc.name = 'bizont_edms_constellation_health' AND cc.val_int1 = cs.id
     JOIN bizont_edms_general.config cp ON cp.type = 'SCHEMA_PERMISSION_VIEW' AND cp.name = 'bizont_edms_constellation_health'
  GROUP BY (to_char(ch.created_at, 'yyyymm')), cd.val_str1, cc.val_str1, cp.val_str1, cs.description
UNION
 SELECT 'bizont_edms_midwifery' AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    st.description AS status,
    to_char(ms.created_at, 'yyyymm') AS monthid
   FROM bizont_edms_midwifery.midwifery_services ms
     JOIN bizont_edms_midwifery.midwifery_status st ON st.id = ms.status
     JOIN bizont_edms_general.config cd ON cd.type = 'SCHEMA_TITLE' AND cd.name = 'bizont_edms_midwifery'
     JOIN bizont_edms_general.config cc ON cc.type = 'STATUS_CHART_COLOR' AND cc.name = 'bizont_edms_midwifery' AND cc.val_int1 = st.id
     JOIN bizont_edms_general.config cp ON cp.type = 'SCHEMA_PERMISSION_VIEW' AND cp.name = 'bizont_edms_midwifery'
  GROUP BY (to_char(ms.created_at, 'yyyymm')), cd.val_str1, cc.val_str1, cp.val_str1, st.description
UNION
 SELECT 'bizont_edms_hipma' AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    st.description AS status,
    to_char(hi.created_at, 'yyyymm') AS monthid
   FROM bizont_edms_hipma.health_information hi
     JOIN bizont_edms_hipma.hipma_status st ON st.id = hi.status
     JOIN bizont_edms_general.config cd ON cd.type = 'SCHEMA_TITLE' AND cd.name = 'bizont_edms_hipma'
     JOIN bizont_edms_general.config cc ON cc.type = 'STATUS_CHART_COLOR' AND cc.name = 'bizont_edms_hipma' AND cc.val_int1 = st.id
     JOIN bizont_edms_general.config cp ON cp.type = 'SCHEMA_PERMISSION_VIEW' AND cp.name = 'bizont_edms_hipma'
  GROUP BY (to_char(hi.created_at, 'yyyymm')), cd.val_str1, cc.val_str1, cp.val_str1, st.description;