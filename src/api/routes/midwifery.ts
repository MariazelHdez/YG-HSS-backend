import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth"
import { body, param } from "express-validator";
import { SubmissionStatusRepository } from "../repository/oracle/SubmissionStatusRepository";
//import moment from "moment";
import knex from "knex";
//import { ReturnValidationErrors } from "../../middleware";
import { DB_CONFIG_MIDWIFERY, SCHEMA_MIDWIFERY } from "../config";
import { groupBy } from "../utils/groupBy";
var _ = require('lodash');

const db = knex(DB_CONFIG_MIDWIFERY)

export const midwiferyRouter = express.Router();


const submissionStatusRepo = new SubmissionStatusRepository();

/**
 * Obtain data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
midwiferyRouter.get("/submissions/:action_id/:action_value",[ param("action_id").notEmpty(), 
  param("action_value").notEmpty()], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getModuleSubmissions(SCHEMA_MIDWIFERY, actionId, actionVal, permissions);
        const groupedId = groupBy(result, i => i.id);
        const labels = groupBy(result, i => i.date_code);
                        
        res.send(
            {
                data: groupedId,
                labels: labels
            });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
midwiferyRouter.get("/submissions/status/:action_id/:action_value", [ param("action_id").notEmpty(), 
  param("action_value").notEmpty()], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getModuleSubmissionsStatus(SCHEMA_MIDWIFERY, actionId, actionVal, permissions);
                        
        res.send({data: result});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show in the index view
 *
 * @return json
 */
midwiferyRouter.post("/", async (req: Request, res: Response) => {

    try {

        var dateFrom = req.body.params.dateFrom;
        var dateTo = req.body.params.dateTo;
        let status_request = req.body.params.status;
        var midwifery = Object();
        var midwiferyStatus = Array();
        var midwiferyOptions = Object();
        var sqlFilter = "MIDWIFERY_SERVICES.STATUS <> '4'";

        if(dateFrom && dateTo ){
            sqlFilter += "  AND TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'yyyy-mm-dd') >= '"+dateFrom+"'  AND TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'yyyy-mm-dd') <= '"+dateTo+"'";
        }

        if(!_.isEmpty(status_request)){
           sqlFilter += "  AND MIDWIFERY_SERVICES.STATUS IN ("+status_request+")";
        }

        midwifery = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`)
            .join(`${SCHEMA_MIDWIFERY}.MIDWIFERY_STATUS`, 'MIDWIFERY_SERVICES.STATUS', '=', 'MIDWIFERY_STATUS.ID')
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_BIRTH_LOCATIONS`, 'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH', '=', 'MIDWIFERY_BIRTH_LOCATIONS.ID')
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_PREFERRED_CONTACT_TYPES`, 'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED', '=', 'MIDWIFERY_PREFERRED_CONTACT_TYPES.ID')
            .select('MIDWIFERY_SERVICES.*',
                    'MIDWIFERY_STATUS.DESCRIPTION AS STATUS_DESCRIPTION',
                    'MIDWIFERY_BIRTH_LOCATIONS.DESCRIPTION AS BIRTH_LOCATIONS',
                    'MIDWIFERY_PREFERRED_CONTACT_TYPES.DESCRIPTION AS PREFERRED_CONTACT',
                    db.raw("TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT,"+
                        "TO_CHAR(MIDWIFERY_SERVICES.DUE_DATE, 'YYYY-MM-DD') AS DUE_DATE")
            )
            .whereRaw(sqlFilter)
            .orderBy('MIDWIFERY_SERVICES.ID', 'ASC');

        midwiferyStatus = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_STATUS`).select().whereNot('DESCRIPTION', 'Closed')
            .then((rows: any) => {
                let arrayResult = Array();
                for (let row of rows) {
                    arrayResult.push({text: row['description'], value: row['id']});
                }

                return arrayResult;
        });

        midwiferyOptions = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_OPTIONS`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['field_value'];
            }

            return arrayResult;
        });

        var communities = Object();

        communities = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_GROUPS_COMMUNITIES`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        _.forEach(midwifery, function(value: any, key: any) {
            value.first_pregnancy = value.first_pregnancy ? ( midwiferyOptions[value.first_pregnancy] == 1 ? 'Yes' : 'No'): '' ;
            value.medical_concerns = value.medical_concerns ? ( midwiferyOptions[value.medical_concerns] == 1 ? 'Yes' : 'No'): '' ;
            value.major_medical_conditions = value.major_medical_conditions ? ( midwiferyOptions[value.major_medical_conditions] == 1 ? 'Yes' : 'No'): '' ;

            if(value.due_date == 0) {
                value.due_date =  "N/A";
            }

            if(value.preferred_name == "") {
                value.preferred_name = value.preferred_name;
            }

            if(!_.isEmpty(value.do_you_identify_with_one_or_more_of_these_groups_and_communitie)){

                var dataString = "";

                _.forEach(value.do_you_identify_with_one_or_more_of_these_groups_and_communitie, function(valueCommunity: any) {
                    if(!isNaN(valueCommunity) && communities.hasOwnProperty(valueCommunity)) {
                        dataString += communities[valueCommunity]+",";
                    }else{
                        dataString += valueCommunity+",";
                    }
                });

                if(dataString.substr(-1) == ","){
                    dataString = dataString.slice(0, -1);
                }

                value.do_you_identify_with_one_or_more_of_these_groups_and_communitie = dataString.replace(/,/g, ', ');
            }
            value.created_at_format =  value.created_at.toLocaleString("en-CA", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
            /*
                value.created_at =  value.created_at.toLocaleString("en-CA");
                value.due_date =  value.due_date.toLocaleString("en-CA");
            */

            value.showUrl = "midwifery/show/"+value.id;
        });

        res.send({data: midwifery, dataStatus: midwiferyStatus});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Validate if request is non existant or with closed status
 *
 * @param {midwifery_id} id of request
 * @return json
 */
midwiferyRouter.get("/validateRecord/:midwifery_id",[param("midwifery_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var midwifery_id = Number(req.params.midwifery_id);
        var midwifery = Object();
        var flagExists= true;
        var message= "";
        var type= "error";

        midwifery = await db(`${SCHEMA_MIDWIFERY}.midwifery_services`)
            .join(`${SCHEMA_MIDWIFERY}.midwifery_status`, 'midwifery_services.status', 'midwifery_status.id')
            .where('midwifery_services.id', midwifery_id)
            .select(`${SCHEMA_MIDWIFERY}.midwifery_services.*`,
                    'midwifery_status.description as status_description')
            .first();

        if(!midwifery || midwifery.status_description == "Closed"){
            flagExists= false;
            message= "The request you are consulting is closed or non existant, please choose a valid request.";
        }

        res.json({ status: 200, flagMidwifery: flagExists, message: message, type: type});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show in details view
 *
 * @param {midwifery_id} id of request
 * @return json
 */
midwiferyRouter.get("/show/:midwifery_id",[param("midwifery_id").isInt().notEmpty()], async (req: Request, res: Response) => {

    try {
        var midwiferyStatus = Array();
        let midwifery_id = Number(req.params.midwifery_id);
        var midwifery = Object();
        var midwiferyOptions = Object();
        var communityLocations = Object();
        var languages = Object();

        midwifery = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`)
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_BIRTH_LOCATIONS`, 'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH', 'MIDWIFERY_BIRTH_LOCATIONS.ID')
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_PREFERRED_CONTACT_TYPES`, 'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED', 'MIDWIFERY_PREFERRED_CONTACT_TYPES.ID')
            .select('MIDWIFERY_SERVICES.*',
                    'MIDWIFERY_BIRTH_LOCATIONS.DESCRIPTION AS BIRTH_LOCATIONS',
                    'MIDWIFERY_PREFERRED_CONTACT_TYPES.DESCRIPTION AS PREFERRED_CONTACT',
                    db.raw("TO_CHAR(MIDWIFERY_SERVICES.DATE_OF_BIRTH, 'YYYY-MM-DD') AS DATE_OF_BIRTH, "+
                        "TO_CHAR(MIDWIFERY_SERVICES.WHEN_WAS_THE_FIRST_DAY_OF_YOUR_LAST_PERIOD_, 'YYYY-MM-DD') AS WHEN_WAS_THE_FIRST_DAY_OF_YOUR_LAST_PERIOD_,"+
                        "TO_CHAR(MIDWIFERY_SERVICES.DUE_DATE, 'YYYY-MM-DD') AS DUE_DATE")
            )
            .where("MIDWIFERY_SERVICES.ID", midwifery_id)
            .first();

        midwiferyOptions = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_OPTIONS`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        communityLocations = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_COMMUNITY_LOCATIONS`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        languages = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_LANGUAGES`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        midwiferyStatus = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_STATUS`).select()
            .then((rows: any) => {
                let arrayResult = Array();
                for (let row of rows) {
                    arrayResult.push({text: row['description'], value: row['id']});
                }

                return arrayResult;
        });

        /*if(!_.isNull(midwifery.date_of_birth)) {
            midwifery.date_of_birth =  midwifery.date_of_birth.toLocaleString("en-CA", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        }else if(midwifery.date_of_birth == 0) {
            midwifery.date_of_birth = "N/A";
        }

        if(!_.isNull(midwifery.when_was_the_first_day_of_your_last_period_)) {
            midwifery.when_was_the_first_day_of_your_last_period_ =  midwifery.when_was_the_first_day_of_your_last_period_.toLocaleString("en-CA", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        }else if(midwifery.when_was_the_first_day_of_your_last_period_ == 0) {
            midwifery.when_was_the_first_day_of_your_last_period_ =  "N/A";
        }

        if(!_.isNull(midwifery.due_date)) {
            midwifery.due_date =  midwifery.due_date.toLocaleString("en-CA", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        }else if(midwifery.due_date == 0) {
            midwifery.due_date =  "N/A";
        }*/

        if(!_.isNull(midwifery.community_located)) {
            if(communityLocations.hasOwnProperty(midwifery.community_located)){
                midwifery.community = communityLocations[midwifery.community_located];
            }else{
                midwifery.community = midwifery.community_located;
            }
        }

        if(!_.isNull(midwifery.preferred_language)) {
            if(languages.hasOwnProperty(midwifery.preferred_language)){
                midwifery.language = languages[midwifery.preferred_language];
            }else{
                midwifery.language = midwifery.preferred_language;
            }
        }

        /*if(!midwifery.preferred_name || midwifery.preferred_name == "") {
            midwifery.preferred_name = midwifery.preferred_name;
        }*/

        var communities = Object();
        var contact = Object();

        communities = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_GROUPS_COMMUNITIES`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        contact =  await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_CLINIC_CONTACT_TYPES`).select().then((rows: any) => {
            let arrayResult = Object();
            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        if(!_.isEmpty(midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communitie)){

            var dataString = "";
            _.forEach(midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communitie, function(valueCommunity: any) {
                if(!isNaN(valueCommunity) && communities.hasOwnProperty(valueCommunity)) {
                    dataString += communities[valueCommunity]+",";
                }else{
                    dataString += valueCommunity+",";
                }
            });

            if(dataString.substr(-1) == ","){
                dataString = dataString.slice(0, -1);
            }

            midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communitie = dataString.replace(/,/g, ', ');

        }

        if(!_.isEmpty(midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that)){
            var dataString = "";
            _.forEach(midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that, function(valueContact: any) {
                if(!isNaN(valueContact) && contact.hasOwnProperty(valueContact)) {
                    dataString += contact[valueContact]+",";
                }else{
                    dataString += valueContact+",";
                }
            });

            if(dataString.substr(-1) == ","){
                dataString = dataString.slice(0, -1);
            }

            midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that = dataString.replace(/,/g, ', ');

        }

        var statusMidwifery =  await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_STATUS`).where("DESCRIPTION", "Closed").select().first();

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        let todayDate = mm+'_'+dd+'_'+yyyy;
        let fileName = 'midwifery_request_details_'+todayDate+".pdf";

        res.json({ midwifery: midwifery, options: midwiferyOptions, fileName:fileName, midwiferyStatusClosed: statusMidwifery.id ,  dataStatus: midwiferyStatus});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }

});

/**
 * Store midwifery data
 *
 * @return json
 */
midwiferyRouter.post("/store", async (req: Request, res: Response) => {

    try {

        let data = Object();
        var midwifery = Object();
        var midwiferyCommunityLocations = Object();
        var midwiferyLanguages = Object();
        var midwiferyPreferredContactTypes = Object();
        var midwiferyBirthLocations = Object();
        let midwiferySaved = Object();

        data = req.body;
        midwifery.confirmation_number = getConfirmationNumber();
        midwifery.first_name = data.first_name;
        midwifery.last_name = data.last_name;

        let legal_name = "";
        if(!_.isUndefined(data.preferred_name)) {
            legal_name = data.preferred_name;
        }else{
            legal_name = data.first_name+" "+data.last_name;
        }

        midwifery.preferred_name = legal_name;
        midwifery.pronouns = data.pronouns;
        midwifery.date_of_birth = data.date_of_birth;
        midwifery.preferred_phone = data.preferred_phone;
        midwifery.preferred_email = data.preferred_email;
        midwifery.when_was_the_first_day_of_your_last_period_ = data.when_was_the_first_day_of_your_last_period_;

        midwiferyCommunityLocations = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_COMMUNITY_LOCATIONS`).where({ description: data.community_located }).select().first();

        if(midwiferyCommunityLocations) {
            midwifery.community_located = midwiferyCommunityLocations.id;
        }else{
            midwifery.community_located = data.community_located;
        }

        midwiferyLanguages = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_LANGUAGES`).where({ description: data.preferred_language }).select().first();

        if(midwiferyLanguages) {
            midwifery.preferred_language = midwiferyLanguages.id ;
        }else{
            midwifery.preferred_language = data.preferred_language;
        }

        midwiferyPreferredContactTypes = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_PREFERRED_CONTACT_TYPES`).where({ name: data.prefer_to_be_contacted }).select().first();

        if(midwiferyPreferredContactTypes) {
            midwifery.prefer_to_be_contacted = midwiferyPreferredContactTypes.id ;
        }else{
            midwifery.prefer_to_be_contacted = null;
        }

        midwiferyBirthLocations = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_BIRTH_LOCATIONS`).where({ name: data.where_to_give_birth }).select().first();

        if(midwiferyBirthLocations) {
            midwifery.where_to_give_birth = midwiferyBirthLocations.id ;
        }else{
            midwifery.where_to_give_birth = null;
        }

        if(_.isEmpty(data.do_you_identify_with_one_or_more_of_these_groups_and_communities)) {
            midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communitie = null;
        }else{
            midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communitie = await getMultipleIdsByModel("MidwiferyGroupsCommunities", data.do_you_identify_with_one_or_more_of_these_groups_and_communities)
        }

        if(_.isEmpty(data.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_)) {
            midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that = null;
        }else{
            midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that = await getMultipleIdsByModel("MidwiferyClinicContactTypes", data.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_)
        }

        midwifery.yukon_health_insurance = await getMidwiferyOptions("yukon_health_insurance", data.yukon_health_insurance);
        midwifery.need_interpretation = await getMidwiferyOptions("need_interpretation", data.need_interpretation);
        midwifery.okay_to_leave_message = await getMidwiferyOptions("okay_to_leave_message", data.okay_to_leave_message);
        midwifery.date_confirmed = await getMidwiferyOptions("date_confirmed", data.date_confirmed);
        midwifery.first_pregnancy = await getMidwiferyOptions("first_pregnancy", data.first_pregnancy);
        midwifery.complications_with_previous = await getMidwiferyOptions("complications_with_previous", data.complications_with_previous);
        midwifery.midwife_before = await getMidwiferyOptions("midwife_before", data.midwife_before);
        midwifery.medical_concerns = await getMidwiferyOptions("medical_concerns", data.medical_concerns);
        midwifery.have_you_had_primary_health_care = await getMidwiferyOptions("have_you_had_primary_health_care", data.have_you_had_primary_health_care);
        midwifery.family_physician = await getMidwiferyOptions("family_physician", data.family_physician);
        midwifery.major_medical_conditions = await getMidwiferyOptions("major_medical_conditions", data.major_medical_conditions);

        midwifery.due_date = data.due_date;
        midwifery.how_many_vaginal_births = data.how_many_vaginal_births;
        midwifery.how_many_c_section_births = data.how_many_c_section_births;
        midwifery.provide_details = data.provide_details;
        midwifery.provide_details2 = data.provide_details2;
        midwifery.menstrual_cycle_length = data.menstrual_cycle_length;
        midwifery.physician_s_name = data.physician_s_name;
        midwifery.provide_details3 = data.provide_details3;

        midwiferySaved = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`).insert(midwifery).into(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`).returning('ID');

        if(midwiferySaved){
            res.json({ status:200, message: 'Request saved' });
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Export file
 *
 * @param {request}
 * @return file
 */
midwiferyRouter.post("/export", async (req: Request, res: Response) => {
    try {

        var requests = req.body.params.requests;
        var dateFrom = req.body.params.dateFrom;
        var dateTo = req.body.params.dateTo;
        let status_request = req.body.params.status;
        var midwifery = Object();
        var midwiferyOptions = Object();
        var sqlFilter = "MIDWIFERY_SERVICES.STATUS <> 4";

        if(requests.length > 0){
            sqlFilter += " AND MIDWIFERY_SERVICES.ID IN ("+requests+")";
        }
        
        if(dateFrom && dateTo ){
            sqlFilter += "  AND TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'yyyy-mm-dd') >= '"+dateFrom+"'  AND TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'yyyy-mm-dd') <= '"+dateTo+"'";
        }

        if(!_.isEmpty(status_request)){
           sqlFilter += " AND midwifery_services.status IN ( "+status_request+")";
        }


        midwifery = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`)
            .join(`${SCHEMA_MIDWIFERY}.MIDWIFERY_STATUS`, 'MIDWIFERY_SERVICES.STATUS', '=', 'MIDWIFERY_STATUS.ID')
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_BIRTH_LOCATIONS`, 'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH', 'MIDWIFERY_BIRTH_LOCATIONS.ID')
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_PREFERRED_CONTACT_TYPES`, 'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED', 'MIDWIFERY_PREFERRED_CONTACT_TYPES.ID')
            .select('MIDWIFERY_SERVICES.*',
                    'MIDWIFERY_BIRTH_LOCATIONS.DESCRIPTION AS BIRTH_LOCATIONS',
                    'MIDWIFERY_PREFERRED_CONTACT_TYPES.DESCRIPTION AS PREFERRED_CONTACT',
                db.raw("TO_CHAR(MIDWIFERY_SERVICES.DATE_OF_BIRTH, 'YYYY-MM-DD') AS DATE_OF_BIRTH, "+
                    "TO_CHAR(MIDWIFERY_SERVICES.WHEN_WAS_THE_FIRST_DAY_OF_YOUR_LAST_PERIOD_, 'YYYY-MM-DD') AS WHEN_WAS_THE_FIRST_DAY_OF_YOUR_LAST_PERIOD_,"+
                    "TO_CHAR(MIDWIFERY_SERVICES.DUE_DATE, 'YYYY-MM-DD') AS DUE_DATE,"+
                    "TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT,"+
                    "TO_CHAR(MIDWIFERY_SERVICES.UPDATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS UPDATED_AT")
            )
            .whereRaw(sqlFilter);


        midwiferyOptions = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_OPTIONS`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        var communities = Object();
        var contact = Object();
        var communityLocations = Object();
        var languages = Object();

        communities = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_GROUPS_COMMUNITIES`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        contact =  await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_CLINIC_CONTACT_TYPES`).select().then((rows: any) => {
            let arrayResult = Object();
            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        communityLocations = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_COMMUNITY_LOCATIONS`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        languages = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_LANGUAGES`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        midwifery.forEach(function (value: any) {
            /*
            if(!_.isNull(value.date_of_birth)) {
                value.date_of_birth =  value.date_of_birth.toLocaleString("en-CA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                });
            }else if(value.date_of_birth == 0) {
                value.date_of_birth = "N/A";
            }

            if(!_.isNull(value.when_was_the_first_day_of_your_last_period_)) {
                value.when_was_the_first_day_of_your_last_period_ =  value.when_was_the_first_day_of_your_last_period_.toLocaleString("en-CA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                });
            }else if(value.when_was_the_first_day_of_your_last_period_ == 0) {
                value.when_was_the_first_day_of_your_last_period_ =  "N/A";
            }

            if(!_.isNull(value.due_date)) {
                value.due_date =  value.due_date.toLocaleString("en-CA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                });
            }else if(value.due_date == 0) {
                value.due_date =  "N/A";
            }

            value.created_at =   value.created_at.toLocaleString("en-CA");
            value.updated_at =   value.updated_at.toLocaleString("en-CA");
            */

            if(!_.isNull(value.community_located)) {
                if(communityLocations.hasOwnProperty(value.community_located)){
                    value.community = communityLocations[value.community_located];
                }else{
                    value.community = value.community_located;
                }
            }

            if(!_.isNull(value.preferred_language)) {
                if(languages.hasOwnProperty(value.preferred_language)){
                    value.language = languages[value.preferred_language];
                }else{
                    value.language = value.preferred_language;
                }
            }

            if(!value.preferred_name || value.preferred_name == "") {
                value.preferred_name = value.preferred_name;
            }

            if(!_.isNull(value.okay_to_leave_message)){
                value.okay_to_leave_message = midwiferyOptions[value.okay_to_leave_message];
            }

            if(!_.isNull(value.yukon_health_insurance)){
                value.yukon_health_insurance = midwiferyOptions[value.yukon_health_insurance];
            }

            if(!_.isNull(value.need_interpretation)){
                value.need_interpretation = midwiferyOptions[value.need_interpretation];
            }

            if(!_.isNull(value.date_confirmed)){
                value.date_confirmed = midwiferyOptions[value.date_confirmed];
            }

            if(!_.isNull(value.first_pregnancy)){
                value.first_pregnancy = midwiferyOptions[value.first_pregnancy];
            }

            if(!_.isNull(value.complications_with_previous)){
                value.complications_with_previous = midwiferyOptions[value.complications_with_previous];
            }

            if(!_.isNull(value.midwife_before)){
                value.midwife_before = midwiferyOptions[value.midwife_before];
            }

            if(!_.isNull(value.medical_concerns)){
                value.medical_concerns = midwiferyOptions[value.medical_concerns];
            }

            if(!_.isNull(value.have_you_had_primary_health_care)){
                value.have_you_had_primary_health_care = midwiferyOptions[value.have_you_had_primary_health_care];
            }

            if(!_.isNull(value.family_physician)){
                value.family_physician = midwiferyOptions[value.family_physician];
            }

            if(!_.isNull(value.major_medical_conditions)){
                value.major_medical_conditions = midwiferyOptions[value.major_medical_conditions];
            }

            if(!_.isEmpty(value.do_you_identify_with_one_or_more_of_these_groups_and_communitie)){

                var dataString = "";
                _.forEach(value.do_you_identify_with_one_or_more_of_these_groups_and_communitie, function(valueCommunity: any) {
                    if(!isNaN(valueCommunity) && communities.hasOwnProperty(valueCommunity)) {
                        dataString += communities[valueCommunity]+",";
                    }else{
                        dataString += valueCommunity+",";
                    }
                });

                if(dataString.substr(-1) == ","){
                    dataString = dataString.slice(0, -1);
                }

                value.do_you_identify_with_one_or_more_of_these_groups_and_communitie = dataString.replace(/,/g, ', ');

            }

            if(!_.isEmpty(value.how_did_you_find_out_about_the_midwifery_clinic_select_all_that)){
                var dataString = "";
                _.forEach(value.how_did_you_find_out_about_the_midwifery_clinic_select_all_that, function(valueContact: any) {
                    if(!isNaN(valueContact) && contact.hasOwnProperty(valueContact)) {
                        dataString += contact[valueContact]+",";
                    }else{
                        dataString += valueContact+",";
                    }
                });

                if(dataString.substr(-1) == ","){
                    dataString = dataString.slice(0, -1);
                }

                value.how_did_you_find_out_about_the_midwifery_clinic_select_all_that = dataString.replace(/,/g, ', ');

            }

            delete value.id;
            delete value.status;
            delete value.community_located;
            delete value.preferred_language;
            delete value.where_to_give_birth;
            delete value.prefer_to_be_contacted;
        });

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        let todayDate = mm+'-'+dd+'-'+yyyy;
        let random = (Math.random() + 1).toString(36).substring(7);
        let fileName = 'midwifery_'+random+'_requests_'+todayDate+".xlsx";

        res.json({ data:midwifery, fileName:fileName });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Change the status request to "closed"
 *
 * @param {midwifery_id} id of request
 * @return json
 */
midwiferyRouter.patch("/changeStatus", async (req: Request, res: Response) => {

    try {
        var midwifery_id = req.body.params.requests;
        var status_id = req.body.params.requestStatus;

        var updateStatus = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`).update({status: status_id}).whereIn("MIDWIFERY_SERVICES.id", midwifery_id);

        if(updateStatus) {
            let type = "success";
            let message = "Status changed successfully.";

            res.json({ status:200, message: message, type: type });
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed change'
        });
    }
});

midwiferyRouter.post("/duplicates", async (req: Request, res: Response) => {

    try {

        var midwiferyOriginal = Object();
        var midwiferyDuplicate = Object();
        var midwifery = Array();
        var sqlFilter = "MIDWIFERY_SERVICES.STATUS <> '4'";

        midwiferyOriginal = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_DUPLICATED_REQUESTS`)
            .join(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`, 'MIDWIFERY_DUPLICATED_REQUESTS.MIDWIFERY_SERVICES_ORIGINAL_ID', '=', 'MIDWIFERY_SERVICES.ID')
            .join(`${SCHEMA_MIDWIFERY}.MIDWIFERY_STATUS`, 'MIDWIFERY_SERVICES.STATUS', '=', 'MIDWIFERY_STATUS.ID')
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_BIRTH_LOCATIONS`, 'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH', '=', 'MIDWIFERY_BIRTH_LOCATIONS.ID')
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_PREFERRED_CONTACT_TYPES`, 'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED', '=', 'MIDWIFERY_PREFERRED_CONTACT_TYPES.ID')
            .select('MIDWIFERY_SERVICES.ID AS MIDWIFERY_SERVICES_ID',
                    'MIDWIFERY_SERVICES.FIRST_NAME',
                    'MIDWIFERY_SERVICES.LAST_NAME',
                    'MIDWIFERY_SERVICES.PREFERRED_EMAIL',
                    'MIDWIFERY_SERVICES.PREFERRED_PHONE',
                    'MIDWIFERY_DUPLICATED_REQUESTS.ID',
                    'MIDWIFERY_DUPLICATED_REQUESTS.MIDWIFERY_SERVICES_ORIGINAL_ID',
                    'MIDWIFERY_DUPLICATED_REQUESTS.MIDWIFERY_SERVICES_DUPLICATED_ID',
                    'MIDWIFERY_STATUS.DESCRIPTION AS STATUS_DESCRIPTION',
                    'MIDWIFERY_BIRTH_LOCATIONS.DESCRIPTION AS BIRTH_LOCATIONS',
                    'MIDWIFERY_PREFERRED_CONTACT_TYPES.DESCRIPTION AS PREFERRED_CONTACT',
                    db.raw("TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT,"+
                        "to_char(midwifery_services.date_of_birth, 'YYYY-MM-DD') as date_of_birth")
            )
            .whereRaw(sqlFilter)
            .orderBy("MIDWIFERY_SERVICES.CREATED_AT").then((rows: any) => {
                let arrayResult = Object();

                for (let row of rows) {
                    arrayResult[row['midwifery_services_original_id']] = row;
                }

                return arrayResult;
            });

        midwiferyDuplicate = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_DUPLICATED_REQUESTS`)
            .join(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`, 'MIDWIFERY_DUPLICATED_REQUESTS.MIDWIFERY_SERVICES_ORIGINAL_ID', '=', 'MIDWIFERY_SERVICES.ID')
            .join(`${SCHEMA_MIDWIFERY}.MIDWIFERY_STATUS`, 'MIDWIFERY_SERVICES.STATUS', '=', 'MIDWIFERY_STATUS.ID')
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_BIRTH_LOCATIONS`, 'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH', '=', 'MIDWIFERY_BIRTH_LOCATIONS.ID')
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_PREFERRED_CONTACT_TYPES`, 'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED', '=', 'MIDWIFERY_PREFERRED_CONTACT_TYPES.ID')
            .select('MIDWIFERY_SERVICES.ID AS MIDWIFERY_SERVICES_ID',
                    'MIDWIFERY_SERVICES.FIRST_NAME',
                    'MIDWIFERY_SERVICES.LAST_NAME',
                    'MIDWIFERY_SERVICES.PREFERRED_EMAIL',
                    'MIDWIFERY_SERVICES.PREFERRED_PHONE',
                    'MIDWIFERY_DUPLICATED_REQUESTS.ID',
                    'MIDWIFERY_DUPLICATED_REQUESTS.MIDWIFERY_SERVICES_ORIGINAL_ID',
                    'MIDWIFERY_DUPLICATED_REQUESTS.MIDWIFERY_SERVICES_DUPLICATED_ID',
                    'MIDWIFERY_STATUS.DESCRIPTION AS STATUS_DESCRIPTION',
                    'MIDWIFERY_BIRTH_LOCATIONS.DESCRIPTION AS BIRTH_LOCATIONS',
                    'MIDWIFERY_PREFERRED_CONTACT_TYPES.DESCRIPTION AS PREFERRED_CONTACT',
                    db.raw("TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT,"+
                        "TO_CHAR(MIDWIFERY_SERVICES.DATE_OF_BIRTH, 'YYYY-MM-DD') AS DATE_OF_BIRTH")
            )
            .whereRaw(sqlFilter)
            .orderBy("MIDWIFERY_SERVICES.CREATED_AT");

        let index = 0;

        midwiferyDuplicate.forEach(function (value: any) {

            let url = "midwiferyWarnings/details/"+value.id;

            midwifery.push({
                midwifery_services_id: null,
                id: null,
                midwifery_services_original_id: null,
                midwifery_services_duplicated_id: null,
                first_name: 'Duplicated #'+(index+1),
                last_name: null,
                preferred_email: null,
                preferred_phone: null,
                date_of_birth: null,
                status_description: null,
                created_at: 'ACTIONS:',
                showUrl: url
            });

            midwifery.push(midwiferyOriginal[value.midwifery_services_original_id]);
            midwifery.push(value);
            index = index + 1;
        });
        console.log(midwifery);
        res.send({data: midwifery});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }

});

/**
 * Obtain data to show in details view
 *
 * @param id of request
 * @return json
 */
midwiferyRouter.get("/duplicates/details/:duplicate_id",[param("duplicate_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {

        let duplicate_id = Number(req.params.duplicate_id);
        var midwifery = Object();
        var midwiferyDuplicate = Object();
        var midwiferyEntries = Object();
        var midwiferyOptions = Object();
        var communityLocations = Object();
        var languages = Object();
        var communities = Object();
        var contact = Object();

        var duplicateEntry = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_DUPLICATED_REQUESTS`)
        .where("id", duplicate_id).then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult.original = row['midwifery_services_original_id'];
                arrayResult.duplicated = row['midwifery_services_duplicated_id'];
            }

            return arrayResult;
        });

        midwiferyEntries = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`)
        .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_BIRTH_LOCATIONS`, 'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH', 'MIDWIFERY_BIRTH_LOCATIONS.ID')
        .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_PREFERRED_CONTACT_TYPES`, 'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED', 'MIDWIFERY_PREFERRED_CONTACT_TYPES.ID')
        .select('MIDWIFERY_SERVICES.*',
                'MIDWIFERY_BIRTH_LOCATIONS.DESCRIPTION AS BIRTH_LOCATIONS',
                'MIDWIFERY_PREFERRED_CONTACT_TYPES.DESCRIPTION AS PREFERRED_CONTACT',
                db.raw("TO_CHAR(MIDWIFERY_SERVICES.DATE_OF_BIRTH, 'YYYY-MM-DD') AS DATE_OF_BIRTH, "+
                    "TO_CHAR(MIDWIFERY_SERVICES.WHEN_WAS_THE_FIRST_DAY_OF_YOUR_LAST_PERIOD_, 'YYYY-MM-DD') AS WHEN_WAS_THE_FIRST_DAY_OF_YOUR_LAST_PERIOD_,"+
                    "TO_CHAR(MIDWIFERY_SERVICES.DUE_DATE, 'YYYY-MM-DD') AS DUE_DATE")
        )
        .whereIn("MIDWIFERY_SERVICES.ID", [duplicateEntry.original, duplicateEntry.duplicated])
        .whereNot('MIDWIFERY_SERVICES.STATUS', '4');

        communities = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_GROUPS_COMMUNITIES`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        contact =  await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_CLINIC_CONTACT_TYPES`).select().then((rows: any) => {
            let arrayResult = Object();
            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        midwiferyOptions = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_OPTIONS`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        communityLocations = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_COMMUNITY_LOCATIONS`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        languages = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_LANGUAGES`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        if(midwiferyEntries){
            midwiferyEntries.forEach(function (value: any) {

                if(!_.isNull(value.community_located)) {
                    if(communityLocations.hasOwnProperty(value.community_located)){
                        value.community = communityLocations[value.community_located];
                    }else{
                        value.community = value.community_located;
                    }
                }

                if(!_.isNull(value.preferred_language)) {
                    if(languages.hasOwnProperty(value.preferred_language)){
                        value.language = languages[value.preferred_language];
                    }else{
                        value.language = value.preferred_language;
                    }
                }

                if(!_.isEmpty(value.do_you_identify_with_one_or_more_of_these_groups_and_communitie)){

                    var dataString = "";
                    _.forEach(value.do_you_identify_with_one_or_more_of_these_groups_and_communitie, function(valueCommunity: any) {
                        if(!isNaN(valueCommunity) && communities.hasOwnProperty(valueCommunity)) {
                            dataString += communities[valueCommunity]+",";
                        }else{
                            dataString += valueCommunity+",";
                        }
                    });

                    if(dataString.substr(-1) == ","){
                        dataString = dataString.slice(0, -1);
                    }

                    value.do_you_identify_with_one_or_more_of_these_groups_and_communitie = dataString.replace(/,/g, ', ');

                }

                if(!_.isEmpty(value.how_did_you_find_out_about_the_midwifery_clinic_select_all_that)){
                    var dataString = "";
                    _.forEach(value.how_did_you_find_out_about_the_midwifery_clinic_select_all_that, function(valueContact: any) {
                        if(!isNaN(valueContact) && contact.hasOwnProperty(valueContact)) {
                            dataString += contact[valueContact]+",";
                        }else{
                            dataString += valueContact+",";
                        }
                    });

                    if(dataString.substr(-1) == ","){
                        dataString = dataString.slice(0, -1);
                    }

                    value.how_did_you_find_out_about_the_midwifery_clinic_select_all_that = dataString.replace(/,/g, ', ');

                }

                if(value.id == duplicateEntry.original){
                    midwifery = value;
                }else if(value.id == duplicateEntry.duplicated){
                    midwiferyDuplicate = value;
                }

            });
        }

        res.json({ midwifery: midwifery, midwiferyDuplicate: midwiferyDuplicate, options: midwiferyOptions});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Validate if warning is non existant
 *
 * @param {duplicate_id} id of warning
 * @return json
 */
midwiferyRouter.get("/duplicates/validateWarning/:duplicate_id",[param("duplicate_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var duplicate_id = Number(req.params.duplicate_id);
        var warning = Object();
        var flagExists = true;
        var message = "";
        var type = "error";

        warning = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_DUPLICATED_REQUESTS`)
            .where('id', duplicate_id)
            .select()
            .first();

        if(!warning){
            flagExists = false;
            message = "The request you are consulting is non existant, please choose a valid request.";
        }

        res.json({ status: 200, flagWarning: flagExists, message: message, type: type});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Reject duplicate warning
 *
 * @param {warning}
 * @param {request}
 * @return json
 */
midwiferyRouter.patch("/duplicates/primary", async (req: Request, res: Response) => {

    try {

        var warning = Number(req.body.params.warning);
        var request = Number(req.body.params.request);
        var type = req.body.params.type;
        var updateRequest = Object();
        var rejectWarning = Object();

        if(!request){
            rejectWarning = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_DUPLICATED_REQUESTS`).where("ID", warning).del();
        }else{
            var warningRequest = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_DUPLICATED_REQUESTS`).where("ID", warning).first();

            if(type == 'O'){
                updateRequest = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`).update({status: "4"}).where("ID", warningRequest.midwifery_services_duplicated_id);
            }else if(type == 'D'){
                updateRequest = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`).update({status: "4"}).where("ID", warningRequest.midwifery_services_original_id);
            }

            if(updateRequest){
                rejectWarning = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_DUPLICATED_REQUESTS`).where("ID", warning).del();
            }
        }

        if(rejectWarning) {
            let type = "success";
            let message = "Warning updated successfully.";
            res.json({ status:200, message: message, type: type });
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Generate a new confirmation number similar to php's uniqid()
 *
 * @return id confirmation number
 */
function getConfirmationNumber() {

    var id = uniqid();

    // Convert to uppercase for better readability.
    id = id.toUpperCase().substring(0,9);

    return id;
}

/**
 * Generate a unix timestamp with microseconds and returns as hexidecimal. This gives us a relatively high certainty of uniquess.
 *
 * @return raw confirmation number
 */
function uniqid(prefix = "", random = false) {
    const sec = Date.now() * 1000 + Math.random() * 1000;
    const id = sec.toString(16).replace(/\./g, "").padEnd(14, "0");

    return `${prefix}${id}${random ? `.${Math.trunc(Math.random() * 100000000)}`:""}`;
}

/**
 * Transforms given array to the allowed database array format and replaces information with catalogue data.
 *
 * @param {model} name of catalogue
 * @param {names} array of information
 * @return {array}
 */
async function getMultipleIdsByModel(model: any, names: any) {

    var others = "";
    var groups = Object();
    var contact = Object();
    var data = Object();

    if(model == "MidwiferyGroupsCommunities") {
        groups = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_GROUPS_COMMUNITIES`).select().then((rows: any) => {
                            let arrayResult = Object();
                            for (let row of rows) {
                                arrayResult[row['name']] = row['description'];
                            }

                            return arrayResult;
                    });

        names.forEach(function (value: any, key: any) {
            if(!groups.hasOwnProperty(value)){
                others = names[key];
                names.splice(key, 1);
            }
        });

        data = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_GROUPS_COMMUNITIES`).whereIn('NAME', names );

    }else if(model == "MidwiferyClinicContactTypes") {
        contact =   await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_CLINIC_CONTACT_TYPES`).select().then((rows: any) => {
                            let arrayResult = Object();
                            for (let row of rows) {
                                arrayResult[row['name']] = row['description'];
                            }

                            return arrayResult;
                    });

        names.forEach(function (value: any, key: any) {
            if(!contact.hasOwnProperty(value)){
                others = names[key];
                names.splice(key, 1);
            }
        });

        data = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_CLINIC_CONTACT_TYPES`).whereIn('NAME', names);
    }

    if(data.length) {
        var modelValues = "";
        var max = data.length;
        var count = 1;

        if(max == 1) {
            modelValues = data[0].id.toString();
        }else{
            _.forEach(data, function(value: any) {
                if(count == max) {
                    modelValues += value.id.toString();
                }else{
                    modelValues += value.id.toString()+",";
                }

                count++;
            });
        }

        if(others !== "") {
            return "{"+modelValues+","+others+"}";
        }else{
            return "{"+modelValues+"}";
        }

    }else if(!data.length && names.length > 0) {
        return "{"+names[0]+"}";
    }else{
        return null;
    }
}

/**
 * Obtain data from options catalogue
 *
 * @param {field}
 * @param {data}
 * @return id of option
 */
async function getMidwiferyOptions(field: any, data: string) {

    var bool = true;

    if(data == "yes" || data == "Yes" || data == "YES") {
        bool = true;
    }else if(data == "no" || data == "No" || data == "NO") {
        bool = false;
    }else if(!data || data == "") {
        return null;
    }

    var options = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_OPTIONS`).where({ field_name: field }).where({ field_value: bool }).select().first();

    return options.id;
}