
CREATE TABLE IF NOT EXISTS bizont_edms_constellation_health.constellation_duplicated_requests
(
    id SERIAL PRIMARY KEY,
    constellation_health_original_id integer,
    constellation_health_duplicated_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_constellation_health.constellation_duplicated_requests
    OWNER to postgres;


CREATE OR REPLACE FUNCTION bizont_edms_constellation_health.duplicated_requests()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
DECLARE
	oldest_request integer;
BEGIN

	IF EXISTS (SELECT 1 FROM bizont_edms_constellation_health.constellation_health
			WHERE (your_legal_name,     date_of_birth)
			= (NEW.your_legal_name, NEW.date_of_birth) AND status NOT IN (4)
			ORDER BY constellation_health.created_at  LIMIT 1) THEN

			oldest_request := (
				SELECT constellation_health.id FROM bizont_edms_constellation_health.constellation_health WHERE 
				constellation_health.your_legal_name = NEW.your_legal_name AND
				constellation_health.date_of_birth = NEW.date_of_birth AND
				status=1
				ORDER BY constellation_health.created_at LIMIT 1
			);

			INSERT INTO bizont_edms_constellation_health.constellation_duplicated_requests(
			constellation_health_original_id, constellation_health_duplicated_id)
			VALUES (oldest_request, NEW.id);
	END IF;
   	RETURN NEW;
END;
$BODY$;

create trigger duplicated_requests before
insert
    on
    bizont_edms_constellation_health.constellation_health for each row execute function bizont_edms_constellation_health.duplicated_requests();