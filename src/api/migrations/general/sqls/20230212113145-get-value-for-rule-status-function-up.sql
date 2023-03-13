/* Replace with your SQL commands */

CREATE OR REPLACE FUNCTION bizont_edms_general.get_value_for_rule_status(audit_row record)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
	declare
		status text := '';	
	begin		
		select src.description
		into status
		from (select
				'bizont_edms_constellation_health' as schema_name,
				id,
				description
			from bizont_edms_constellation_health.constellation_status
			union
			select
				'bizont_edms_hipma' as schema_name,
				id,
				description
			from bizont_edms_hipma.hipma_status
			union
			select
				'bizont_edms_midwifery' as schema_name,
				id,
				description
			from bizont_edms_midwifery.midwifery_status) as src
		where src.schema_name = audit_row.schema_name 
		and src.id = audit_row.new_value::integer;
	
		return format(audit_row.title, status);
	END;
$function$
;

-- Permissions

ALTER FUNCTION bizont_edms_general.get_value_for_rule_status(record) OWNER TO postgres;
GRANT ALL ON FUNCTION bizont_edms_general.get_value_for_rule_status(record) TO postgres;
