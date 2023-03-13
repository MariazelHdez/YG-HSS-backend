/* Replace with your SQL commands */

-- bizont_edms_general.event_rules definition

CREATE TABLE bizont_edms_general.event_rules (
	id int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	event_type int4 NULL,
	title varchar NULL,
	transform_value varchar NULL,
	column_key varchar NULL,
	CONSTRAINT event_rules_pk PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE bizont_edms_general.event_rules OWNER TO postgres;
GRANT ALL ON TABLE bizont_edms_general.event_rules TO postgres;

INSERT INTO bizont_edms_general.event_rules (id, event_type, title, transform_value, column_key) VALUES(1, 2, 'Submission %s', 'get_value_for_rule_status($1)', 'status');
INSERT INTO bizont_edms_general.event_rules (id, event_type, title, transform_value, column_key) VALUES(2, 1, 'New submission', NULL, NULL);
INSERT INTO bizont_edms_general.event_rules (id, event_type, title, transform_value, column_key) VALUES(3, 4, 'Submission deleted', NULL, NULL);
