import { UserPermissionRepository } from '../repository/oracle/UserPermissionRepository';
import { Request, Response, NextFunction } from "express";
import { SKIP_PERMISSIONS } from '../config';

const userRepo = new UserPermissionRepository();

export function checkPermissions(...permission: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        let validate: boolean = false;

        // Skip permissions system validation.
        if (SKIP_PERMISSIONS) {
            validate = true;
            next();
        }

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