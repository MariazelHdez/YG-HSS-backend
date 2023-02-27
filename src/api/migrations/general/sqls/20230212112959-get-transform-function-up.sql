/* Replace with your SQL commands */

CREATE OR REPLACE FUNCTION bizont_edms_general.get_transform_value(event_id integer)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
	declare
		cur_row record;
		transform_function text := '';
		return_value text := '';
	begin
		select
			*
		into
			cur_row
		from
			bizont_edms_general.audit_v av
		left join bizont_edms_general.event_rules er
			on av.event_type = er.event_type
		where av.id = event_id;
	
		if cur_row.transform_value is null then
			return cur_row.title;
		end if;
	
		transform_function = cur_row.transform_value;
	
		execute format('select bizont_edms_general.%s', transform_function)
		into return_value
		using cur_row;
	
		return return_value;
	end;
$function$
;

-- Permissions

ALTER FUNCTION bizont_edms_general.get_transform_value(int4) OWNER TO postgres;
GRANT ALL ON FUNCTION bizont_edms_general.get_transform_value(int4) TO postgres;
