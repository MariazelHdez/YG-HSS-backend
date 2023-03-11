
CREATE TABLE IF NOT EXISTS bizont_edms_midwifery.midwifery_duplicated_requests
(
    id SERIAL PRIMARY KEY,
    midwifery_services_original_id integer,
    midwifery_services_duplicated_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_midwifery.midwifery_duplicated_requests
    OWNER to postgres;


CREATE OR REPLACE FUNCTION bizont_edms_midwifery.duplicated_requests()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
DECLARE
	oldest_request integer;
BEGIN

	IF EXISTS (SELECT 1 FROM bizont_edms_midwifery.midwifery_services
			WHERE (first_name,     last_name,     date_of_birth)
			= (NEW.first_name, NEW.last_name, NEW.date_of_birth) AND status NOT IN (4)
			ORDER BY midwifery_services.created_at  LIMIT 1) THEN

			oldest_request := (
				SELECT midwifery_services.id FROM bizont_edms_midwifery.midwifery_services WHERE 
				midwifery_services.first_name = NEW.first_name AND
				midwifery_services.last_name = NEW.last_name AND
				midwifery_services.date_of_birth = NEW.date_of_birth AND 
				status=1
				ORDER BY midwifery_services.created_at LIMIT 1
			);

			INSERT INTO bizont_edms_midwifery.midwifery_duplicated_requests(
			midwifery_services_original_id, midwifery_services_duplicated_id)
			VALUES (oldest_request, NEW.id);
	END IF;
   	RETURN NEW;
END;
$BODY$;

create trigger duplicated_requests before
insert
    on
    bizont_edms_midwifery.midwifery_services for each row execute function bizont_edms_midwifery.duplicated_requests();