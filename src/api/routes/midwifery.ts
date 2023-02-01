import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth"
import { body, param } from "express-validator";
//import moment from "moment";
import knex from "knex";
//import { ReturnValidationErrors } from "../../middleware";
import { DB_CONFIG_MIDWIFERY } from "../config";
var _ = require('lodash');

const db = knex(DB_CONFIG_MIDWIFERY)

export const midwiferyRouter = express.Router();

/**
 * Obtain data to show in the index view
 *
 * @return json
 */
midwiferyRouter.get("/", async (req: Request, res: Response) => {

    try {

        var midwifery = Object();
        var midwiferyStatus = Array();
        var midwiferyOptions = Object();

        midwifery = await db("bizont_edms_midwifery.midwifery_services")
            .join('bizont_edms_midwifery.midwifery_status', 'midwifery_services.status', '=', 'midwifery_status.id')
            .leftJoin('bizont_edms_midwifery.midwifery_birth_locations', 'midwifery_services.where_to_give_birth', '=', 'midwifery_birth_locations.id')
            .leftJoin('bizont_edms_midwifery.midwifery_preferred_contact_types', 'midwifery_services.prefer_to_be_contacted', '=', 'midwifery_preferred_contact_types.id')
            .select('midwifery_services.*',
                    'midwifery_status.description as status_description',
                    'midwifery_birth_locations.description as birth_locations',
                    'midwifery_preferred_contact_types.description as preferred_contact')
            .whereNot('midwifery_status.description', 'Closed')
            .orderBy('midwifery_services.id', 'asc');

        midwiferyStatus = await db("bizont_edms_midwifery.midwifery_status").select().then((rows: any) => {
            let arrayResult = Array();

            for (let row of rows) {
                //arrayResult[row['id']] = row['field_value'];
                arrayResult.push({text: row['description'], value: row['id']});
            }

            return arrayResult;
        });

        midwiferyOptions = await db("bizont_edms_midwifery.midwifery_options").select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['field_value'];
            }

            return arrayResult;
        });

        var communities = Object();

        communities = await db("bizont_edms_midwifery.midwifery_groups_communities").select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        _.forEach(midwifery, function(value: any, key: any) {
            value.first_pregnancy = !value.first_pregnancy ? ( midwiferyOptions[value.first_pregnancy] == 1 ? 'Yes' : 'No'): '' ;
            value.medical_concerns = !value.medical_concerns ? ( midwiferyOptions[value.medical_concerns] == 1 ? 'Yes' : 'No'): '' ;
            value.major_medical_conditions = !value.major_medical_conditions ? ( midwiferyOptions[value.major_medical_conditions] == 1 ? 'Yes' : 'No'): '' ;

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

            value.created_at =  value.created_at.toLocaleString("en-CA");
            value.due_date =  value.due_date.toLocaleString("en-CA");

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

        midwifery = await db("bizont_edms_midwifery.midwifery_services")
            .join('bizont_edms_midwifery.midwifery_status', 'midwifery_services.status', 'midwifery_status.id')
            .where('midwifery_services.id', midwifery_id)
            .select('bizont_edms_midwifery.midwifery_services.*',
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
        let midwifery_id = Number(req.params.midwifery_id);
        var midwifery = Object();
        var midwiferyOptions = Object();

        midwifery = await db("bizont_edms_midwifery.midwifery_services")
            .leftJoin('bizont_edms_midwifery.midwifery_community_locations', 'midwifery_services.community_located', 'midwifery_community_locations.id')
            .leftJoin('bizont_edms_midwifery.midwifery_languages', 'midwifery_services.preferred_language', 'midwifery_languages.id')
            .leftJoin('bizont_edms_midwifery.midwifery_birth_locations', 'midwifery_services.where_to_give_birth', 'midwifery_birth_locations.id')
            .leftJoin('bizont_edms_midwifery.midwifery_preferred_contact_types', 'midwifery_services.prefer_to_be_contacted', 'midwifery_preferred_contact_types.id')
            .select('midwifery_services.*',
                    'midwifery_community_locations.description as community',
                    'midwifery_languages.description as language',
                    'midwifery_birth_locations.description as birth_locations',
                    'midwifery_preferred_contact_types.description as preferred_contact')
            .where("midwifery_services.id", midwifery_id)
            .first();

        midwiferyOptions = await db("bizont_edms_midwifery.midwifery_options").select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        if(!_.isNull(midwifery.date_of_birth)) {
            midwifery.date_of_birth = midwifery.date_of_birth.toLocaleString("en-CA");
        }else if(midwifery.date_of_birth == 0) {
            midwifery.date_of_birth = "N/A";
        }

        if(!_.isNull(midwifery.when_was_the_first_day_of_your_last_period_)) {
            midwifery.when_was_the_first_day_of_your_last_period_ =  midwifery.when_was_the_first_day_of_your_last_period_.toLocaleString("en-CA");
        }else if(midwifery.when_was_the_first_day_of_your_last_period_ == 0) {
            midwifery.when_was_the_first_day_of_your_last_period_ =  "N/A";
        }

        if(!_.isNull(midwifery.due_date)) {
            midwifery.due_date =  midwifery.due_date.toLocaleString("en-CA");
        }else if(midwifery.due_date == 0) {
            midwifery.due_date =  "N/A";
        }

        if(midwifery.community == null) {
            midwifery.community = midwifery.community_located;
        }

        if(midwifery.language == null) {
            midwifery.language = midwifery.preferred_language;
        }

        if(!midwifery.preferred_name || midwifery.preferred_name == "") {
            midwifery.preferred_name = midwifery.preferred_name;
        }

        var communities = Object();
        var contact = Object();

        communities = await db("bizont_edms_midwifery.midwifery_groups_communities").select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        contact =  await db("bizont_edms_midwifery.midwifery_clinic_contact_types").select().then((rows: any) => {
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

        var statusMidwifery =  await db("bizont_edms_midwifery.midwifery_status").where("description", "Closed").select().first();

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        let todayDate = mm+'_'+dd+'_'+yyyy;
        let fileName = 'midwifery_request_details_'+todayDate+".pdf";

        res.json({ midwifery: midwifery, options: midwiferyOptions, fileName:fileName, midwiferyStatusClosed: statusMidwifery.id });

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
        if(_.isUndefined(data.preferred_name)) {
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

        midwiferyCommunityLocations = await db("bizont_edms_midwifery.midwifery_community_locations").where({ description: data.community_located }).select().first();

        if(midwiferyCommunityLocations) {
            midwifery.community_located = midwiferyCommunityLocations.id;
        }else{
            midwifery.community_located = data.community_located;
        }

        midwiferyLanguages = await db("bizont_edms_midwifery.midwifery_languages").where({ description: data.preferred_language }).select().first();

        if(midwiferyLanguages) {
            midwifery.preferred_language = midwiferyLanguages.id ;
        }else{
            midwifery.preferred_language = data.preferred_language;
        }

        midwiferyPreferredContactTypes = await db("bizont_edms_midwifery.midwifery_preferred_contact_types").where({ name: data.prefer_to_be_contacted }).select().first();

        if(midwiferyPreferredContactTypes) {
            midwifery.prefer_to_be_contacted = midwiferyPreferredContactTypes.id ;
        }else{
            midwifery.prefer_to_be_contacted = null;
        }

        midwiferyBirthLocations = await db("bizont_edms_midwifery.midwifery_birth_locations").where({ name: data.where_to_give_birth }).select().first();

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

        midwiferySaved = await db('bizont_edms_midwifery.midwifery_services').insert(midwifery).into('bizont_edms_midwifery.midwifery_services').returning('id');

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
//midwiferyRouter.get("/export/:status",[param("status")], async (req: Request, res: Response) => {
midwiferyRouter.post("/export", async (req: Request, res: Response) => {
    try {

        var requests = req.body.params.requests;
        var dateFrom = req.body.params.dateFrom;
        var dateTo = req.body.params.dateTo;
        var midwifery = Object();
        var midwiferyOptions = Object();
        var sqlFilter = "midwifery_status.description IN ('New/Unread', 'Entered', 'Declined')";

        if(requests.length > 0){
            sqlFilter += " AND midwifery_services.id IN ("+requests+")";
        }else if(dateFrom !== null && dateTo !== null){
            sqlFilter += " AND midwifery_services.created_at >= '"+dateFrom+"' AND midwifery_services.created_at <= '"+dateTo+"'";
        }

        midwifery = await db("bizont_edms_midwifery.midwifery_services")
            .join('bizont_edms_midwifery.midwifery_status', 'midwifery_services.status', '=', 'midwifery_status.id')
            .leftJoin('bizont_edms_midwifery.midwifery_community_locations', 'midwifery_services.community_located', 'midwifery_community_locations.id')
            .leftJoin('bizont_edms_midwifery.midwifery_languages', 'midwifery_services.preferred_language', 'midwifery_languages.id')
            .leftJoin('bizont_edms_midwifery.midwifery_birth_locations', 'midwifery_services.where_to_give_birth', 'midwifery_birth_locations.id')
            .leftJoin('bizont_edms_midwifery.midwifery_preferred_contact_types', 'midwifery_services.prefer_to_be_contacted', 'midwifery_preferred_contact_types.id')
            .select('midwifery_services.*',
                    'midwifery_community_locations.description as community',
                    'midwifery_languages.description as language',
                    'midwifery_birth_locations.description as birth_locations',
                    'midwifery_preferred_contact_types.description as preferred_contact')
            .whereRaw(sqlFilter);


        midwiferyOptions = await db("bizont_edms_midwifery.midwifery_options").select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        var communities = Object();
        var contact = Object();

        communities = await db("bizont_edms_midwifery.midwifery_groups_communities").select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        contact =  await db("bizont_edms_midwifery.midwifery_clinic_contact_types").select().then((rows: any) => {
            let arrayResult = Object();
            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        midwifery.forEach(function (value: any) {

            if(!_.isNull(value.date_of_birth)) {
                value.date_of_birth = value.date_of_birth.toLocaleString("en-CA");
            }else if(value.date_of_birth == 0) {
                value.date_of_birth = "N/A";
            }

            if(!_.isNull(value.when_was_the_first_day_of_your_last_period_)) {
                value.when_was_the_first_day_of_your_last_period_ =  value.when_was_the_first_day_of_your_last_period_.toLocaleString("en-CA");
            }else if(value.when_was_the_first_day_of_your_last_period_ == 0) {
                value.when_was_the_first_day_of_your_last_period_ =  "N/A";
            }

            if(!_.isNull(value.due_date)) {
                value.due_date =  value.due_date.toLocaleString("en-CA");
            }else if(value.due_date == 0) {
                value.due_date =  "N/A";
            }

            if(value.community == null) {
                value.community = value.community_located;
            }

            if(value.language == null) {
                value.language = value.preferred_language;
            }

            if(!value.preferred_name || value.preferred_name == "") {
                value.preferred_name = value.preferred_name;
            }

            if(!_.isNull(value.okay_to_leave_message)){
                value.okay_to_leave_message = midwiferyOptions[midwifery.okay_to_leave_message];
            }

            if(!_.isNull(value.yukon_health_insurance)){
                value.yukon_health_insurance = midwiferyOptions[midwifery.yukon_health_insurance];
            }

            if(!_.isNull(value.need_interpretation)){
                value.need_interpretation = midwiferyOptions[midwifery.need_interpretation];
            }

            if(!_.isNull(value.date_confirmed)){
                value.date_confirmed = midwiferyOptions[midwifery.date_confirmed];
            }

            if(!_.isNull(value.first_pregnancy)){
                value.first_pregnancy = midwiferyOptions[midwifery.first_pregnancy];
            }

            if(!_.isNull(value.complications_with_previous)){
                value.complications_with_previous = midwiferyOptions[midwifery.complications_with_previous];
            }

            if(!_.isNull(value.midwife_before)){
                value.midwife_before = midwiferyOptions[midwifery.midwife_before];
            }

            if(!_.isNull(value.medical_concerns)){
                value.medical_concerns = midwiferyOptions[midwifery.medical_concerns];
            }

            if(!_.isNull(value.have_you_had_primary_health_care)){
                value.have_you_had_primary_health_care = midwiferyOptions[midwifery.have_you_had_primary_health_care];
            }

            if(!_.isNull(value.family_physician)){
                value.family_physician = midwiferyOptions[midwifery.family_physician];
            }

            if(!_.isNull(value.major_medical_conditions)){
                value.major_medical_conditions = midwiferyOptions[midwifery.major_medical_conditions];
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

        var updateStatus = await db("bizont_edms_midwifery.midwifery_services").update({status: status_id}).whereIn("id", midwifery_id);

        if(updateStatus) {
            let type = "success";
            let message = "Request status changed successfully.";

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
        groups = await db("bizont_edms_midwifery.midwifery_groups_communities").select().then((rows: any) => {
                            let arrayResult = Object();
                            for (let row of rows) {
                                arrayResult[row['name']] = row['description'];
                            }

                            return arrayResult;
                    });

        names.forEach(function (value: any, key: any) {
            if(!groups.hasOwnProperty(value)){
                others = names[key];
                //names.splice(key, 1);
            }
        });

        data = await db("bizont_edms_midwifery.midwifery_groups_communities").whereIn('name', names );

    }else if(model == "MidwiferyClinicContactTypes") {
        contact =   await db("bizont_edms_midwifery.midwifery_clinic_contact_types").select().then((rows: any) => {
                            let arrayResult = Object();
                            for (let row of rows) {
                                arrayResult[row['name']] = row['description'];
                            }

                            return arrayResult;
                    });

        names.forEach(function (value: any, key: any) {
            if(!contact.hasOwnProperty(value)){
                others = names[key];
                //names.splice(key, 1);
            }
        });

        data = await db("bizont_edms_midwifery.midwifery_clinic_contact_types").whereIn('name', names);
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

    if(data == "yes") {
        bool = true;
    }else if(data == "no") {
        bool = false;
    }else if(!data || data == "") {
        return null;
    }

    var options = await db("bizont_edms_midwifery.midwifery_options").where({ field_name: field }).where({ field_value: bool }).select().first();

    return options.id;
}