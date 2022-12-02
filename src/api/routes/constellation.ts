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

constellationRouter.get("/", async (req: Request, res: Response) => {
        //let { id } = req.params;

        var constellationHealth =  await db("bizont_edms_constellation_health.constellation_health")
            .leftJoin('bizont_edms_constellation_health.constellation_health_language', 'constellation_health.language_prefer_to_receive_services', '=', 'constellation_health_language.id')
            .select('constellation_health.*',
                    'constellation_health_language.description as language_preferred')
            .where('constellation_health.status', 'open')
            .orderBy('constellation_health.id', 'asc');

            constellationHealth.forEach(function (value: any) {

                if(value.language_prefer_to_receive_services){
                    value.language_prefer_to_receive_services = value.preferred_language;
                }else{
                    value.language_prefer_to_receive_services = value.language_preferred;
                }

                let dataString = "";
                var info_find = Object();

                _.forEach(value.diagnosis, function(valueDiagnosis: any, key: any) {
                    info_find = db("constellation_health.constellation_health_diagnosis_history")
                                        .where({ id: valueDiagnosis });

                    if(!isNaN(valueDiagnosis) && !info_find && typeof info_find.description !== 'undefined'){
                        dataString += info_find.description+",";
                    }else{
                        dataString += valueDiagnosis+",";
                    }
                });

                if(dataString.substr(-1) == ","){
                    dataString = dataString.substr(0, -1);
                }

                value.diagnosis = dataString.replace(",",", ");
            });

        res.json({ data: constellationHealth });
});

constellationRouter.get("/:constellationHealth_id",[param("constellationHealth_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    let { constellationHealth_id } = req.params;
    var constellationHealth = Object();
    var constellationFamily = Object();

    constellationHealth = await db("bizont_edms_constellation_health.constellation_health")
        .leftJoin('bizont_edms_constellation_health.constellation_health_language', 'constellation_health.language_prefer_to_receive_services', 'constellation_health_language.id')
        .leftJoin('bizont_edms_constellation_health.constellation_health_diagnosis_history', 'constellation_health.diagnosis', 'constellation_health_diagnosis_history.id')
        .leftJoin('bizont_edms_constellation_health.constellation_health_demographics', 'constellation_health.demographics_groups', 'constellation_health_demographics.id')
        .select('constellation_health.*',
                'constellation_health_language.description as language_prefer_description',
                'constellation_health_demographics.description as demographic_description')
        .where({ id: constellationHealth_id });

    constellationFamily = await db("bizont_edms_constellation_health.constellation_health_family_members")
        .leftJoin('bizont_edms_constellation_health.constellation_health_language', 'constellation_health_family_members.language_prefer_to_receive_services_family_member', 'constellation_health_language.id')
        .leftJoin('bizont_edms_constellation_health.constellation_health_diagnosis_history', 'constellation_health_family_members.diagnosis_family_member', 'constellation_health_diagnosis_history.id')
        .leftJoin('bizont_edms_constellation_health.constellation_health_demographics', 'constellation_health_family_members.demographics_groups_family_member', 'constellation_health_demographics.id')
        .select('constellation_health_family_members.*',
                'constellation_health_language.description as language_prefer_description_family_member',
                'constellation_health_demographics.description as demographic_description_family_member')
        .where({ id: constellationHealth_id });

    if(constellationHealth.date_of_birth == 0) {
        constellationHealth.date_of_birth =  "N/A";
    }

    let dataString = "";
    var info_find = Object();

    _.forEach(constellationHealth.diagnosis, function(valueDiagnosis: any, key: any) {
        info_find = db("bizont_edms_constellation_health.constellation_health_diagnosis_history").where({ id: valueDiagnosis });

        if(!isNaN(valueDiagnosis) && !info_find && typeof info_find.description !== 'undefined'){
            dataString += info_find.description+",";
        }else{
            dataString += valueDiagnosis+",";
        }
    });

    if(dataString.substr(-1) == ","){
        dataString = dataString.substr(0, -1);
    }

    constellationHealth.diagnosis = dataString.replace(",",", ");

    constellationHealth.flagFamilyMembers = false;

    if(constellationFamily.length){
        constellationHealth.flagFamilyMembers = true;
        constellationFamily.forEach(function (value: any, key: any) {

            if(value.date_of_birth_family_member == 0) {
                value.date_of_birth_family_member =  "N/A";
            }

            let dataString = "";
            var info_find = Object();

            _.forEach(constellationHealth.diagnosis, function(valueDiagnosis: any, key: any) {
                info_find = db("bizont_edms_constellation_health.constellation_health_diagnosis_history").where({ id: valueDiagnosis });

                if(!isNaN(valueDiagnosis) && !info_find && typeof info_find.description !== 'undefined'){
                    dataString += info_find.description+",";
                }else{
                    dataString += valueDiagnosis+",";
                }
            });

            if(dataString.substr(-1) == ","){
                dataString = dataString.substr(0, -1);
            }

            constellationFamily[key].diagnosis_family_member = dataString.replace(",",", ");

        });
    }

    res.json({ dataConstellation: constellationHealth, dataConstellationFamily: constellationFamily });
});

constellationRouter.post("/store", EnsureAuthenticated, async (req: Request, res: Response) => {

    var data = Object();
    data = req;
    //data = request->json()->all();

    var constellationHealth = Object();
    var demographics = Object();
    var languages = Object();
    var demographics = Object();

    constellationHealth.first_name = data.first_name;
    constellationHealth.last_name = data.last_name;
    constellationHealth.is_this_your_legal_name_ = data.is_this_your_legal_name_;

    let legal_name = "";
    if(typeof data.your_legal_name !== 'undefined'){
        legal_name = data.first_name+" "+data.last_name;
    }else{
        legal_name = data.your_legal_name;
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

    languages = db("bizont_edms_constellation_health.constellation_health_language").where({ value: data.language_prefer_to_receive_services }).first();

    if(languages){
        constellationHealth.language_prefer_to_receive_services = languages.id;
    }

    if(!data.language_prefer_to_receive_services){
        constellationHealth.preferred_language = data.other_language;
    }

    constellationHealth.diagnosis = getMultipleIdsByModel("ConstellationHealthDiagnosisHistory", data.diagnosis);

    demographics = await db("bizont_edms_constellation_health.constellation_health_demographics").where({ value: data.demographics_groups });

    if(demographics.length){
        constellationHealth.demographics_groups = demographics.id;
    }else{
        constellationHealth.demographics_groups = data.demographics_groups;
    }

    constellationHealth.include_family_members = data.include_family_members;

    const idConstellation = await knex('bizont_edms_constellation_health.constellation_health').returning('id').insert(constellationHealth);

    if(data.family_members_json.length){
        storeFamilyMembers(idConstellation, constellationHealth.family_members_json);
    }

    res.json({ data: idConstellation });

});

function storeFamilyMembers(idConstellationHealth:any, arrayMembers:any){

    var constellationFamilyMembers = Array();
    var i = 0;

    _.forEach(arrayMembers, function(value: any, key: any) {

        var languages = Object();
        var demographics = Object();

        constellationFamilyMembers[i]["constellation_health_id"] = idConstellationHealth;
        constellationFamilyMembers[i]["first_name_family_member"] = arrayMembers['first_name_family_member'];
        constellationFamilyMembers[i]["last_name_family_member"] = arrayMembers['last_name_family_member'];
        constellationFamilyMembers[i]["is_this_your_legal_name_family_member"] = arrayMembers['is_this_your_legal_name_family_member'];

        let legal_name = "";
        if(typeof arrayMembers['your_legal_name_family_member'] !== 'undefined'){
            legal_name = arrayMembers['first_name_family_member']+" "+arrayMembers['last_name_family_member'];
        }/*else{
            legal_name = arrayMembers['your_legal_name_family_member'];
        }*/

        constellationFamilyMembers[i]["your_legal_name_family_member"] = legal_name;
        constellationFamilyMembers[i]["pronouns_family_member"] = arrayMembers['pronouns_family_member'];
        constellationFamilyMembers[i]["date_of_birth_family_member"] = arrayMembers['date_of_birth_family_member'];
        constellationFamilyMembers[i]["yhcip_family_member"] = arrayMembers['yhcip_family_member'];
        constellationFamilyMembers[i]["relationship_family_member"] = arrayMembers['relationship_family_member'];
        constellationFamilyMembers[i]["current_family_physician_family_member"] = arrayMembers['current_family_physician_family_member'];
        constellationFamilyMembers[i]["accessing_health_care_family_member"] = arrayMembers['accessing_health_care_family_member'];
        constellationFamilyMembers[i]["interpretation_support_family_member"] = arrayMembers['interpretation_support_family_member'];
        constellationFamilyMembers[i]["family_physician_family_member"] = arrayMembers['family_physician_family_member'];

        constellationFamilyMembers[i]["have_yhcip_family_member"] = arrayMembers['have_yhcip_family_member'];
        constellationFamilyMembers[i]["health_care_card_family_member"] = arrayMembers['health_care_card_family_member'];
        constellationFamilyMembers[i]["province_family_member"] = arrayMembers['province_family_member'];

        languages = db("constellation_health.constellation_health_language").where({ value: arrayMembers['language_prefer_to_receive_services_family_member'] }).first('*');

        if(languages.lenght){
            constellationFamilyMembers[i]["language_prefer_to_receive_services_family_member"] = languages.id;
        }else{
            constellationFamilyMembers[i]["language_prefer_to_receive_services_family_member"] = null;
        }

        constellationFamilyMembers[i]["preferred_language_family_member"] = arrayMembers['other_language_family_member'];

        constellationFamilyMembers[i]["diagnosis_family_member"] = getMultipleIdsByModel("ConstellationHealthDiagnosisHistory", arrayMembers['diagnosis_family_member']);

        demographics = db("constellation_health.constellation_health_demographics").where({ value: arrayMembers['demographics_groups_family_member'] }).first('*');

        if(demographics.lenght){
            constellationFamilyMembers[i]["demographics_groups_family_member"] = demographics.id;
        }else{
            constellationFamilyMembers[i]["demographics_groups_family_member"] = arrayMembers['demographics_groups_family_member'];
        }
    });

    knex('constellation_health.constellation_health_family_members').insert(constellationFamilyMembers);

}

function getMultipleIdsByModel(model: string, names: any) {
    var others = "";
    var auxNames = names;
    var data = Object();
    var diagnosisHistory = Object();
    var demographics = Object();

    if(model == "ConstellationHealthDiagnosisHistory") {
        diagnosisHistory = db("bizont_edms_constellation_health.constellation_health_diagnosis_history").select();

        names.forEach(function (value: any, key: any) {
            if(!(diagnosisHistory[value])){
                others = names[key];
                names.splice(key, 1);
            }
        });

        //var data = ConstellationHealthDiagnosisHistory::whereIn('value', names)->get();
        data = db("bizont_edms_constellation_health.constellation_health_diagnosis_history")
                        .select()
                        .whereIn('value', names);

    }else if(model == "ConstellationHealthDemographics") {
        //var demographics = ConstellationHealthDemographics::all()->pluck('description', 'value');
        demographics = db("bizont_edms_constellation_health.constellation_health_demographics")
                                .select()
                                .pluck('description');

        names.forEach(function (value: any, key: any) {
            if(!(demographics[value])){
                others = names[key];
                names.splice(key, 1);
            }
        });

        //var data = ConstellationHealthDemographics::whereIn('value', names)->get();
        data = db("bizont_edms_constellation_health.constellation_health_demographics")
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
            return modelValues+","+others;
        }else{
            return modelValues;
        }

    }else if(!data.length && auxNames.length > 0){
        return auxNames[0];
    }else{
        return null;
    }
}