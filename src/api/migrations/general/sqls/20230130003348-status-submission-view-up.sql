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
     JOIN bizont_edms_midwifery.midwifery_status st ON st.id = ms.status
  WHERE ms.created_at > (CURRENT_DATE - '7 days'::interval)
  GROUP BY st.id
UNION
 SELECT 'bizont_edms_hipma'::text AS id,
    'Hipma'::text AS department,
    count(1) AS submissions,
    st.description AS status
   FROM bizont_edms_hipma.health_information hi
     JOIN bizont_edms_hipma.hipma_status st ON st.id = hi.status
  WHERE hi.created_at > (CURRENT_DATE - '7 days'::interval)
  GROUP BY st.id;

-- bizont_edms_general.submissions_status_month_v source

CREATE OR REPLACE VIEW bizont_edms_general.submissions_status_month_v
AS SELECT 'bizont_edms_constellation_health'::text AS id,
    'Constellation Health'::text AS department,
    count(1) AS submissions,
    cs.description AS status,
    to_char(ch.created_at, 'yyyy-mm'::text) AS monthid
   FROM bizont_edms_constellation_health.constellation_health ch
     JOIN bizont_edms_constellation_health.constellation_status cs ON cs.id = ch.status
  GROUP BY (to_char(ch.created_at, 'yyyy-mm'::text)), cs.id
UNION
 SELECT 'bizont_edms_midwifery'::text AS id,
    'Midwifery Services'::text AS department,
    count(1) AS submissions,
    st.description AS status,
    to_char(ms.created_at, 'yyyy-mm'::text) AS monthid
   FROM bizont_edms_midwifery.midwifery_services ms
     JOIN bizont_edms_midwifery.midwifery_status st ON st.id = ms.status
  GROUP BY (to_char(ms.created_at, 'yyyy-mm'::text)), st.id
UNION
 SELECT 'bizont_edms_hipma'::text AS id,
    'Hipma'::text AS department,
    count(1) AS submissions,
    st.description AS status,
    to_char(hi.created_at, 'yyyy-mm'::text) AS monthid
   FROM bizont_edms_hipma.health_information hi
     JOIN bizont_edms_hipma.hipma_status st ON st.id = hi.status
  GROUP BY (to_char(hi.created_at, 'yyyy-mm'::text)), st.id;
