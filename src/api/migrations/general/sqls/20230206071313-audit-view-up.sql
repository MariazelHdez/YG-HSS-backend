/* Replace with your SQL commands */

-- bizont_edms_general.audit_v source

CREATE OR REPLACE VIEW bizont_edms_general.audit_v
AS SELECT m.id,
    m.event_type,
    m.event_date,
    m.schema_name,
    m.table_name,
    m.entity_id,
    (m.e1).key AS new_key,
    (m.e2).key AS old_key,
    (m.e1).value AS new_value,
    (m.e2).value AS old_value
   FROM ( SELECT enew.id,
            enew.event_type,
            enew.event_date,
            enew.schema_name,
            enew.table_name,
            enew.entity_id,
            jsonb_each_text(enew.entity_data) AS e1,
            jsonb_each_text(eold.entity_data) AS e2
           FROM bizont_edms_general.events enew
             JOIN bizont_edms_general.events eold ON enew.entity_id = eold.entity_id AND enew.table_name::text = eold.table_name::text AND enew.event_type = 2 AND eold.event_type = 3) m
  WHERE m.e1 <> m.e2
  GROUP BY m.id, m.event_type, m.event_date, m.schema_name, m.table_name, m.entity_id, m.e1, m.e2
UNION
 SELECT enew.id,
    enew.event_type,
    enew.event_date,
    enew.schema_name,
    enew.table_name,
    enew.entity_id,
    NULL::text AS new_key,
    NULL::text AS old_key,
    NULL::text AS new_value,
    NULL::text AS old_value
   FROM bizont_edms_general.events enew
  WHERE enew.event_type = 1
UNION
 SELECT enew.id,
    enew.event_type,
    enew.event_date,
    enew.schema_name,
    enew.table_name,
    enew.entity_id,
    NULL::text AS new_key,
    NULL::text AS old_key,
    NULL::text AS new_value,
    NULL::text AS old_value
   FROM bizont_edms_general.events enew
  WHERE enew.event_type = 4;

-- Permissions

ALTER TABLE bizont_edms_general.audit_v OWNER TO postgres;
GRANT ALL ON TABLE bizont_edms_general.audit_v TO postgres;