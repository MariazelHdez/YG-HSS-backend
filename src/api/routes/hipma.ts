import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth"
import { body, param } from "express-validator";
//import moment from "moment";
import knex from "knex";
//import { ReturnValidationErrors } from "../../middleware";
import { DB_CONFIG_HIPMA } from "../config";
var _ = require('lodash');

const db = knex(DB_CONFIG_HIPMA)

export const hipmaRouter = express.Router();

hipmaRouter.get("/hipma", EnsureAuthenticated, async (req: Request, res: Response) => {
        //midwifery_services
        var midwifery = db("hipma.health_information")
                .leftjoin('midwifery_birth_locations', 'midwifery_services.where_to_give_birth', '=', 'midwifery_birth_locations.id')
                .leftjoin('midwifery_preferred_contact_types', 'midwifery_services.prefer_to_be_contacted', '=', 'midwifery_preferred_contact_types.id')
                .select('midwifery_services.*',
                        'midwifery_birth_locations.description as birth_locations',
                        'midwifery_preferred_contact_types.description as preferred_contact')
                .selectRaw('CONCAT(midwifery_services.first_name, " ", midwifery_services.last_name) as fullName')
                .where('midwifery_services.status', 'open')
                .orderBy('midwifery_services.id', 'asc');

        var midwiferyOptions = db("hipma.midwifery_options").select('midwifery_options.*').pluck("field_value", "id");


        _.forEach(midwifery, function(value: any, key: any) {
            value.first_pregnancy = !value.first_pregnancy ? ( midwiferyOptions[value.first_pregnancy] == 1 ? 'Yes' : 'No'): '' ;
            value.medical_concerns = !value.medical_concerns ? ( midwiferyOptions[value.medical_concerns] == 1 ? 'Yes' : 'No'): '' ;
            value.major_medical_conditions = !value.major_medical_conditions ? ( midwiferyOptions[value.major_medical_conditions] == 1 ? 'Yes' : 'No'): '' ;

            if(value.due_date == 0) {
                value.due_date =  "N/A";
            }

            if(value.preferred_name == "") {
                value.preferred_name = value.fullName;
            }

            if(value.do_you_identify_with_one_or_more_of_these_groups_and_communities.lenght){
                var dataString = "";
                _.forEach(value.do_you_identify_with_one_or_more_of_these_groups_and_communities, function(valueCommunity: any, key: any) {
                        var info_find = db("midwifery.midwifery_groups_communities").where({ id: valueCommunity });

                        if(!isNaN(valueCommunity) && !info_find && typeof info_find.description !== 'undefined'){
                                dataString += info_find.description+",";
                        }else{
                                dataString += valueCommunity+",";
                        }
                });

                if(dataString.substr(-1) == ","){
                        dataString = dataString.substr(0, -1);
                }

                value.do_you_identify_with_one_or_more_of_these_groups_and_communities = dataString;

                /*ids = explode(",",value.do_you_identify_with_one_or_more_of_these_groups_and_communities);
                dataString = "";

                if(count(ids) > 0){
                    for (i=0; i < count(ids) ; i++) {
                        info_find =  MidwiferyGroupsCommunities::find((int)ids[i]);
                        if(is_numeric(ids[i]) && !empty(info_find) && isset(info_find.description)){
                            dataString .= info_find.description.",";
                        }else{
                            dataString .= ids[i].",";
                        }
                    }

                    if(substr(dataString, -1) == ","){
                        dataString = substr(dataString, 0, -1);
                    }

                    value.do_you_identify_with_one_or_more_of_these_groups_and_communities = dataString;
                }else{
                    var dataQuery = MidwiferyGroupsCommunities::find((int)value.do_you_identify_with_one_or_more_of_these_groups_and_communities);
                    value.do_you_identify_with_one_or_more_of_these_groups_and_communities = dataQuery.description;
                }*/
            }
        });
});
