import { UserRepository } from './../repository/oracle/UserRepository';
import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth"
import { AppUser, Team } from "../models/user";
import { param } from "express-validator";
var RateLimit = require('express-rate-limit');
const userRepo = new UserRepository();

export const userRouter = express.Router();
userRouter.use(RateLimit({
    windowMs: 1*60*1000, // 1 minute
    max: 5000
}));

userRouter.get("/", EnsureAuthenticated, async (req: Request, res: Response) => {
    var appUser: AppUser;
    appUser = req.user;

    // teams could be pulled from the database
    appUser.teams = new Array<Team>();
    appUser.teams[0] = { id: "1234", name: "Team one", role: "Member" }
    appUser.teams[1] = { id: "1234", name: "Team two", role: "Admin" }

    res.send(appUser);
});

userRouter.get("/roles/options", EnsureAuthenticated, async (req: Request, res: Response) => {
    const email = req.oidc.user.email;
    const result = await userRepo.getRolesByUserEmail(email);
    
    res.send({
        data: result
    });    
});