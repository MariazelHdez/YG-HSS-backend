/* Replace with your SQL commands */

CREATE OR REPLACE FUNCTION bizont_edms_general.log_submissions()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
	begin
		if TG_OP = 'INSERT' then		
			insert into bizont_edms_general.events (schema_name, table_name, entity_id, event_type, title, event_by, entity_data)
			values (TG_TABLE_SCHEMA, TG_TABLE_NAME, new.id, 1, 'INSERT', 'system', row_to_json(new.*)::jsonb);
			return new;
		elseif TG_OP = 'UPDATE' then
			insert into bizont_edms_general.events (schema_name, table_name, entity_id, event_type, title, event_by, entity_data)
			values (TG_TABLE_SCHEMA, TG_TABLE_NAME, new.id, 2, 'UPDATED_NEW', 'system', row_to_json(new.*)::jsonb),
				   (TG_TABLE_SCHEMA, TG_TABLE_NAME, old.id, 3, 'UPDATED_OLD', 'system', row_to_json(old.*)::jsonb);
			return new;
		elseif TG_OP = 'DELETE' then
			insert into bizont_edms_general.events (schema_name, table_name, entity_id, event_type, title, event_by, entity_data)
			values (TG_TABLE_SCHEMA, TG_TABLE_NAME, old.id, 4, 'DELETED', 'system', row_to_json(old.*)::jsonb);
			return old;
		end if;
		return null;
	END;
$function$
;

-- Permissions

ALTER FUNCTION bizont_edms_general.log_submissions() OWNER TO postgres;
GRANT ALL ON FUNCTION bizont_edms_general.log_submissions() TO postgres;
