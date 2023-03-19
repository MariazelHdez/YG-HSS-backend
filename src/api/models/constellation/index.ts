import { BaseTableDTO } from "models/base";
export interface ConstellationHealthLanguage {
    id: number;
    value: string;
    description: string;
}

export interface ConstellationHealthDTO extends BaseTableDTO {
    status: number;
    first_name: string;
    last_name: string;
    is_this_your_leagal_name: string;
    your_legal_name: string;
    pronouns: string;
    date_of_birth: Date;
    have_yhcip: string;
    health_care_card: string;
    province: string;
    yhcip: string;
    postal_code: string;
    prefer_to_be_contacted: string;
    phone_number: string;
    email_address: string;
    leave_phone_message: string;
    language_prefer_to_receive_services: number;
    preferred_language: string;
    interpretation_support: string;
    family_physician: string;
    current_family_physician: string;
    accessing_health_care: string;
    diagnosis: string;
    demographics_groups: number;
    include_family_members: string;
}