/* Replace with your SQL commands */

-- bizont_edms_general.user_roles definition

CREATE TABLE bizont_edms_general.user_roles (
	id int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	user_id int4 NOT NULL,
	role_id int4 NOT NULL,
	CONSTRAINT user_roles_pk PRIMARY KEY (id)
);
CREATE INDEX user_roles_role_id_idx ON bizont_edms_general.user_roles USING btree (role_id);
CREATE INDEX user_roles_user_id_idx ON bizont_edms_general.user_roles USING btree (user_id);
CREATE INDEX user_roles_user_id_role_id_idx ON bizont_edms_general.user_roles USING btree (user_id, role_id);

-- Permissions

ALTER TABLE bizont_edms_general.user_roles OWNER TO postgres;
GRANT ALL ON TABLE bizont_edms_general.user_roles TO postgres;

INSERT INTO bizont_edms_general.user_roles (id, user_id, role_id) VALUES(1, 1, 4);
INSERT INTO bizont_edms_general.user_roles (id, user_id, role_id) VALUES(2, 1, 2);
INSERT INTO bizont_edms_general.user_roles (id, user_id, role_id) VALUES(3, 2, 3);
INSERT INTO bizont_edms_general.user_roles (id, user_id, role_id) VALUES(4, 1, 6);