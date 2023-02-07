/* Replace with your SQL commands */

-- bizont_edms_general.event_type definition

CREATE TABLE bizont_edms_general.event_type (
	id int4 NOT NULL,
	desciption varchar NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT event_type_pk PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE bizont_edms_general.event_type OWNER TO postgres;
GRANT ALL ON TABLE bizont_edms_general.event_type TO postgres;

INSERT INTO bizont_edms_general.event_type (id, desciption, created_at) VALUES(1, 'Inserted', '2023-02-05 18:31:08.863');
INSERT INTO bizont_edms_general.event_type (id, desciption, created_at) VALUES(2, 'Updated New', '2023-02-05 18:31:25.527');
INSERT INTO bizont_edms_general.event_type (id, desciption, created_at) VALUES(3, 'Updated Old', '2023-02-05 18:31:46.815');
INSERT INTO bizont_edms_general.event_type (id, desciption, created_at) VALUES(4, 'Deleted', '2023-02-05 18:32:10.310');
