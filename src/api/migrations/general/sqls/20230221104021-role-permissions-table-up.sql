/* Replace with your SQL commands */

-- bizont_edms_general.role_permissions definition

CREATE TABLE bizont_edms_general.role_permissions (
	id int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	role_id int4 NOT NULL,
	permission_id int4 NOT NULL,
	CONSTRAINT role_permissions_pk PRIMARY KEY (id),
	CONSTRAINT role_permissions_un UNIQUE (role_id, permission_id)
);
CREATE INDEX role_permissions_permission_id_idx ON bizont_edms_general.role_permissions USING btree (permission_id);
CREATE INDEX role_permissions_role_id_idx ON bizont_edms_general.role_permissions USING btree (role_id);

-- Permissions

ALTER TABLE bizont_edms_general.role_permissions OWNER TO postgres;
GRANT ALL ON TABLE bizont_edms_general.role_permissions TO postgres;

INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(1, 1, 1);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(2, 1, 2);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(3, 1, 3);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(4, 1, 4);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(5, 1, 5);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(6, 1, 6);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(7, 1, 7);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(8, 1, 8);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(9, 1, 9);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(10, 1, 10);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(11, 1, 11);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(12, 1, 12);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(13, 2, 1);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(14, 2, 2);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(15, 2, 3);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(16, 2, 4);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(17, 3, 1);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(18, 3, 3);
INSERT INTO bizont_edms_general.role_permissions (id, role_id, permission_id) VALUES(19, 3, 4);
