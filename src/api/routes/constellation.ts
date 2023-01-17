import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth"
import { body, param } from "express-validator";
//import moment from "moment";
import knex from "knex";
//import { ReturnValidationErrors } from "../../middleware";
import { DB_CONFIG_CONSTELLATION } from "../config";
var _ = require('lodash');

//let { RequireServerAuth, RequireAdmin } = require("../auth")

const db = knex(DB_CONFIG_CONSTELLATION)

export const constellationRouter = express.Router();

/**
 * Obtain data to show in the index view
 *
 * @return json
 */
constellationRouter.get("/", async (req: Request, res: Response) => {

    try {

        var constellationHealth =  await db("bizont_edms_constellation_health.constellation_health")
            .join('bizont_edms_constellation_health.constellation_status', 'constellation_health.status', '=', 'constellation_status.id')
            .select('constellation_health.your_legal_name',
                    'constellation_health.date_of_birth',
                    'constellation_health.family_physician',
                    'constellation_health.diagnosis',
                    'constellation_health.created_at',
                    'constellation_health.status',
                    'constellation_health.id as constellation_health_id')
            .whereNot('constellation_health.description', 'closed')
            .orderBy('constellation_health.id', 'asc');

        var diagnosis = Object();

        diagnosis = await db("bizont_edms_constellation_health.constellation_health_diagnosis_history").select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        constellationHealth.forEach(function (value: any) {

            if(value.date_of_birth == 0) {
                value.date_of_birth =  "N/A";
            }else{
                value.date_of_birth =  value.date_of_birth.toLocaleDateString("en-CA");
            }

            value.created_at =  value.created_at.toLocaleString("en-CA");

            if(value.language_prefer_to_receive_services){
                value.language_prefer_to_receive_services = value.preferred_language;
            }else{
                value.language_prefer_to_receive_services = value.language_preferred;
            }

            var dataString = "";

            _.forEach(value.diagnosis, function(valueDiagnosis: any, key: any) {

                if(valueDiagnosis in diagnosis){
                    dataString += diagnosis[valueDiagnosis]+",";
                }else{
                    dataString += valueDiagnosis+",";
                }
            });

            if(dataString.substr(-1) == ","){
                dataString = dataString.slice(0, -1);
            }

            value.diagnosis = dataString.replace(/,/g, ', ');

            value.showUrl = "constellation/show/"+value.constellation_health_id;
        });

        res.send({data: constellationHealth});
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
 * @param {constellationHealth_id} id of request
 * @return json
 */
constellationRouter.get("/validateRecord/:constellationHealth_id",[param("constellationHealth_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var constellationHealth_id = Number(req.params.constellationHealth_id);
        var constellationHealth = Object();
        var flagExists= true;
        var message= "";
        var type= "error";

        constellationHealth = await db("bizont_edms_constellation_health.constellation_health")
            .join('bizont_edms_constellation_health.constellation_status', 'constellation_health.status', '=', 'constellation_status.id')
            .where('constellation_health.id', constellationHealth_id)
            .select('bizont_edms_constellation_health.constellation_health.*',
                    'constellation_status.description as status_description')
            .first();

        if(!constellationHealth || constellationHealth.status == "closed"){
            flagExists= false;
            message= "The request you are consulting is closed or non existant, please choose a valid request.";
        }

        res.json({ status: 200, flagConstellation: flagExists, message: message, type: type});
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
 * @param {constellationHealth_id} id of request
 * @return json
 */
constellationRouter.get("/show/:constellationHealth_id",[param("constellationHealth_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var constellationHealth_id = Number(req.params.constellationHealth_id);
        var constellationHealth = Object();
        var constellationFamily = Object();

        constellationHealth = await db("bizont_edms_constellation_health.constellation_health")
            .leftJoin('bizont_edms_constellation_health.constellation_health_language', 'constellation_health.language_prefer_to_receive_services', 'constellation_health_language.id')
            .leftJoin('bizont_edms_constellation_health.constellation_health_demographics', 'constellation_health.demographics_groups', 'constellation_health_demographics.id')
            .where('constellation_health.id', constellationHealth_id)
            .select('bizont_edms_constellation_health.constellation_health.*',
                    'bizont_edms_constellation_health.constellation_health_language.description as language_prefer_description',
                    'bizont_edms_constellation_health.constellation_health_demographics.description as demographic_description')
            .first();

        constellationFamily = await db("bizont_edms_constellation_health.constellation_health_family_members")
            .leftJoin('bizont_edms_constellation_health.constellation_health_language', 'constellation_health_family_members.language_prefer_to_receive_services_family_member', 'constellation_health_language.id')
            .leftJoin('bizont_edms_constellation_health.constellation_health_demographics', 'constellation_health_family_members.demographics_groups_family_member', 'constellation_health_demographics.id')
            .select('constellation_health_family_members.*',
                    'constellation_health_language.description as language_prefer_description_family_member',
                    'constellation_health_demographics.description as demographic_description_family_member')
            .where('constellation_health_family_members.constellation_health_id', constellationHealth_id);

        if(constellationHealth.date_of_birth == 0) {
            constellationHealth.date_of_birth =  "N/A";
        }else{
            constellationHealth.date_of_birth =  constellationHealth.date_of_birth.toLocaleDateString("en-CA");
        }

        let dataString = "";
        var diagnosis = Object();

        diagnosis = await db("bizont_edms_constellation_health.constellation_health_diagnosis_history").select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        _.forEach(constellationHealth.diagnosis, function(valueDiagnosis: any, key: any) {
            if(valueDiagnosis in diagnosis){
                dataString += diagnosis[valueDiagnosis]+",";
            }else{
                dataString += valueDiagnosis+",";
            }
        });

        if(dataString.substr(-1) == ","){
            dataString = dataString.slice(0, -1);
        }

        constellationHealth.diagnosis = dataString.replace(/,/g, ', ');

        constellationHealth.flagFamilyMembers = false;

        //If the client has family members, the same treatment of the corresponding data is given.
        if(constellationFamily.length){
            constellationHealth.flagFamilyMembers = true;

            constellationFamily.forEach(function (value: any, key: any) {

                if(value.date_of_birth_family_member == 0) {
                    value.date_of_birth_family_member =  "N/A";
                }

                let dataString = "";

                _.forEach(value.diagnosis_family_member, function(valueDiagnosisFm: any, key: any) {

                    if(valueDiagnosisFm in diagnosis){
                        dataString += diagnosis[valueDiagnosisFm]+",";
                    }else{
                        dataString += valueDiagnosisFm+",";
                    }
                });

                if(dataString.substr(-1) == ","){
                    dataString = dataString.slice(0, -1);
                }

                constellationFamily[key].diagnosis_family_member = dataString.replace(/,/g, ', ');

            });
        }

        res.json({ status: 200, dataConstellation: constellationHealth, dataConstellationFamily: constellationFamily});
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
constellationRouter.post("/store", async (req: Request, res: Response) => {

    try {
        var data = Object();
        var constellationHealth = Object();
        var demographics = Object();
        var languages = Object();
        let constellationSaved = Object();

        data = req.body;
        constellationHealth.first_name = data.first_name;
        constellationHealth.last_name = data.last_name;
        constellationHealth.is_this_your_legal_name_ = data.is_this_your_legal_name_;

        let legal_name = "";
        if(_.isUndefined(data.your_legal_name)){
            legal_name = data.your_legal_name;
        }else{
            legal_name = data.first_name+" "+data.last_name;
        }

        constellationHealth.your_legal_name = legal_name;
        constellationHealth.pronouns = data.pronouns;
        constellationHealth.date_of_birth = data.date_of_birth;
        constellationHealth.yhcip = data.yhcip;
        constellationHealth.postal_code = data.postal_code;
        constellationHealth.phone_number = data.phone_number;
        constellationHealth.email_address = data.email_address;
        constellationHealth.language_prefer_to_receive_services = data.language_prefer_to_receive_services;
        constellationHealth.current_family_physician = data.current_family_physician;
        constellationHealth.accessing_health_care = data.accessing_health_care;
        constellationHealth.leave_phone_message = data.leave_phone_message;
        constellationHealth.interpretation_support = data.interpretation_support;
        constellationHealth.family_physician = data.family_physician;
        constellationHealth.prefer_to_be_contacted = data.prefer_to_be_contacted;
        constellationHealth.have_yhcip = data.have_yhcip;
        constellationHealth.health_care_card = data.health_care_card;
        constellationHealth.province = data.province;

        languages = await db("bizont_edms_constellation_health.constellation_health_language").where({ value: data.language_prefer_to_receive_services }).select().first();

        if(languages){
            constellationHealth.language_prefer_to_receive_services = languages.id;
        }

        if(data.language_prefer_to_receive_services !== ''){
            constellationHealth.preferred_language = data.other_language;
        }

        constellationHealth.diagnosis = await getMultipleIdsByModel("ConstellationHealthDiagnosisHistory", data.diagnosis);

        demographics = await db("bizont_edms_constellation_health.constellation_health_demographics").where({ value: data.demographics_groups }).select().first();

        if(demographics){
            constellationHealth.demographics_groups = demographics.id;
        }

        constellationHealth.include_family_members = data.include_family_members;

        constellationSaved = await db('bizont_edms_constellation_health.constellation_health').insert(constellationHealth).into('bizont_edms_constellation_health.constellation_health').returning('id');

        if(!_.isEmpty(data.family_members_json) && data.family_members_json !== "[]"){
            var idConstellation = constellationSaved.find((obj: any) => {return obj.id;})

            var replaceString = data.family_members_json.replace("}]","}");
            var stringWithoutBrackets = replaceString.replace("[{","{");
            var stringSeparation = stringWithoutBrackets.replace("},{","}*SEPARATION*{");
            var arrayJson = stringSeparation.split("*SEPARATION*");

            var familyMembers = await dataFamilyMembers(idConstellation.id, arrayJson);
            var familyMembersSaved = await db('bizont_edms_constellation_health.constellation_health_family_members').insert(familyMembers).into('bizont_edms_constellation_health.constellation_health_family_members');

            if(constellationSaved && familyMembersSaved){
                res.json({ status:200, message: 'Request saved' });
            }

        }else if(constellationSaved){
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
 * Obtain data to show in export file
 *
 * @param {status} status of request
 * @return json
 */
constellationRouter.get("/export/:status",[param("status")], async (req: Request, res: Response) => {
    try {

        var status = req.params.status;
        var constellationHealth = Object();
        var constellationFamily = Object();
        var arrayFilter = Array();

        var statusConstellation =  await db("bizont_edms_constellation_health.constellation_status").select().then((rows: any) => {
            let arrayResult = Object();
            for (let row of rows) {
                arrayResult[row['description']] = row['id'];
            }

            return arrayResult;
        });

        if(status == "no-filter"){
            arrayFilter = [statusConstellation["New/Unread"], statusConstellation["Entered"], statusConstellation["Declined"]];
        }else{
            arrayFilter.push(status);
        }

        constellationHealth = await db("bizont_edms_constellation_health.constellation_health")
            .leftJoin('bizont_edms_constellation_health.constellation_health_language', 'constellation_health.language_prefer_to_receive_services', 'constellation_health_language.id')
            .leftJoin('bizont_edms_constellation_health.constellation_health_demographics', 'constellation_health.demographics_groups', 'constellation_health_demographics.id')
            .where('constellation_health.status', arrayFilter)
            .select('bizont_edms_constellation_health.constellation_health.*',
                    'bizont_edms_constellation_health.constellation_health_language.description as language_prefer_description',
                    'bizont_edms_constellation_health.constellation_health_demographics.description as demographic_description');

        var diagnosis = Object();
        var clients = Array();

        diagnosis = await db("bizont_edms_constellation_health.constellation_health_diagnosis_history").select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        constellationHealth.forEach(function (value: any) {

            clients.push(value.id);

            if(value.date_of_birth == 0) {
                value.date_of_birth =  "N/A";
            }else{
                value.date_of_birth =  value.date_of_birth.toLocaleDateString("en-CA");
            }

            let dataString = "";

            _.forEach(value.diagnosis, function(valueDiagnosis: any, key: any) {
                if(valueDiagnosis in diagnosis){
                    dataString += diagnosis[valueDiagnosis]+",";
                }else{
                    dataString += valueDiagnosis+",";
                }
            });

            if(dataString.substr(-1) == ","){
                dataString = dataString.slice(0, -1);
            }

            value.diagnosis = dataString.replace(/,/g, ', ');

        });

        constellationFamily = await db("bizont_edms_constellation_health.constellation_health_family_members")
            .leftJoin('bizont_edms_constellation_health.constellation_health_language', 'constellation_health_family_members.language_prefer_to_receive_services_family_member', 'constellation_health_language.id')
            .leftJoin('bizont_edms_constellation_health.constellation_health_demographics', 'constellation_health_family_members.demographics_groups_family_member', 'constellation_health_demographics.id')
            .select('constellation_health_family_members.*',
                    'constellation_health_language.description as language_prefer_description_family_member',
                    'constellation_health_demographics.description as demographic_description_family_member')
            .whereIn('constellation_health_family_members.constellation_health_id', clients);

        constellationFamily.forEach(function (value: any, key: any) {

            if(value.date_of_birth_family_member == 0) {
                value.date_of_birth_family_member =  "N/A";
            }

            let dataString = "";

            _.forEach(value.diagnosis_family_member, function(valueDiagnosisFm: any, key: any) {

                if(valueDiagnosisFm in diagnosis){
                    dataString += diagnosis[valueDiagnosisFm]+",";
                }else{
                    dataString += valueDiagnosisFm+",";
                }
            });

            if(dataString.substr(-1) == ","){
                dataString = dataString.slice(0, -1);
            }

            constellationFamily[key].diagnosis_family_member = dataString.replace(/,/g, ', ');

        });

        res.json({ status: 200, dataConstellation: constellationHealth, dataConstellationFamily: constellationFamily});
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
 * @param {constellationHealth_id} id of request
 * @return json
 */
constellationRouter.post("/changeStatus/:constellationHealth_id",[param("constellationHealth_id").isInt().notEmpty()], async (req: Request, res: Response) => {

    try{
        var constellationHealth_id = Number(req.params.constellationHealth_id);

        var statusconstellation =  await db("bizont_edms_constellation_health.constellation_status").select().then((rows: any) => {
            let arrayResult = Object();
            for (let row of rows) {
                arrayResult[row['description']] = row['id'];
            }

            return arrayResult;
        });

        var updateStatus = await db("bizont_edms_constellation_health.constellation_health").update({status: statusconstellation["Closed"]}).where("id", constellationHealth_id);

        if(updateStatus){
            res.json({ status:200, message: 'Status changed' });
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
 * Obtains and transforms the data for storage
 *
 * @param {idConstellationHealth} id of saved ConstellationHealth record
 * @param {arrayMembers} array of family members information
 * @return {familyMembersInsert}
 */
async function dataFamilyMembers(idConstellationHealth:number, arrayMembers:any){

    var familyMembersInsert = Array();
    var i = 0;
    var dataMember = Object();
    var languages = Object();
    var demographics = Object();

    languages = await db("bizont_edms_constellation_health.constellation_health_language").select().then((rows: any) => {
                let arrayResult = Object();

                for (let row of rows) {
                    arrayResult[row['value']] = row['id'];
                }

                return arrayResult;
    });

    demographics = await db("bizont_edms_constellation_health.constellation_health_demographics").select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['value']] = row['id'];
            }

            return arrayResult;
    });

    for (let index = 0; index < arrayMembers.length; index++) {

        dataMember = (0, eval)('(' + arrayMembers[index] + ')');
        let constellationFamilyMembers = Object();

        constellationFamilyMembers.constellation_health_id = idConstellationHealth;
        constellationFamilyMembers.first_name_family_member = dataMember['first_name_family_member'];
        constellationFamilyMembers.last_name_family_member = dataMember['last_name_family_member'];
        constellationFamilyMembers.is_this_your_legal_name__family_member = dataMember['is_this_your_legal_name_family_member'];

        let legal_name = "";
        if(!_.isEmpty(dataMember['your_legal_name_family_member'])){
            legal_name = dataMember['first_name_family_member']+" "+dataMember['last_name_family_member'];
        }

        constellationFamilyMembers.your_legal_name_family_member = legal_name;
        constellationFamilyMembers.pronouns_family_member = dataMember['pronouns_family_member'];
        constellationFamilyMembers.date_of_birth_family_member = dataMember['date_of_birth_family_member'];
        constellationFamilyMembers.yhcip_family_member = dataMember['yhcip_family_member'];
        constellationFamilyMembers.relationship_family_member = dataMember['relationship_family_member'];
        constellationFamilyMembers.current_family_physician_family_member = dataMember['current_family_physician_family_member'];
        constellationFamilyMembers.accessing_health_care_family_member = dataMember['accessing_health_care_family_member'];
        constellationFamilyMembers.interpretation_support_family_member = dataMember['interpretation_support_family_member'];
        constellationFamilyMembers.family_physician_family_member = dataMember['family_physician_family_member'];
        constellationFamilyMembers.have_yhcip_family_member = dataMember['have_yhcip_family_member'];
        constellationFamilyMembers.health_care_card_family_member = dataMember['health_care_card_family_member'];
        constellationFamilyMembers.province_family_member = dataMember['province_family_member'];

        if(dataMember['language_prefer_to_receive_services_family_member'] in languages){
            constellationFamilyMembers.language_prefer_to_receive_services_family_member = languages[dataMember['language_prefer_to_receive_services_family_member']];
        }else{
            constellationFamilyMembers.language_prefer_to_receive_services_family_member = null;
        }

        constellationFamilyMembers.preferred_language_family_member = dataMember['other_language_family_member'];

        constellationFamilyMembers.diagnosis_family_member = await getMultipleIdsByModel("ConstellationHealthDiagnosisHistory", dataMember['diagnosis_family_member']);//'{1,6,"custom diagnosis"}';

        if(dataMember['demographics_groups_family_member'] in demographics){
            constellationFamilyMembers.demographics_groups_family_member = demographics[dataMember['demographics_groups_family_member']];
        }

        familyMembersInsert.push(constellationFamilyMembers);
    }

    return familyMembersInsert;
}

/**
 * Transforms given array to the allowed database array format and replaces information with catalogue data.
 *
 * @param {model} name of catalogue
 * @param {names} array of information
 * @return {array}
 */
async function getMultipleIdsByModel(model: string, names: any) {
    var others = "";
    var auxNames = names;
    var data = Object();
    var diagnosisHistory = Object();
    var demographics = Object();

    if(model == "ConstellationHealthDiagnosisHistory") {
        diagnosisHistory = await db("bizont_edms_constellation_health.constellation_health_diagnosis_history").select().then((rows: any) => {
                                    let arrayResult = Object();
                                    for (let row of rows) {
                                        arrayResult[row['value']] = row['description'];
                                    }

                                    return arrayResult;
                                });

        names.forEach(function (value: any, key: any) {
            if(!diagnosisHistory.hasOwnProperty(value)){
                others = names[key];
                names.splice(key, 1);
            }
        });

        data = await db("bizont_edms_constellation_health.constellation_health_diagnosis_history")
                        .select()
                        .whereIn('value', names);

    }else if(model == "ConstellationHealthDemographics") {

        demographics = await db("bizont_edms_constellation_health.constellation_health_demographics").select().then((rows: any) => {
                            let arrayResult = Object();
                            for (let row of rows) {
                                arrayResult[row['value']] = row['description'];
                            }

                            return arrayResult;
                        });

        names.forEach(function (value: any, key: any) {
            if(!demographics.hasOwnProperty(value)){
                others = names[key];
                names.splice(key, 1);
            }
        });

        data =  await db("bizont_edms_constellation_health.constellation_health_demographics")
                        .select()
                        .whereIn('value', names);
    }

    if(data.length){
        var modelValues = "";
        var max = data.length;
        var count = 1;
        if(max == 1){
            modelValues = data[0].id.toString();
        }else{
            data.forEach(function (value: any) {
                if(count == max){
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

    }else if(!data.length && auxNames.length > 0){
        return "{"+auxNames[0]+"}";
    }else{
        return null;
    }
}