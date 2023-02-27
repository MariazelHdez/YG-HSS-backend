/* Replace with your SQL commands */

-- bizont_edms_general.user_permissions_v source

CREATE OR REPLACE VIEW bizont_edms_general.user_permissions_v
AS SELECT ud.id AS user_id,
    ud.user_email,
    pd.id AS permission_id,
    pd.permission_name
   FROM bizont_edms_general.user_data ud
     JOIN bizont_edms_general.user_roles ur ON ud.id = ur.user_id
     JOIN bizont_edms_general.roles_data rd ON rd.id = ur.role_id
     JOIN bizont_edms_general.role_permissions rp ON rd.id = rp.role_id
     JOIN bizont_edms_general.permission_data pd ON rp.permission_id = pd.id
  GROUP BY ud.id, ud.user_email, pd.id, pd.permission_name;

-- Permissions

ALTER TABLE bizont_edms_general.user_permissions_v OWNER TO postgres;
GRANT ALL ON TABLE bizont_edms_general.user_permissions_v TO postgres;