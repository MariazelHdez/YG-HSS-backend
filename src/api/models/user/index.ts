import { AuthUser } from "../auth";

export interface AppUser extends AuthUser {
    teams?: Array<Team>;
}

export interface Team {
    id: string;
    name: string;
    role: string;
}

export interface UserBaseDTO {
    id: number;
}

export interface RoleDTO extends UserBaseDTO {
    role_name: string;
}

export interface UserDTO extends UserBaseDTO {
    user_name: string;
    user_email: string;
    user_roles: Array<RoleDTO>;
}

export interface PermissionDTO extends UserBaseDTO {
    permission_name: string;
}

export interface UserPermissionDTO extends UserBaseDTO {
    user: UserDTO;
    permissions: Array<PermissionDTO>;
}