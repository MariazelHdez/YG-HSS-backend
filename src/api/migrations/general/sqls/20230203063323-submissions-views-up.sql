/* Replace with your SQL commands */
-- bizont_edms_general.submissions_week_v source

CREATE OR REPLACE VIEW bizont_edms_general.submissions_week_v
AS SELECT 'bizont_edms_constellation_health'::text AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    to_char(ch.created_at, 'yyyy-mm-dd'::text) AS date_code
   FROM bizont_edms_constellation_health.constellation_health ch
     JOIN bizont_edms_general.config cd ON cd.type::text = 'SCHEMA_TITLE'::text AND cd.name::text = 'bizont_edms_constellation_health'::text
     JOIN bizont_edms_general.config cc ON cc.type::text = 'SCHEMA_CHART_COLOR'::text AND cc.name::text = 'bizont_edms_constellation_health'::text
     JOIN bizont_edms_general.config cp ON cp.type::text = 'SCHEMA_PERMISSION_VIEW'::text AND cp.name::text = 'bizont_edms_constellation_health'::text
  WHERE ch.created_at > (CURRENT_DATE - '7 days'::interval)
  GROUP BY (to_char(ch.created_at, 'yyyy-mm-dd'::text)), cd.val_str1, cc.val_str1, cp.val_str1
UNION
 SELECT 'bizont_edms_hipma'::text AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    to_char(ch.created_at, 'yyyy-mm-dd'::text) AS date_code
   FROM bizont_edms_hipma.health_information ch
     JOIN bizont_edms_general.config cd ON cd.type::text = 'SCHEMA_TITLE'::text AND cd.name::text = 'bizont_edms_hipma'::text
     JOIN bizont_edms_general.config cc ON cc.type::text = 'SCHEMA_CHART_COLOR'::text AND cc.name::text = 'bizont_edms_hipma'::text
     JOIN bizont_edms_general.config cp ON cp.type::text = 'SCHEMA_PERMISSION_VIEW'::text AND cp.name::text = 'bizont_edms_hipma'::text
  WHERE ch.created_at > (CURRENT_DATE - '7 days'::interval)
  GROUP BY (to_char(ch.created_at, 'yyyy-mm-dd'::text)), cd.val_str1, cc.val_str1, cp.val_str1
UNION
 SELECT 'bizont_edms_midwifery'::text AS id,
    cd.val_str1 AS department,
    cc.val_str1 AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    to_char(ch.created_at, 'yyyy-mm-dd'::text) AS date_code
   FROM bizont_edms_midwifery.midwifery_services ch
     JOIN bizont_edms_general.config cd ON cd.type::text = 'SCHEMA_TITLE'::text AND cd.name::text = 'bizont_edms_midwifery'::text
     JOIN bizont_edms_general.config cc ON cc.type::text = 'SCHEMA_CHART_COLOR'::text AND cc.name::text = 'bizont_edms_midwifery'::text
     JOIN bizont_edms_general.config cp ON cp.type::text = 'SCHEMA_PERMISSION_VIEW'::text AND cp.name::text = 'bizont_edms_midwifery'::text
  WHERE ch.created_at > (CURRENT_DATE - '7 days'::interval)
  GROUP BY (to_char(ch.created_at, 'yyyy-mm-dd'::text)), cd.val_str1, cc.val_str1, cp.val_str1;

-- bizont_edms_general.submissions_month_v source

CREATE OR REPLACE VIEW bizont_edms_general.submissions_month_v
AS SELECT 'bizont_edms_constellation_health'::text AS id,
    cd.val_str1::text AS department,
    cc.val_str1::text AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    to_char(ch.created_at, 'WW'::text) AS date_code,
    to_char(ch.created_at, 'yyyy-mm'::text) AS monthid
   FROM bizont_edms_constellation_health.constellation_health ch
     LEFT JOIN bizont_edms_general.config cd ON cd.type::text = 'SCHEMA_TITLE'::text AND cd.name::text = 'bizont_edms_constellation_health'::text
     LEFT JOIN bizont_edms_general.config cc ON cc.type::text = 'SCHEMA_CHART_COLOR'::text AND cc.name::text = 'bizont_edms_constellation_health'::text
     LEFT JOIN bizont_edms_general.config cp ON cp.type::text = 'SCHEMA_PERMISSION_VIEW'::text AND cp.name::text = 'bizont_edms_constellation_health'::text
  GROUP BY (to_char(ch.created_at, 'yyyy-mm'::text)), (to_char(ch.created_at, 'WW'::text)), cd.val_str1, cc.val_str1, cp.val_str1
UNION
 SELECT 'bizont_edms_hipma'::text AS id,
    cd.val_str1::text AS department,
    cc.val_str1::text AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    to_char(ch.created_at, 'WW'::text) AS date_code,
    to_char(ch.created_at, 'yyyy-mm'::text) AS monthid
   FROM bizont_edms_hipma.health_information ch
     JOIN bizont_edms_general.config cd ON cd.type::text = 'SCHEMA_TITLE'::text AND cd.name::text = 'bizont_edms_hipma'::text
     JOIN bizont_edms_general.config cc ON cc.type::text = 'SCHEMA_CHART_COLOR'::text AND cc.name::text = 'bizont_edms_hipma'::text
     JOIN bizont_edms_general.config cp ON cp.type::text = 'SCHEMA_PERMISSION_VIEW'::text AND cp.name::text = 'bizont_edms_hipma'::text
  GROUP BY (to_char(ch.created_at, 'yyyy-mm'::text)), (to_char(ch.created_at, 'WW'::text)), cd.val_str1, cc.val_str1, cp.val_str1
UNION
 SELECT 'bizont_edms_midwifery'::text AS id,
    cd.val_str1::text AS department,
    cc.val_str1::text AS color,
    cp.val_str1 AS permissions,
    count(1) AS submissions,
    to_char(ch.created_at, 'WW'::text) AS date_code,
    to_char(ch.created_at, 'yyyy-mm'::text) AS monthid
   FROM bizont_edms_midwifery.midwifery_services ch
     JOIN bizont_edms_general.config cd ON cd.type::text = 'SCHEMA_TITLE'::text AND cd.name::text = 'bizont_edms_midwifery'::text
     JOIN bizont_edms_general.config cc ON cc.type::text = 'SCHEMA_CHART_COLOR'::text AND cc.name::text = 'bizont_edms_midwifery'::text
     JOIN bizont_edms_general.config cp ON cp.type::text = 'SCHEMA_PERMISSION_VIEW'::text AND cp.name::text = 'bizont_edms_midwifery'::text
  GROUP BY (to_char(ch.created_at, 'yyyy-mm'::text)), (to_char(ch.created_at, 'WW'::text)), cd.val_str1, cc.val_str1, cp.val_str1;