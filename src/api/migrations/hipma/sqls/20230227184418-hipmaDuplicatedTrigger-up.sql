/* Replace with your SQL commands */
CREATE OR REPLACE FUNCTION bizont_edms_hipma.duplicated_requests()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
DECLARE
	oldest_request integer;
BEGIN

	IF EXISTS (SELECT 1 FROM bizont_edms_hipma.health_information
			WHERE (first_name,     last_name,     date_of_birth)
			= (NEW.first_name, NEW.last_name, NEW.date_of_birth) AND status=1
			ORDER BY health_information.created_at  LIMIT 1) THEN

			oldest_request := (
				SELECT health_information.id FROM bizont_edms_hipma.health_information WHERE 
				health_information.first_name = NEW.first_name AND
				health_information.last_name = NEW.last_name AND
				health_information.date_of_birth = NEW.date_of_birth AND 
				status=1
				ORDER BY health_information.created_at LIMIT 1
			);

			INSERT INTO bizont_edms_hipma.hipma_duplicated_requests(
			health_information_original_id, health_information_duplicated_id)
			VALUES (oldest_request, NEW.id);
	END IF;
   	RETURN NEW;
END;
$BODY$;

create trigger duplicated_requests before
insert
    on
    bizont_edms_hipma.health_information for each row execute function bizont_edms_general.duplicated_requests();