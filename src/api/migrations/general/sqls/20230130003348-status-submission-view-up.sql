-- bizont_edms_general.submissions_status_week_v source

CREATE OR REPLACE VIEW bizont_edms_general.submissions_status_week_v
AS SELECT 'bizont_edms_constellation_health'::text AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    cs.description AS status
   FROM bizont_edms_constellation_health.constellation_health ch
     JOIN bizont_edms_constellation_health.constellation_status cs ON cs.id = ch.status
     JOIN bizont_edms_general.config cd ON cd.type::text = 'SCHEMA_TITLE'::text AND cd.name::text = 'bizont_edms_constellation_health'::text
     JOIN bizont_edms_general.config cc ON cc.type::text = 'STATUS_CHART_COLOR'::text AND cc.name::text = 'bizont_edms_constellation_health'::text AND cc.val_int1 = cs.id
     JOIN bizont_edms_general.config cp ON cp.type::text = 'SCHEMA_PERMISSION_VIEW'::text AND cp.name::text = 'bizont_edms_constellation_health'::text
  WHERE ch.created_at > (CURRENT_DATE - '7 days'::interval)
  GROUP BY cs.id, cd.val_str1, cc.val_str1, cp.val_str1
UNION
 SELECT 'bizont_edms_midwifery'::text AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    st.description AS status
   FROM bizont_edms_midwifery.midwifery_services ms
     JOIN bizont_edms_midwifery.midwifery_status st ON st.id = ms.status
     JOIN bizont_edms_general.config cd ON cd.type::text = 'SCHEMA_TITLE'::text AND cd.name::text = 'bizont_edms_midwifery'::text
     JOIN bizont_edms_general.config cc ON cc.type::text = 'STATUS_CHART_COLOR'::text AND cc.name::text = 'bizont_edms_midwifery'::text AND cc.val_int1 = st.id
     JOIN bizont_edms_general.config cp ON cp.type::text = 'SCHEMA_PERMISSION_VIEW'::text AND cp.name::text = 'bizont_edms_midwifery'::text
  WHERE ms.created_at > (CURRENT_DATE - '7 days'::interval)
  GROUP BY st.id, cd.val_str1, cc.val_str1, cp.val_str1
UNION
 SELECT 'bizont_edms_hipma'::text AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    st.description AS status
   FROM bizont_edms_hipma.health_information hi
     JOIN bizont_edms_hipma.hipma_status st ON st.id = hi.status
     JOIN bizont_edms_general.config cd ON cd.type::text = 'SCHEMA_TITLE'::text AND cd.name::text = 'bizont_edms_hipma'::text
     JOIN bizont_edms_general.config cc ON cc.type::text = 'STATUS_CHART_COLOR'::text AND cc.name::text = 'bizont_edms_hipma'::text AND cc.val_int1 = st.id
     JOIN bizont_edms_general.config cp ON cp.type::text = 'SCHEMA_PERMISSION_VIEW'::text AND cp.name::text = 'bizont_edms_hipma'::text
  WHERE hi.created_at > (CURRENT_DATE - '7 days'::interval)
  GROUP BY st.id, cd.val_str1, cc.val_str1, cp.val_str1;

-- bizont_edms_general.submissions_status_month_v source

CREATE OR REPLACE VIEW bizont_edms_general.submissions_status_month_v
AS SELECT 'bizont_edms_constellation_health'::text AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    cs.description AS status,
    to_char(ch.created_at, 'yyyy-mm'::text) AS monthid
   FROM bizont_edms_constellation_health.constellation_health ch
     JOIN bizont_edms_constellation_health.constellation_status cs ON cs.id = ch.status
     JOIN bizont_edms_general.config cd ON cd.type::text = 'SCHEMA_TITLE'::text AND cd.name::text = 'bizont_edms_constellation_health'::text
     JOIN bizont_edms_general.config cc ON cc.type::text = 'STATUS_CHART_COLOR'::text AND cc.name::text = 'bizont_edms_constellation_health'::text AND cc.val_int1 = cs.id
     JOIN bizont_edms_general.config cp ON cp.type::text = 'SCHEMA_PERMISSION_VIEW'::text AND cp.name::text = 'bizont_edms_constellation_health'::text
  GROUP BY (to_char(ch.created_at, 'yyyy-mm'::text)), cd.val_str1, cc.val_str1, cp.val_str1, cs.description
UNION
 SELECT 'bizont_edms_midwifery'::text AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    st.description AS status,
    to_char(ms.created_at, 'yyyy-mm'::text) AS monthid
   FROM bizont_edms_midwifery.midwifery_services ms
     JOIN bizont_edms_midwifery.midwifery_status st ON st.id = ms.status
     JOIN bizont_edms_general.config cd ON cd.type::text = 'SCHEMA_TITLE'::text AND cd.name::text = 'bizont_edms_midwifery'::text
     JOIN bizont_edms_general.config cc ON cc.type::text = 'STATUS_CHART_COLOR'::text AND cc.name::text = 'bizont_edms_midwifery'::text AND cc.val_int1 = st.id
     JOIN bizont_edms_general.config cp ON cp.type::text = 'SCHEMA_PERMISSION_VIEW'::text AND cp.name::text = 'bizont_edms_midwifery'::text
  GROUP BY (to_char(ms.created_at, 'yyyy-mm'::text)), cd.val_str1, cc.val_str1, cp.val_str1, st.description
UNION
 SELECT 'bizont_edms_hipma'::text AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    st.description AS status,
    to_char(hi.created_at, 'yyyy-mm'::text) AS monthid
   FROM bizont_edms_hipma.health_information hi
     JOIN bizont_edms_hipma.hipma_status st ON st.id = hi.status
     JOIN bizont_edms_general.config cd ON cd.type::text = 'SCHEMA_TITLE'::text AND cd.name::text = 'bizont_edms_hipma'::text
     JOIN bizont_edms_general.config cc ON cc.type::text = 'STATUS_CHART_COLOR'::text AND cc.name::text = 'bizont_edms_hipma'::text AND cc.val_int1 = st.id
     JOIN bizont_edms_general.config cp ON cp.type::text = 'SCHEMA_PERMISSION_VIEW'::text AND cp.name::text = 'bizont_edms_hipma'::text
  GROUP BY (to_char(hi.created_at, 'yyyy-mm'::text)), cd.val_str1, cc.val_str1, cp.val_str1, st.description;