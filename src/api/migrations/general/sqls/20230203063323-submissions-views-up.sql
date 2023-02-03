/* Replace with your SQL commands */
-- bizont_edms_general.submissions_week_v source

CREATE OR REPLACE VIEW bizont_edms_general.submissions_week_v
AS SELECT 'bizont_edms_constellation_health'::text AS id,
    'Constellation Health'::text AS department,
    count(1) AS total,
    to_char(ch.created_at, 'yyyymmdd'::text) AS date
   FROM bizont_edms_constellation_health.constellation_health ch
  WHERE ch.created_at > (CURRENT_DATE - '7 days'::interval)
  GROUP BY (to_char(ch.created_at, 'yyyymmdd'::text))
UNION
 SELECT 'bizont_edms_hipma'::text AS id,
    'Hipma'::text AS department,
    count(1) AS total,
    to_char(ch.created_at, 'yyyymmdd'::text) AS date
   FROM bizont_edms_hipma.health_information ch
  WHERE ch.created_at > (CURRENT_DATE - '7 days'::interval)
  GROUP BY (to_char(ch.created_at, 'yyyymmdd'::text))
UNION
 SELECT 'bizont_edms_midwifery'::text AS id,
    'Midwifery Services'::text AS department,
    count(1) AS total,
    to_char(ch.created_at, 'yyyymmdd'::text) AS date
   FROM bizont_edms_midwifery.midwifery_services ch
  WHERE ch.created_at > (CURRENT_DATE - '7 days'::interval)
  GROUP BY (to_char(ch.created_at, 'yyyymmdd'::text));

  -- bizont_edms_general.submissions_month_v source

CREATE OR REPLACE VIEW bizont_edms_general.submissions_month_v
AS SELECT 'bizont_edms_constellation_health'::text AS id,
    'Constellation Health'::text AS department,
    count(1) AS submissions,
    to_char(ch.created_at, 'WW'::text) AS date_code,
    to_char(ch.created_at, 'yyyymm'::text) AS monthid
   FROM bizont_edms_constellation_health.constellation_health ch
  GROUP BY (to_char(ch.created_at, 'yyyymm'::text)), (to_char(ch.created_at, 'WW'::text))
UNION
 SELECT 'bizont_edms_hipma'::text AS id,
    'Hipma'::text AS department,
    count(1) AS submissions,
    to_char(ch.created_at, 'WW'::text) AS date_code,
    to_char(ch.created_at, 'yyyymm'::text) AS monthid
   FROM bizont_edms_hipma.health_information ch
  GROUP BY (to_char(ch.created_at, 'yyyymm'::text)), (to_char(ch.created_at, 'WW'::text))
UNION
 SELECT 'bizont_edms_midwifery'::text AS id,
    'Midwifery Services'::text AS department,
    count(1) AS submissions,
    to_char(ch.created_at, 'WW'::text) AS date_code,
    to_char(ch.created_at, 'yyyymm'::text) AS monthid
   FROM bizont_edms_midwifery.midwifery_services ch
  GROUP BY (to_char(ch.created_at, 'yyyymm'::text)), (to_char(ch.created_at, 'WW'::text));