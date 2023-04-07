import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth"
import { body, param } from "express-validator";
import { SubmissionStatusRepository } from "../repository/oracle/SubmissionStatusRepository";
import knex from "knex";
import { DB_CONFIG_MIDWIFERY, SCHEMA_MIDWIFERY } from "../config";
import { groupBy } from "../utils/groupBy";

var RateLimit = require('express-rate-limit');

var _ = require('lodash');

const db = knex(DB_CONFIG_MIDWIFERY)

export const midwiferyRouter = express.Router();
midwiferyRouter.use(RateLimit({
    windowMs: 1*60*1000, // 1 minute
    max: 5000
}));

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
        var midwiferyStatus = Array();
        var midwiferyOptions = Object();

        let query = db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`)
        .join(`${SCHEMA_MIDWIFERY}.MIDWIFERY_STATUS`, 'MIDWIFERY_SERVICES.STATUS', '=', 'MIDWIFERY_STATUS.ID')
        .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_BIRTH_LOCATIONS`, 'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH', '=', 'MIDWIFERY_BIRTH_LOCATIONS.ID')
        .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_PREFERRED_CONTACT_TYPES`, 'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED', '=', 'MIDWIFERY_PREFERRED_CONTACT_TYPES.ID')
        .select('MIDWIFERY_SERVICES.ID',
                'MIDWIFERY_SERVICES.CONFIRMATION_NUMBER',
                'MIDWIFERY_SERVICES.PREFERRED_NAME',
                'MIDWIFERY_SERVICES.PREFERRED_PHONE',
                'MIDWIFERY_SERVICES.PREFERRED_EMAIL',
                'MIDWIFERY_SERVICES.FIRST_PREGNANCY',
                'MIDWIFERY_BIRTH_LOCATIONS.DESCRIPTION as BIRTH_LOCATIONS',
                'MIDWIFERY_SERVICES.MEDICAL_CONCERNS',
                'MIDWIFERY_SERVICES.MAJOR_MEDICAL_CONDITIONS',
                'MIDWIFERY_SERVICES.DO_YOU_IDENTIFY_WITH_ONE_OR_MORE_OF_THESE_GROUPS_AND_COMMUNITIE',
                'MIDWIFERY_STATUS.DESCRIPTION AS STATUS_DESCRIPTION',
                'MIDWIFERY_PREFERRED_CONTACT_TYPES.DESCRIPTION AS PREFERRED_CONTACT',
                db.raw("TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT,"+
                        "TO_CHAR(MIDWIFERY_SERVICES.DUE_DATE, 'YYYY-MM-DD') AS DUE_DATE")
        )
        .where('MIDWIFERY_SERVICES.STATUS', '<>', 4 )
        .orderBy('MIDWIFERY_SERVICES.ID', 'ASC');

        if(dateFrom && dateTo) {
            query.where(db.raw("TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'YYYY-MM-DD') >=  ? AND TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'YYYY-MM-DD') <= ?",
                [dateFrom, dateTo]));
        }

        if (status_request) {
            query.whereIn("MIDWIFERY_SERVICES.STATUS", status_request);
        }

        const midwifery = await query;

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

            if(!_.isEmpty(value.do_you_identify_with_one_or_more_of_these_groups_and_communitie)) {

                var dataString = "";
                value.do_you_identify_with_one_or_more_of_these_groups_and_communitie = JSON.parse(value.do_you_identify_with_one_or_more_of_these_groups_and_communitie.toString());

                _.forEach(value.do_you_identify_with_one_or_more_of_these_groups_and_communitie.data, function(value: any, key: any) {
                    if(!isNaN(value) && communities.hasOwnProperty(value)) {
                        dataString += communities[value]+",";
                    }else{
                        dataString += value+",";
                    }
                });

                if(dataString.substr(-1) == ",") {
                    dataString = dataString.slice(0, -1);
                }

                value.do_you_identify_with_one_or_more_of_these_groups_and_communitie = dataString.replace(/,/g, ', ');
            }

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

        midwifery = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`)
            .join(`${SCHEMA_MIDWIFERY}.MIDWIFERY_STATUS`, 'MIDWIFERY_SERVICES.STATUS', 'MIDWIFERY_STATUS.ID')
            .where('MIDWIFERY_SERVICES.ID', midwifery_id)
            .select(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES.*`,
                    'MIDWIFERY_STATUS.DESCRIPTION as status_description').then((data:any) => {
                        return data[0];
                    });

        if(!midwifery || midwifery.status == 4){
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
            .select('MIDWIFERY_SERVICES.ID',
                    'MIDWIFERY_SERVICES.CONFIRMATION_NUMBER',
                    'MIDWIFERY_SERVICES.STATUS',
                    'MIDWIFERY_SERVICES.FIRST_NAME',
                    'MIDWIFERY_SERVICES.LAST_NAME',
                    'MIDWIFERY_SERVICES.PREFERRED_NAME',
                    'MIDWIFERY_SERVICES.PRONOUNS',
                    'MIDWIFERY_SERVICES.YUKON_HEALTH_INSURANCE',
                    'MIDWIFERY_SERVICES.COMMUNITY_LOCATED',
                    'MIDWIFERY_SERVICES.PREFERRED_LANGUAGE',
                    'MIDWIFERY_SERVICES.NEED_INTERPRETATION',
                    'MIDWIFERY_SERVICES.PREFERRED_PHONE',
                    'MIDWIFERY_SERVICES.PREFERRED_EMAIL',
                    'MIDWIFERY_SERVICES.OKAY_TO_LEAVE_MESSAGE',
                    'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED',
                    'MIDWIFERY_SERVICES.DATE_CONFIRMED',
                    'MIDWIFERY_SERVICES.FIRST_PREGNANCY',
                    'MIDWIFERY_SERVICES.HOW_MANY_VAGINAL_BIRTHS',
                    'MIDWIFERY_SERVICES.HOW_MANY_C_SECTION_BIRTHS',
                    'MIDWIFERY_SERVICES.COMPLICATIONS_WITH_PREVIOUS',
                    'MIDWIFERY_SERVICES.PROVIDE_DETAILS',
                    'MIDWIFERY_SERVICES.MIDWIFE_BEFORE',
                    'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH',
                    'MIDWIFERY_SERVICES.MEDICAL_CONCERNS',
                    'MIDWIFERY_SERVICES.PROVIDE_DETAILS2',
                    'MIDWIFERY_SERVICES.HAVE_YOU_HAD_PRIMARY_HEALTH_CARE',
                    'MIDWIFERY_SERVICES.MENSTRUAL_CYCLE_LENGTH',
                    'MIDWIFERY_SERVICES.FAMILY_PHYSICIAN',
                    'MIDWIFERY_SERVICES.PHYSICIAN_S_NAME',
                    'MIDWIFERY_SERVICES.MAJOR_MEDICAL_CONDITIONS',
                    'MIDWIFERY_SERVICES.PROVIDE_DETAILS3',
                    'MIDWIFERY_SERVICES.DO_YOU_IDENTIFY_WITH_ONE_OR_MORE_OF_THESE_GROUPS_AND_COMMUNITIE',
                    'MIDWIFERY_SERVICES.HOW_DID_YOU_FIND_OUT_ABOUT_THE_MIDWIFERY_CLINIC_SELECT_ALL_THAT',
                    'MIDWIFERY_PREFERRED_CONTACT_TYPES.DESCRIPTION as preferred_contact',
                    'MIDWIFERY_BIRTH_LOCATIONS.DESCRIPTION AS BIRTH_LOCATIONS',
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
                midwifery.language = midwifery.language.charAt(0).toUpperCase() + midwifery.language.slice(1);
            }else{
                midwifery.language = midwifery.preferred_language;
            }
        }

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

            midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communitie = JSON.parse(midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communitie.toString());

            _.forEach(midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communitie.data, function(valueCommunity: any) {
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
            midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that = JSON.parse(midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that.toString());

            _.forEach(midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that.data, function(valueContact: any) {
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
        midwifery.CONFIRMATION_NUMBER = getConfirmationNumber();
        midwifery.FIRST_NAME = data.first_name;
        midwifery.LAST_NAME = data.last_name;

        let legal_name = !_.isUndefined(data.preferred_name) && !_.isEmpty(data.preferred_name) ? data.preferred_name : data.first_name+" "+data.last_name;
        midwifery.PREFERRED_NAME = legal_name;
        midwifery.PRONOUNS = data.pronouns;

        if(!_.isNull(data.date_of_birth) && !_.isEmpty(data.date_of_birth)) {
            data.date_of_birth = new Date(data.date_of_birth);
            let result: string =   data.date_of_birth.toISOString().split('T')[0];
            midwifery.DATE_OF_BIRTH  = db.raw("TO_DATE('"+result+"','YYYY-MM-DD') ");
        }

        midwifery.PREFERRED_PHONE = data.preferred_phone;
        midwifery.PREFERRED_EMAIL = data.preferred_email;

        if(!_.isNull(data.when_was_the_first_day_of_your_last_period_) &&  !_.isEmpty(data.when_was_the_first_day_of_your_last_period_)) {
            data.when_was_the_first_day_of_your_last_period_ = new Date(data.when_was_the_first_day_of_your_last_period_);
            let period: string =   data.when_was_the_first_day_of_your_last_period_.toISOString().split('T')[0];
            midwifery.WHEN_WAS_THE_FIRST_DAY_OF_YOUR_LAST_PERIOD_  = db.raw("TO_DATE('"+period+"','YYYY-MM-DD') ");
        }

        midwiferyCommunityLocations = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_COMMUNITY_LOCATIONS`).where({ DESCRIPTION: data.community_located }).select().first();

        if(midwiferyCommunityLocations) {
            midwifery.COMMUNITY_LOCATED = midwiferyCommunityLocations.id;
        }else{
            midwifery.COMMUNITY_LOCATED = data.community_located;
        }

        midwiferyLanguages = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_LANGUAGES`).where({ DESCRIPTION: data.preferred_language }).select().then((data:any) => {
            return data[0];
        });

        if(midwiferyLanguages) {
            midwifery.PREFERRED_LANGUAGE = midwiferyLanguages.id ;
        }else{
            midwifery.PREFERRED_LANGUAGE = data.preferred_language;
        }

        midwiferyPreferredContactTypes = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_PREFERRED_CONTACT_TYPES`).where({ NAME: data.prefer_to_be_contacted }).select().then((data:any) => {
            return data[0];
        });

        if(midwiferyPreferredContactTypes) {
            midwifery.PREFER_TO_BE_CONTACTED = midwiferyPreferredContactTypes.id ;
        }else{
            midwifery.PREFER_TO_BE_CONTACTED = null;
        }

        midwiferyBirthLocations = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_BIRTH_LOCATIONS`).where({ NAME: data.where_to_give_birth }).select().then((data:any) => {
            return data[0];
        });

        if(midwiferyBirthLocations) {
            midwifery.WHERE_TO_GIVE_BIRTH = midwiferyBirthLocations.id ;
        }else{
            midwifery.WHERE_TO_GIVE_BIRTH = null;
        }

        const groupValue = await getMultipleIdsByModel("MidwiferyGroupsCommunities", data.do_you_identify_with_one_or_more_of_these_groups_and_communities);
        midwifery.DO_YOU_IDENTIFY_WITH_ONE_OR_MORE_OF_THESE_GROUPS_AND_COMMUNITIE = groupValue ? db.raw(`UTL_RAW.CAST_TO_RAW('${groupValue}')`) : null;

        const contactValue = await getMultipleIdsByModel("MidwiferyClinicContactTypes", data.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_);
        midwifery.HOW_DID_YOU_FIND_OUT_ABOUT_THE_MIDWIFERY_CLINIC_SELECT_ALL_THAT = contactValue ? db.raw(`UTL_RAW.CAST_TO_RAW('${contactValue}')`) : null;

        midwifery.YUKON_HEALTH_INSURANCE = await getMidwiferyOptions("yukon_health_insurance", data.yukon_health_insurance);
        midwifery.NEED_INTERPRETATION = await getMidwiferyOptions("need_interpretation", data.need_interpretation);
        midwifery.OKAY_TO_LEAVE_MESSAGE = await getMidwiferyOptions("okay_to_leave_message", data.okay_to_leave_message);
        midwifery.DATE_CONFIRMED = await getMidwiferyOptions("date_confirmed", data.date_confirmed);
        midwifery.FIRST_PREGNANCY = await getMidwiferyOptions("first_pregnancy", data.first_pregnancy);
        midwifery.COMPLICATIONS_WITH_PREVIOUS = await getMidwiferyOptions("complications_with_previous", data.complications_with_previous);
        midwifery.MIDWIFE_BEFORE = await getMidwiferyOptions("midwife_before", data.midwife_before);
        midwifery.MEDICAL_CONCERNS = await getMidwiferyOptions("medical_concerns", data.medical_concerns);
        midwifery.HAVE_YOU_HAD_PRIMARY_HEALTH_CARE = await getMidwiferyOptions("have_you_had_primary_health_care", data.have_you_had_primary_health_care);
        midwifery.FAMILY_PHYSICIAN = await getMidwiferyOptions("family_physician", data.family_physician);
        midwifery.MAJOR_MEDICAL_CONDITIONS = await getMidwiferyOptions("major_medical_conditions", data.major_medical_conditions);


        if(!_.isNull(data.due_date) && !_.isEmpty(data.due_date)) {
            data.due_date = new Date(data.due_date);
            let dueDate: string =   data.due_date.toISOString().split('T')[0];
            midwifery.DUE_DATE  = db.raw("TO_DATE('"+dueDate+"','YYYY-MM-DD') ");
        }

        midwifery.HOW_MANY_VAGINAL_BIRTHS = data.how_many_vaginal_births;
        midwifery.HOW_MANY_C_SECTION_BIRTHS = data.how_many_c_section_births;
        midwifery.PROVIDE_DETAILS = data.provide_details;
        midwifery.PROVIDE_DETAILS2 = data.provide_details2;
        midwifery.MENSTRUAL_CYCLE_LENGTH = data.menstrual_cycle_length;
        midwifery.PHYSICIAN_S_NAME = data.physician_s_name;
        midwifery.PROVIDE_DETAILS3 = data.provide_details3;

        midwiferySaved = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`).insert(midwifery).into(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`);

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
        var midwiferyOptions = Object();

        let query = db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`)
        .join(`${SCHEMA_MIDWIFERY}.MIDWIFERY_STATUS`, 'MIDWIFERY_SERVICES.STATUS', '=', 'MIDWIFERY_STATUS.ID')
        .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_BIRTH_LOCATIONS`, 'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH', 'MIDWIFERY_BIRTH_LOCATIONS.ID')
        .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_PREFERRED_CONTACT_TYPES`, 'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED', 'MIDWIFERY_PREFERRED_CONTACT_TYPES.ID')
        .select('MIDWIFERY_SERVICES.ID',
                'MIDWIFERY_SERVICES.CONFIRMATION_NUMBER',
                'MIDWIFERY_SERVICES.STATUS',
                'MIDWIFERY_SERVICES.FIRST_NAME',
                'MIDWIFERY_SERVICES.LAST_NAME',
                'MIDWIFERY_SERVICES.PREFERRED_NAME',
                'MIDWIFERY_SERVICES.PRONOUNS',
                'MIDWIFERY_SERVICES.YUKON_HEALTH_INSURANCE',
                'MIDWIFERY_SERVICES.COMMUNITY_LOCATED',
                'MIDWIFERY_SERVICES.PREFERRED_LANGUAGE',
                'MIDWIFERY_SERVICES.NEED_INTERPRETATION',
                'MIDWIFERY_SERVICES.PREFERRED_PHONE',
                'MIDWIFERY_SERVICES.PREFERRED_EMAIL',
                'MIDWIFERY_SERVICES.OKAY_TO_LEAVE_MESSAGE',
                'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED',
                'MIDWIFERY_SERVICES.DATE_CONFIRMED',
                'MIDWIFERY_SERVICES.FIRST_PREGNANCY',
                'MIDWIFERY_SERVICES.HOW_MANY_VAGINAL_BIRTHS',
                'MIDWIFERY_SERVICES.HOW_MANY_C_SECTION_BIRTHS',
                'MIDWIFERY_SERVICES.COMPLICATIONS_WITH_PREVIOUS',
                'MIDWIFERY_SERVICES.PROVIDE_DETAILS',
                'MIDWIFERY_SERVICES.MIDWIFE_BEFORE',
                'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH',
                'MIDWIFERY_SERVICES.MEDICAL_CONCERNS',
                'MIDWIFERY_SERVICES.PROVIDE_DETAILS2',
                'MIDWIFERY_SERVICES.HAVE_YOU_HAD_PRIMARY_HEALTH_CARE',
                'MIDWIFERY_SERVICES.MENSTRUAL_CYCLE_LENGTH',
                'MIDWIFERY_SERVICES.FAMILY_PHYSICIAN',
                'MIDWIFERY_SERVICES.PHYSICIAN_S_NAME',
                'MIDWIFERY_SERVICES.MAJOR_MEDICAL_CONDITIONS',
                'MIDWIFERY_SERVICES.PROVIDE_DETAILS3',
                'MIDWIFERY_SERVICES.DO_YOU_IDENTIFY_WITH_ONE_OR_MORE_OF_THESE_GROUPS_AND_COMMUNITIE',
                'MIDWIFERY_SERVICES.HOW_DID_YOU_FIND_OUT_ABOUT_THE_MIDWIFERY_CLINIC_SELECT_ALL_THAT',
                'MIDWIFERY_BIRTH_LOCATIONS.DESCRIPTION AS BIRTH_LOCATIONS',
                'MIDWIFERY_PREFERRED_CONTACT_TYPES.DESCRIPTION AS PREFERRED_CONTACT',
            db.raw("TO_CHAR(MIDWIFERY_SERVICES.DATE_OF_BIRTH, 'YYYY-MM-DD') AS DATE_OF_BIRTH, "+
                "TO_CHAR(MIDWIFERY_SERVICES.WHEN_WAS_THE_FIRST_DAY_OF_YOUR_LAST_PERIOD_, 'YYYY-MM-DD') AS WHEN_WAS_THE_FIRST_DAY_OF_YOUR_LAST_PERIOD_,"+
                "TO_CHAR(MIDWIFERY_SERVICES.DUE_DATE, 'YYYY-MM-DD') AS DUE_DATE,"+
                "TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT,"+
                "TO_CHAR(MIDWIFERY_SERVICES.UPDATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS UPDATED_AT")
            ).where('MIDWIFERY_SERVICES.STATUS', '<>', 4 );

        if(requests.length > 0){
            query.whereIn("MIDWIFERY_SERVICES.ID", requests);
        }

        if(dateFrom && dateTo) {
            query.where(db.raw("TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'YYYY-MM-DD') >=  ? AND TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'YYYY-MM-DD') <= ?",
            [dateFrom, dateTo]));
        }

        if (status_request) {
            query.whereIn("MIDWIFERY_SERVICES.STATUS", status_request);
        }

        const midwifery = await query;

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
                value.do_you_identify_with_one_or_more_of_these_groups_and_communitie = JSON.parse(value.do_you_identify_with_one_or_more_of_these_groups_and_communitie.toString());

                _.forEach(value.do_you_identify_with_one_or_more_of_these_groups_and_communitie.data, function(valueCommunity: any) {
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
                value.how_did_you_find_out_about_the_midwifery_clinic_select_all_that = JSON.parse(value.how_did_you_find_out_about_the_midwifery_clinic_select_all_that.toString());

                _.forEach(value.how_did_you_find_out_about_the_midwifery_clinic_select_all_that.data, function(valueContact: any) {
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

        var updateStatus = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`).update({STATUS: status_id}).whereIn("MIDWIFERY_SERVICES.ID", midwifery_id);

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

        midwiferyOriginal = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_DUPLICATED_REQUESTS`)
            .join(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`, 'MIDWIFERY_DUPLICATED_REQUESTS.ORIGINAL_ID', '=', 'MIDWIFERY_SERVICES.ID')
            .join(`${SCHEMA_MIDWIFERY}.MIDWIFERY_STATUS`, 'MIDWIFERY_SERVICES.STATUS', '=', 'MIDWIFERY_STATUS.ID')
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_BIRTH_LOCATIONS`, 'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH', '=', 'MIDWIFERY_BIRTH_LOCATIONS.ID')
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_PREFERRED_CONTACT_TYPES`, 'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED', '=', 'MIDWIFERY_PREFERRED_CONTACT_TYPES.ID')
            .select('MIDWIFERY_SERVICES.ID AS MIDWIFERY_SERVICES_ID',
                    'MIDWIFERY_SERVICES.FIRST_NAME',
                    'MIDWIFERY_SERVICES.LAST_NAME',
                    'MIDWIFERY_SERVICES.PREFERRED_EMAIL',
                    'MIDWIFERY_SERVICES.PREFERRED_PHONE',
                    'MIDWIFERY_DUPLICATED_REQUESTS.ORIGINAL_ID',
                    'MIDWIFERY_DUPLICATED_REQUESTS.DUPLICATED_ID',
                    'MIDWIFERY_STATUS.DESCRIPTION AS STATUS_DESCRIPTION',
                    'MIDWIFERY_BIRTH_LOCATIONS.DESCRIPTION AS BIRTH_LOCATIONS',
                    'MIDWIFERY_PREFERRED_CONTACT_TYPES.DESCRIPTION AS PREFERRED_CONTACT',
                    db.raw("TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT,"+
                        "TO_CHAR(midwifery_services.date_of_birth, 'YYYY-MM-DD') as date_of_birth")
            )
            .where('MIDWIFERY_SERVICES.STATUS', '<>', 4 )
            .orderBy("MIDWIFERY_SERVICES.CREATED_AT").then((rows: any) => {
                let arrayResult = Object();

                for (let row of rows) {
                    arrayResult[row['original_id']] = row;
                }

                return arrayResult;
            });

        midwiferyDuplicate = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_DUPLICATED_REQUESTS`)
            .join(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`, 'MIDWIFERY_DUPLICATED_REQUESTS.ORIGINAL_ID', '=', 'MIDWIFERY_SERVICES.ID')
            .join(`${SCHEMA_MIDWIFERY}.MIDWIFERY_STATUS`, 'MIDWIFERY_SERVICES.STATUS', '=', 'MIDWIFERY_STATUS.ID')
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_BIRTH_LOCATIONS`, 'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH', '=', 'MIDWIFERY_BIRTH_LOCATIONS.ID')
            .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_PREFERRED_CONTACT_TYPES`, 'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED', '=', 'MIDWIFERY_PREFERRED_CONTACT_TYPES.ID')
            .select('MIDWIFERY_SERVICES.ID AS MIDWIFERY_SERVICES_ID',
                    'MIDWIFERY_SERVICES.FIRST_NAME',
                    'MIDWIFERY_SERVICES.LAST_NAME',
                    'MIDWIFERY_SERVICES.PREFERRED_EMAIL',
                    'MIDWIFERY_SERVICES.PREFERRED_PHONE',
                    'MIDWIFERY_DUPLICATED_REQUESTS.ID',
                    'MIDWIFERY_DUPLICATED_REQUESTS.ORIGINAL_ID',
                    'MIDWIFERY_DUPLICATED_REQUESTS.DUPLICATED_ID',
                    'MIDWIFERY_STATUS.DESCRIPTION AS STATUS_DESCRIPTION',
                    'MIDWIFERY_BIRTH_LOCATIONS.DESCRIPTION AS BIRTH_LOCATIONS',
                    'MIDWIFERY_PREFERRED_CONTACT_TYPES.DESCRIPTION AS PREFERRED_CONTACT',
                    db.raw("TO_CHAR(MIDWIFERY_SERVICES.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT,"+
                        "TO_CHAR(MIDWIFERY_SERVICES.DATE_OF_BIRTH, 'YYYY-MM-DD') AS DATE_OF_BIRTH")
            )
            .where('MIDWIFERY_SERVICES.STATUS', '<>', 4 )
            .orderBy("MIDWIFERY_SERVICES.CREATED_AT");

        let index = 0;

        midwiferyDuplicate.forEach(function (value: any) {

            let url = "midwiferyWarnings/details/"+value.id;

            delete value.id;

            midwifery.push({
                midwifery_services_id: null,
                original_id: null,
                duplicated_id: null,
                first_name: 'Duplicated #'+(index+1),
                last_name: null,
                preferred_email: null,
                preferred_phone: null,
                date_of_birth: null,
                status_description: null,
                created_at: 'ACTIONS:',
                showUrl: url
            });

            midwifery.push(midwiferyOriginal[value.original_id]);
            midwifery.push(value);
            index = index + 1;
        });
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
        .where("ID", duplicate_id).then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult.original = row['original_id'];
                arrayResult.duplicated = row['duplicated_id'];
            }

            return arrayResult;
        });

        midwiferyEntries = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`)
        .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_BIRTH_LOCATIONS`, 'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH', 'MIDWIFERY_BIRTH_LOCATIONS.ID')
        .leftJoin(`${SCHEMA_MIDWIFERY}.MIDWIFERY_PREFERRED_CONTACT_TYPES`, 'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED', 'MIDWIFERY_PREFERRED_CONTACT_TYPES.ID')
        .select('MIDWIFERY_SERVICES.ID',
                'MIDWIFERY_SERVICES.CONFIRMATION_NUMBER',
                'MIDWIFERY_SERVICES.STATUS',
                'MIDWIFERY_SERVICES.FIRST_NAME',
                'MIDWIFERY_SERVICES.LAST_NAME',
                'MIDWIFERY_SERVICES.PREFERRED_NAME',
                'MIDWIFERY_SERVICES.PRONOUNS',
                'MIDWIFERY_SERVICES.YUKON_HEALTH_INSURANCE',
                'MIDWIFERY_SERVICES.COMMUNITY_LOCATED',
                'MIDWIFERY_SERVICES.PREFERRED_LANGUAGE',
                'MIDWIFERY_SERVICES.NEED_INTERPRETATION',
                'MIDWIFERY_SERVICES.PREFERRED_PHONE',
                'MIDWIFERY_SERVICES.PREFERRED_EMAIL',
                'MIDWIFERY_SERVICES.OKAY_TO_LEAVE_MESSAGE',
                'MIDWIFERY_SERVICES.PREFER_TO_BE_CONTACTED',
                'MIDWIFERY_SERVICES.DATE_CONFIRMED',
                'MIDWIFERY_SERVICES.FIRST_PREGNANCY',
                'MIDWIFERY_SERVICES.HOW_MANY_VAGINAL_BIRTHS',
                'MIDWIFERY_SERVICES.HOW_MANY_C_SECTION_BIRTHS',
                'MIDWIFERY_SERVICES.COMPLICATIONS_WITH_PREVIOUS',
                'MIDWIFERY_SERVICES.PROVIDE_DETAILS',
                'MIDWIFERY_SERVICES.MIDWIFE_BEFORE',
                'MIDWIFERY_SERVICES.WHERE_TO_GIVE_BIRTH',
                'MIDWIFERY_SERVICES.MEDICAL_CONCERNS',
                'MIDWIFERY_SERVICES.PROVIDE_DETAILS2',
                'MIDWIFERY_SERVICES.HAVE_YOU_HAD_PRIMARY_HEALTH_CARE',
                'MIDWIFERY_SERVICES.MENSTRUAL_CYCLE_LENGTH',
                'MIDWIFERY_SERVICES.FAMILY_PHYSICIAN',
                'MIDWIFERY_SERVICES.PHYSICIAN_S_NAME',
                'MIDWIFERY_SERVICES.MAJOR_MEDICAL_CONDITIONS',
                'MIDWIFERY_SERVICES.PROVIDE_DETAILS3',
                'MIDWIFERY_SERVICES.DO_YOU_IDENTIFY_WITH_ONE_OR_MORE_OF_THESE_GROUPS_AND_COMMUNITIE',
                'MIDWIFERY_SERVICES.HOW_DID_YOU_FIND_OUT_ABOUT_THE_MIDWIFERY_CLINIC_SELECT_ALL_THAT',
                'MIDWIFERY_PREFERRED_CONTACT_TYPES.DESCRIPTION as preferred_contact',
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
                    value.do_you_identify_with_one_or_more_of_these_groups_and_communitie = JSON.parse(value.do_you_identify_with_one_or_more_of_these_groups_and_communitie.toString());

                    _.forEach(value.do_you_identify_with_one_or_more_of_these_groups_and_communitie.data, function(valueCommunity: any) {
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
                    value.how_did_you_find_out_about_the_midwifery_clinic_select_all_that = JSON.parse(value.how_did_you_find_out_about_the_midwifery_clinic_select_all_that.toString());

                    _.forEach(value.how_did_you_find_out_about_the_midwifery_clinic_select_all_that.data, function(valueContact: any) {
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
            .where('ID', duplicate_id)
            .select()
            .then((data:any) => {
                return data[0];
            });

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
                updateRequest = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`).update({STATUS: "4"}).where("ID", warningRequest.duplicated_id);
            }else if(type == 'D'){
                updateRequest = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_SERVICES`).update({STATUS: "4"}).where("ID", warningRequest.original_id);
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

        if (names.length > 0) {
            data = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_GROUPS_COMMUNITIES`)
                        .select(
                            db.raw(`JSON_OBJECT('data' VALUE JSON_ARRAYAGG(ID)) AS DATA`)
                        )
                        .whereIn('NAME', names);
        }

        if (Array.isArray(data) && data.length > 0) {
            data =  JSON.parse(data[0].data);
        }

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

        if (names.length > 0) {
            data = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_CLINIC_CONTACT_TYPES`)
                        .select(
                            db.raw(`JSON_OBJECT('data' VALUE JSON_ARRAYAGG(ID)) AS DATA`)
                        )
                        .whereIn('NAME', names);
        }

        if (Array.isArray(data) && data.length > 0) {
            data =  JSON.parse(data[0].data);
        }

    }

    if(_.isEmpty(data) && others !== ""){

        data.data = [others];

    }else if(!_.isEmpty(data) && others !== "") {

        data.data.push(others);

    }

    return JSON.stringify(data);
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

    var options = await db(`${SCHEMA_MIDWIFERY}.MIDWIFERY_OPTIONS`).where({ FIELD_NAME: field }).where({ FIELD_VALUE: bool }).select().first();

    return options.id;
}