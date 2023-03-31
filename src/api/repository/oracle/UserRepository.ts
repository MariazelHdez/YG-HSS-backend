import { UserDTO, RoleDTO } from '../../models';
import { DB_CONFIG_GENERAL, SCHEMA_GENERAL } from '../../config';
import { BaseRepository } from '../BaseRepository';
import knex, { Knex } from "knex";

interface UserRolesOptionsDTO extends RoleDTO {
    selected: boolean;
}

export class UserRepository extends BaseRepository<UserDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

    async getRolesByUserEmail(user_email: string): Promise<UserRolesOptionsDTO[]> {
        let roles = Object();
        const allRoles: Array<UserRolesOptionsDTO> = [];

        roles = await this.mainDb(this.mainDb.ref(`${SCHEMA_GENERAL}.USER_DATA`).as("UD"))
            .leftJoin(this.mainDb.ref("BIZONT_EDMS_GENERAL.USER_ROLES").as("UR"), (build) => {
                build.on("UR.USER_ID", "=", "UD.ID")
                    .andOn("UD.USER_EMAIL", "=", this.mainDb.raw(`'${user_email}'`))
            })
            .rightJoin(this.mainDb.ref(`${SCHEMA_GENERAL}.ROLES_DATA`).as("RD"), "RD.ID", "UR.ROLE_ID")
            .select("RD.ID", "rd.ROLE_NAME", "ud.USER_NAME", "ud.USER_EMAIL");
        
        roles.forEach((x: any) => {
            allRoles.push({
                id: x.id,
                role_name: x.role_name,
                selected: x.user_name !== null
            } as UserRolesOptionsDTO);
        });
        
        return allRoles;
    }

}
