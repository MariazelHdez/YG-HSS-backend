import { UserDTO, PermissionDTO, RoleDTO } from '../models/user/index';
import { DB_CONFIG_GENERAL } from '../config';
import { BaseRepository } from './BaseRepository';
import knex, { Knex } from "knex";

interface UserRolesOptionsDTO extends RoleDTO {
    selected: boolean;
}

export class UserRepository extends BaseRepository<UserDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

    async getRolesByUserEmail(user_email: string): Promise<UserRolesOptionsDTO[]> {
        let roles = Object();
        const allRoles: Array<UserRolesOptionsDTO> = [];

        roles = await this.mainDb(this.mainDb.ref("bizont_edms_general.user_data").as("ud"))
            .leftJoin(this.mainDb.ref("bizont_edms_general.user_roles").as("ur"), (build) => {
                build.on("ur.user_id", "=", "ud.id")
                    .andOn("ud.user_email", "=", this.mainDb.raw(`'${user_email}'`))
            })
            .rightJoin(this.mainDb.ref("bizont_edms_general.roles_data").as("rd"), "rd.id", "ur.role_id")
            .select("rd.id", "rd.role_name", "ud.user_name", "ud.user_email");
        
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
