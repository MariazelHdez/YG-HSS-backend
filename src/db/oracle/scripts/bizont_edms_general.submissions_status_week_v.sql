CREATE VIEW bizont_edms_general.submissions_status_week_v
AS SELECT 'bizont_edms_constellation_health' AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    cs.description AS status
   FROM bizont_edms_constellation_health.constellation_health ch
     JOIN bizont_edms_constellation_health.constellation_status cs ON cs.id = ch.status
     JOIN bizont_edms_general.config cd ON cd.type = 'SCHEMA_TITLE' AND cd.name = 'bizont_edms_constellation_health'
     JOIN bizont_edms_general.config cc ON cc.type = 'STATUS_CHART_COLOR' AND cc.name = 'bizont_edms_constellation_health' AND cc.val_int1 = cs.id
     JOIN bizont_edms_general.config cp ON cp.type = 'SCHEMA_PERMISSION_VIEW' AND cp.name = 'bizont_edms_constellation_health'
  WHERE ch.created_at > (CURRENT_DATE - INTERVAL '7' DAY)
  GROUP BY cs.id, cd.val_str1, cc.val_str1, cp.val_str1, cs.DESCRIPTION
UNION
 SELECT 'bizont_edms_midwifery' AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    st.description AS status
   FROM bizont_edms_midwifery.midwifery_services ms
     JOIN bizont_edms_midwifery.midwifery_status st ON st.id = ms.status
     JOIN bizont_edms_general.config cd ON cd.type = 'SCHEMA_TITLE' AND cd.name = 'bizont_edms_midwifery'
     JOIN bizont_edms_general.config cc ON cc.type = 'STATUS_CHART_COLOR' AND cc.name = 'bizont_edms_midwifery' AND cc.val_int1 = st.id
     JOIN bizont_edms_general.config cp ON cp.type = 'SCHEMA_PERMISSION_VIEW' AND cp.name = 'bizont_edms_midwifery'
  WHERE ms.created_at > (CURRENT_DATE - INTERVAL '7' DAY)
  GROUP BY st.id, cd.val_str1, cc.val_str1, cp.val_str1, st.DESCRIPTION 
UNION
 SELECT 'bizont_edms_hipma' AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    st.description AS status
   FROM bizont_edms_hipma.health_information hi
     JOIN bizont_edms_hipma.hipma_status st ON st.id = hi.status
     JOIN bizont_edms_general.config cd ON cd.type = 'SCHEMA_TITLE' AND cd.name = 'bizont_edms_hipma'
     JOIN bizont_edms_general.config cc ON cc.type = 'STATUS_CHART_COLOR' AND cc.name = 'bizont_edms_hipma' AND cc.val_int1 = st.id
     JOIN bizont_edms_general.config cp ON cp.type = 'SCHEMA_PERMISSION_VIEW' AND cp.name = 'bizont_edms_hipma'
  WHERE hi.created_at > (CURRENT_DATE - INTERVAL '7' DAY)
  GROUP BY st.id, cd.val_str1, cc.val_str1, cp.val_str1, st.DESCRIPTION;