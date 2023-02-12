/* Replace with your SQL commands */

-- bizont_edms_general.audit_timeline_v source

CREATE OR REPLACE VIEW bizont_edms_general.audit_timeline_v
AS SELECT av.id,
    av.event_type,
    av.event_date,
    av.entity_id,
    c.val_str1 AS department,
    c2.val_str1 AS icon_name,
    bizont_edms_general.get_transform_value(av.id) AS message
   FROM bizont_edms_general.audit_v av
     LEFT JOIN bizont_edms_general.config c ON c.type::text = 'SCHEMA_TITLE'::text AND c.name::text = av.schema_name::text
     LEFT JOIN bizont_edms_general.config c2 ON c2.type::text = 'ICONS'::text AND c2.val_int1 = av.event_type
  WHERE to_char(av.event_date, 'yyyymmdd'::text) = to_char(CURRENT_DATE::timestamp with time zone, 'yyyymmdd'::text)
  ORDER BY av.event_date DESC;

-- Permissions

ALTER TABLE bizont_edms_general.audit_timeline_v OWNER TO postgres;