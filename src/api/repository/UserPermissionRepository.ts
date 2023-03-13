import { UserDTO, PermissionDTO } from '../models/user/index';
import { DB_CONFIG_GENERAL } from '../config';
import { BaseRepository } from './BaseRepository';
import knex, { Knex } from "knex";
import { UserPermissionDTO } from '../models/user';

export class UserPermissionRepository extends BaseRepository<UserPermissionDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

    async getPermissions(user_email: string): Promise<Array<PermissionDTO>> {
        let user_permissions_qry = Object();

        user_permissions_qry = await this.mainDb("bizont_edms_general.user_permissions_v")
            .where("user_email", "=", user_email)
            .select(
                this.mainDb.ref("permission_id").as("id"),
                "permission_name"
            );
        
        const user_permissions = this.loadResults(user_permissions_qry) as PermissionDTO[];

        return user_permissions;
    }

    async getUserById(user_id: number): Promise<UserPermissionDTO> {
        let user_data_qry = Object();

        user_data_qry = await this.mainDb("bizont_edms_general.user_data")
            .where("id", "=", user_id)
            .select([
                "id",
                "user_name",
                "user_email"
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

        user_data_qry = await this.mainDb("bizont_edms_general.user_data")
            .where("user_email", "=", user_email)
            .select([
                "id",
                "user_name",
                "user_email"
            ]);
        
        const user_data = (this.loadResults(user_data_qry)[0] ?? {}) as UserDTO;
        
        const user_permissions = await this.getPermissions(user_data.user_email);        
                
        return {
            id: 0,
            user: user_data,
            permissions: user_permissions
        } as UserPermissionDTO;
    }

}
