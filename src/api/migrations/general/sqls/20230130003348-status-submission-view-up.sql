

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
     JOIN bizont_edms_midwifery.midwifery_status st ON st.id = ms.status
  GROUP BY (to_char(ms.created_at, 'yyyymm'::text)), st.id
UNION
 SELECT 'bizont_edms_hipma'::text AS id,
    'Hipma'::text AS department,
    count(1) AS submissions,
    st.description AS status,
    to_char(hi.created_at, 'yyyymm'::text) AS monthid
   FROM bizont_edms_hipma.health_information hi
     JOIN bizont_edms_hipma.hipma_status st ON st.id = hi.status
  GROUP BY (to_char(hi.created_at, 'yyyymm'::text)), st.id;
  
  
  
  
  
  
/**************************************************************/
/*************** bizont_edms_general.events *************************/
/**************************************************************/
CREATE TABLE IF NOT EXISTS bizont_edms_general.events
(
    id SERIAL PRIMARY KEY,
    service_name character varying(255),
    event_type character varying(255),
    title character varying(255),
    event_by character varying(255),
    event_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_general.events OWNER to postgres;

CREATE INDEX events_service_idx ON bizont_edms_general.events (service_name);
CREATE INDEX events_type_idx ON bizont_edms_general.events (event_type);
CREATE INDEX event_date_idx ON bizont_edms_general.events (created_at);
CREATE INDEX event_by_idx ON bizont_edms_general.events  (event_by);

/**************************************************************/
/*************** Function to audit post *************************/
/**************************************************************/
CREATE OR REPLACE FUNCTION bizont_edms_general.log_submissions()
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
  AS
$$
DECLARE
   tbl     text := quote_ident(TG_TABLE_SCHEMA) || '.'
                || quote_ident(TG_TABLE_NAME);
BEGIN
		 INSERT INTO bizont_edms_general.events(service_name, event_type, title, event_by)
		 VALUES(tbl,'post','New Submission','system');
	RETURN NEW;
END;
$$

CREATE TRIGGER post_constellation
	BEFORE INSERT ON bizont_edms_constellation_health.constellation_health
	FOR EACH ROW
	EXECUTE FUNCTION bizont_edms_general.log_submissions();
	
CREATE TRIGGER  post_midwifery
  BEFORE INSERT ON bizont_edms_midwifery.midwifery_services
  FOR EACH ROW
  EXECUTE FUNCTION bizont_edms_general.log_submissions();

CREATE TRIGGER  post_hipma
  BEFORE INSERT ON bizont_edms_hipma.health_information
  FOR EACH ROW 
  EXECUTE FUNCTION bizont_edms_general.log_submissions();