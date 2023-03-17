import { UserDTO, PermissionDTO } from '../../models/user/index';
import { DB_CONFIG_GENERAL } from '../../config.oracle';
import { BaseRepository } from '../BaseRepository';
import knex, { Knex } from "knex";
import { UserPermissionDTO } from '../../models/user';

export class UserPermissionRepository extends BaseRepository<UserPermissionDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

    async getPermissions(user_email: string): Promise<Array<PermissionDTO>> {
        let user_permissions_qry = Object();

        user_permissions_qry = await this.mainDb("BIZONT_EDMS_GENERAL.USER_PERMISSIONS_V")
            .where("USER_EMAIL", "=", user_email)
            .select(
                this.mainDb.ref("PERMISSION_ID").as("ID"),
                "PERMISSION_NAME"
            );
        
        const user_permissions = this.loadResults(user_permissions_qry) as PermissionDTO[];

        return user_permissions;
    }

    async getUserById(user_id: number): Promise<UserPermissionDTO> {
        let user_data_qry = Object();

        user_data_qry = await this.mainDb("BIZONT_EDMS_GENERAL.USER_DATA")
            .where("ID", "=", user_id)
            .select([
                "ID",
                "USER_NAME",
                "USER_EMAIL"
            ]);
        
        const user_data = (this.loadResults(user_data_qry)[0] ?? {}) as UserDTO;
        
        const user_permissions = await this.getPermissions(user_data.user_email);        
                
        return {
            id: 0,
            user: user_data,
            permissions: user_permissions
        } as UserPermissionDTO;
    }

    async getUserByEmail(user_email: string): Promise<UserPermissionDTO> {
        let user_data_qry = Object();

        user_data_qry = await this.mainDb("BIZONT_EDMS_GENERAL.USER_DATA")
            .where("USER_EMAIL", "=", user_email)
            .select([
                "ID",
                "USER_NAME",
                "USER_EMAIL"
            ]);
        
            console.log(user_email);
        
        const user_data = (this.loadResults(user_data_qry)[0] ?? {}) as UserDTO;

        console.log(user_data);
        
        const user_permissions = await this.getPermissions(user_data.user_email);        
                
        return {
            id: 0,
            user: user_data,
            permissions: user_permissions
        } as UserPermissionDTO;
    }

}