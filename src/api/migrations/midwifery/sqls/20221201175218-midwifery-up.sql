/* Replace with your SQL commands */

/**************************************************************/
/*************** midwifery_services ***************************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_midwifery.midwifery_services
(
    id SERIAL PRIMARY KEY,
    confirmation_number character varying(10),
    status character varying(25) DEFAULT 'open',
    first_name character varying(255),
    last_name character varying(255),
    preferred_name character varying(255),
    pronouns character varying(255),
    date_of_birth DATE,
    yukon_health_insurance int,
    community_located character varying(100),
    preferred_language character varying(100),
    need_interpretation int,
    preferred_phone character varying(255),
    preferred_email character varying(255),
    okay_to_leave_message int,
    prefer_to_be_contacted int,
    when_was_the_first_day_of_your_last_period_ DATE,
    due_date DATE,
    date_confirmed int,
    first_pregnancy int,
    how_many_vaginal_births character varying(255),
    how_many_c_section_births character varying(255),
    complications_with_previous int,
    provide_details text,
    midwife_before int,
    where_to_give_birth int,
    medical_concerns int,
    provide_details2 text,
    have_you_had_primary_health_care int,
    menstrual_cycle_length character varying(255),
    family_physician int,
    physician_s_name character varying(255),
    major_medical_conditions int,
    provide_details3 text,
    do_you_identify_with_one_or_more_of_these_groups_and_communities TEXT [],
    how_did_you_find_out_about_the_midwifery_clinic_select_all_that_ TEXT [],

    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_midwifery.midwifery_services
    OWNER to postgres;

CREATE INDEX midwifery_services_status_idx ON bizont_edms_midwifery.midwifery_services (status);
CREATE INDEX midwifery_services_creation_date_idx ON bizont_edms_midwifery.midwifery_services (created_at);
CREATE INDEX midwifery_services_name_idx ON bizont_edms_midwifery.midwifery_services (first_name, last_name);

/**************************************************************/
/******************* midwifery_options ************************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_midwifery.midwifery_options
(
    id SERIAL PRIMARY KEY,
    field_name character varying(100) NOT NULL,
    field_value BOOLEAN NOT NULL,
    description character varying(500) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_midwifery.midwifery_options
    OWNER to postgres;

/**************************************************************/
/*************** midwifery_community_locations ****************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_midwifery.midwifery_community_locations
(
    id SERIAL PRIMARY KEY,
    description character varying(500) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_midwifery.midwifery_community_locations
    OWNER to postgres;

/**************************************************************/
/****************** midwifery_birth_locations *****************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_midwifery.midwifery_birth_locations
(
    id SERIAL PRIMARY KEY,
    name character varying(255) NOT NULL,
    description character varying(500) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_midwifery.midwifery_birth_locations
    OWNER to postgres;

/**************************************************************/
/****************** midwifery_groups_communities **************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_midwifery.midwifery_groups_communities
(
    id SERIAL PRIMARY KEY,
    name character varying(255) NOT NULL,
    description character varying(500) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_midwifery.midwifery_groups_communities
    OWNER to postgres;

/**************************************************************/
/*************** midwifery_clinic_contact_types ***************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_midwifery.midwifery_clinic_contact_types
(
    id SERIAL PRIMARY KEY,
    name character varying(255) NOT NULL,
    description character varying(500) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_midwifery.midwifery_clinic_contact_types
    OWNER to postgres;

/**************************************************************/
/********************* midwifery_languages ********************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_midwifery.midwifery_languages
(
    id SERIAL PRIMARY KEY,
    description character varying(500) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_midwifery.midwifery_languages
    OWNER to postgres;

/**************************************************************/
/************** midwifery_preferred_contact_types *************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_midwifery.midwifery_preferred_contact_types
(
    id SERIAL PRIMARY KEY,
    name character varying(255) NOT NULL,
    description character varying(500) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_midwifery.midwifery_preferred_contact_types
    OWNER to postgres;

/**************************************************************/
/******************* midwifery_options ************************/
/**************************************************************/
INSERT INTO bizont_edms_midwifery.midwifery_options(id, field_name, field_value, description)
VALUES (1, 'yukon_health_insurance', TRUE, 'Yes, I have Yukon health insurance.'),
        (2, 'yukon_health_insurance', FALSE, 'No, I do not have Yukon health insurance.'),

        (3, 'need_interpretation', TRUE, 'Yes, I will need interpretation support.'),
        (4, 'need_interpretation', FALSE, 'No, I will not need interpretation support.'),

        (5, 'okay_to_leave_message', TRUE, 'Yes, it is okay to leave a message.'),
        (6, 'okay_to_leave_message', FALSE, 'No, do not leave a message.'),

        (7, 'date_confirmed', TRUE, 'Yes, this date is confirmed.'),
        (8, 'date_confirmed', FALSE, 'No, this date is not confirmed.'),

        (9, 'first_pregnancy', TRUE, 'Yes, this is my first pregnancy.'),
        (10, 'first_pregnancy', FALSE, 'No, this is not my first pregnancy.'),

        (11, 'complications_with_previous', TRUE, 'Yes, I have had previous complications.'),
        (12, 'complications_with_previous', FALSE, 'No, I haven''t had any previous complications.'),

        (13, 'midwife_before', TRUE, 'Yes, I have had a midwife before.'),
        (14, 'midwife_before', FALSE, 'No, I have never had a midwife.'),

        (15, 'medical_concerns', TRUE, 'Yes, there are known medical concerns with this pregnancy.'),
        (16, 'medical_concerns', FALSE, 'No, I don''t know of any medical concerns with this pregnancy.'),

        (17, 'have_you_had_primary_health_care', TRUE, 'Yes, I have received health care for this pregnancy.'),
        (18, 'have_you_had_primary_health_care', FALSE, 'No, I haven''t received any health care yet for this pregnancy.'),

        (19, 'family_physician', TRUE, 'Yes, I have a family physician.'),
        (20, 'family_physician', FALSE, 'No, I don''t have a family physician at this time.'),

        (21, 'major_medical_conditions', TRUE, 'Yes, I have some medical conditions.'),
        (22, 'major_medical_conditions', FALSE, 'No, I don''t have any medical conditions.');


/**************************************************************/
/*************** midwifery_community_locations ****************/
/**************************************************************/
INSERT INTO bizont_edms_midwifery.midwifery_community_locations(
id, description)
VALUES  (1, 'Beaver Creek'),
        (2, 'Burwash Landing'),
        (3, 'Carcross'),
        (4, 'Carmacks'),
        (5, 'Dawson City'),
        (6, 'Destruction Bay'),
        (7, 'Faro'),
        (8, 'Haines Junction'),
        (9, 'Ibex Valley'),
        (10, 'Marsh Lake'),
        (11, 'Mayo'),
        (12, 'Mount Lorne'),
        (13, 'Old Crow'),
        (14, 'Pelly Crossing'),
        (15, 'Ross River'),
        (16, 'Tagish'),
        (17, 'Teslin'),
        (18, 'Watson Lake'),
        (19, 'Whitehorse');


/**************************************************************/
/****************** midwifery_birth_locations *****************/
/**************************************************************/
INSERT INTO bizont_edms_midwifery.midwifery_birth_locations(
id, name, description)
VALUES  (1, 'home', 'I would prefer to give birth at home.'),
        (2, 'hospital', 'I would prefer to give birth at a hospital.'),
        (3, 'undecided', 'I am undecided at the moment.');


/**************************************************************/
/****************** midwifery_groups_communities **************/
/**************************************************************/
INSERT INTO bizont_edms_midwifery.midwifery_groups_communities(
id, name, description)
VALUES  (1, 'YFN', 'Yukon First Nations'),
        (2, 'FN', 'Non-Yukon First Nations, Metis or Inuit'),
        (3, 'New', 'Newcomer to Canada'),
        (4, 'LGBTQ', 'LGBTQ2S+'),
        (5, 'Race', 'Racialized person or person of colour'),
        (6, 'mental_wellness', 'Person with mental wellness or substance use concerns'),
        (7, 'disability', 'Person with a disability'),
        (8, 'single', 'Person who is or will be a single parent'),
        (9, 'not_say', 'I prefer not to specify at this time'),
        (10, 'not_identify', 'I do not identify with any of these groups');


/**************************************************************/
/*************** midwifery_clinic_contact_types ***************/
/**************************************************************/
INSERT INTO bizont_edms_midwifery.midwifery_clinic_contact_types(
id, name, description)
VALUES  (1, 'Website', 'Yukon.ca'),
        (2, 'other_health', 'Another health or social care provider'),
        (3, 'friend', 'Friend or family member'),
        (4, 'poster', 'Poster or pamphlet'),
        (5, 'social', 'Social media');


/**************************************************************/
/********************* midwifery_languages ********************/
/**************************************************************/
INSERT INTO bizont_edms_midwifery.midwifery_languages(
id, description)
VALUES  (1, 'english'),
        (2, 'french');


/**************************************************************/
/************** midwifery_preferred_contact_types *************/
/**************************************************************/
INSERT INTO bizont_edms_midwifery.midwifery_preferred_contact_types(
id, name, description)
VALUES  (1, 'email', 'Email communication is preferred'),
        (2, 'phone', 'Phone communication is preferred'),
        (3, 'friend', 'Friend or family member'),
        (4, 'poster', 'Poster or pamphlet'),
        (5, 'social', 'Social media');