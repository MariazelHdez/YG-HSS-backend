import { UserPermissionRepository } from '../repository/UserPermissionRepository';
import { Request, Response, NextFunction } from "express";

const userRepo = new UserPermissionRepository();

export function checkPermissions(...permission: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        let validate: boolean = false;
        if (req.oidc.isAuthenticated()) {
            const user = await userRepo.getUserByEmail(req.oidc?.user.email ?? "");
            if (Object.keys(user).length > 0) {
                validate = permission.every((x) => {
                    return user.permissions.find((p) => p.permission_name === x) !== undefined;
                });   
                if (validate) {
                    next();
                }
            }
        }
        
        if (!validate) {
            res.status(401).json({message: "Not Authorized"});
        }
    }
}