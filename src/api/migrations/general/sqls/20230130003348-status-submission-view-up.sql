/* Replace with your SQL commands */
-- bizont_edms_general.submissions_status_week_v source

CREATE OR REPLACE VIEW bizont_edms_general.submissions_status_week_v
AS SELECT 'bizont_edms_constellation_health'::text AS id,
    'Constellation Health'::text AS department,
    count(1) AS submissions,
    cs.description AS status
   FROM bizont_edms_constellation_health.constellation_health ch
     JOIN bizont_edms_constellation_health.constellation_status cs ON cs.id = ch.status
  WHERE ch.created_at > (CURRENT_DATE - '7 days'::interval)
  GROUP BY cs.id
UNION
 SELECT 'bizont_edms_midwifery'::text AS id,
    'Midwifery Services'::text AS department,
    count(1) AS submissions,
    st.description AS status
   FROM bizont_edms_midwifery.midwifery_services ms
     JOIN bizont_edms_midwifery.midwifery_status st ON st.id = ms.id
  WHERE ms.created_at > (CURRENT_DATE - '7 days'::interval)
  GROUP BY st.id;


-- bizont_edms_general.submissions_status_v source

CREATE OR REPLACE VIEW bizont_edms_general.submissions_status_v
AS SELECT 'bizont_edms_constellation_health'::text AS id,
    'Constellation Health'::text AS department,
    count(1) AS submissions,
    cs.description AS status
   FROM bizont_edms_constellation_health.constellation_health ch
     JOIN bizont_edms_constellation_health.constellation_status cs ON cs.id = ch.status
  GROUP BY cs.id
UNION
 SELECT 'bizont_edms_midwifery'::text AS id,
    'Midwifery Services'::text AS department,
    count(1) AS submissions,
    st.description AS status
   FROM bizont_edms_midwifery.midwifery_services ms
     JOIN bizont_edms_midwifery.midwifery_status st ON st.id = ms.id
  GROUP BY st.id;


-- bizont_edms_general.submissions_status_month_v source

CREATE OR REPLACE VIEW bizont_edms_general.submissions_status_month_v
AS SELECT 'bizont_edms_constellation_health'::text AS id,
    'Constellation Health'::text AS department,
    count(1) AS submissions,
    cs.description AS status,
    to_char(ch.created_at, 'yyyymm'::text) AS monthid
   FROM bizont_edms_constellation_health.constellation_health ch
     JOIN bizont_edms_constellation_health.constellation_status cs ON cs.id = ch.status
  GROUP BY (to_char(ch.created_at, 'yyyymm'::text)), cs.id
UNION
 SELECT 'bizont_edms_midwifery'::text AS id,
    'Midwifery Services'::text AS department,
    count(1) AS submissions,
    st.description AS status,
    to_char(ms.created_at, 'yyyymm'::text) AS monthid
   FROM bizont_edms_midwifery.midwifery_services ms
     JOIN bizont_edms_midwifery.midwifery_status st ON st.id = ms.id
  GROUP BY (to_char(ms.created_at, 'yyyymm'::text)), st.id;