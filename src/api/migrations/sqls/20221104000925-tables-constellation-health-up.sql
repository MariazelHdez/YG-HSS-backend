/* Replace with your SQL commands */

/**************************************************************/
/*************** constellation_health *************************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_constellation_health.constellation_health
(
    id bigint NOT NULL,
    status character varying(100),
    first_name character varying(255),
    last_name character varying(255),
    is_this_your_legal_name_ character varying(255),
    your_legal_name character varying(255),
    pronouns character varying(100),
    date_of_birth DATE,
    have_yhcip character varying(255),
    health_care_card character varying(25),
    province character varying(255),
    yhcip character varying(25),
    postal_code character varying(25),
    prefer_to_be_contacted character varying(255),
    phone_number character varying(255),
    email_address character varying(255),
    leave_phone_message character varying(255),
    language_prefer_to_receive_services int,
    preferred_language character varying(100),
    interpretation_support character varying(255),
    family_physician character varying(255),
    current_family_physician character varying(255),
    accessing_health_care character varying(255),
    /*diagnosis character varying(100),*/
    diagnosis TEXT [],
    demographics_groups character varying(100),
    include_family_members character varying(255),

    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT constellation_health_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_constellation_health.constellation_health
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS bizont_edms_constellation_health.constellation_health_id_seq;

CREATE SEQUENCE IF NOT EXISTS bizont_edms_constellation_health.constellation_health_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY constellation_health.id;

ALTER SEQUENCE bizont_edms_constellation_health.constellation_health_id_seq
    OWNER TO postgres;

/**************************************************************/
/********** constellation_health_family_members ***************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_constellation_health.constellation_health_family_members
(
    id bigint NOT NULL,
    constellation_health_id int,

    first_name_family_member character varying(255) NULL,
    last_name_family_member character varying(255),
    is_this_your_legal_name__family_member character varying(255),
    your_legal_name_family_member character varying(255),
    pronouns_family_member character varying(100),
    date_of_birth_family_member DATE,
    have_yhcip_family_member character varying(255),
    health_care_card_family_member character varying(25),
    province_family_member character varying(255),
    yhcip_family_member character varying(25),
    relationship_family_member character varying(255),

    language_prefer_to_receive_services_family_member int,
    preferred_language_family_member character varying(100),
    interpretation_support_family_member character varying(255),
    family_physician_family_member character varying(255),
    current_family_physician_family_member character varying(255),
    accessing_health_care_family_member character varying(255),
    /*diagnosis_family_member character varying(100),*/
    diagnosis_family_member TEXT [],
    demographics_groups_family_member character varying(100),

    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT constellation_health_family_members_id PRIMARY KEY (id),
    CONSTRAINT constellation_health_id_fk FOREIGN KEY(constellation_health_id) REFERENCES constellation_health(id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_constellation_health.constellation_health_family_members
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS bizont_edms_constellation_health.constellation_health_family_members_id_seq;

CREATE SEQUENCE IF NOT EXISTS bizont_edms_constellation_health.constellation_health_family_members_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY constellation_health_family_members.id;

ALTER SEQUENCE bizont_edms_constellation_health.constellation_health_family_members_id_seq
    OWNER TO postgres;

/**************************************************************/
/********** constellation_health_language *********************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_constellation_health.constellation_health_language
(
    id bigint NOT NULL,
    value character varying(100) NOT NULL,
    description character varying(500) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT language_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_constellation_health.constellation_health_language
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS bizont_edms_constellation_health.constellation_health_language_id_seq;

CREATE SEQUENCE IF NOT EXISTS bizont_edms_constellation_health.constellation_health_language_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY constellation_health_language.id;

ALTER SEQUENCE bizont_edms_constellation_health.constellation_health_language_id_seq
    OWNER TO postgres;

/**************************************************************/
/******* constellation_health_diagnosis_history ***************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_constellation_health.constellation_health_diagnosis_history
(
    id bigint NOT NULL,
    value character varying(100) NOT NULL,
    description character varying(500) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT diagnosis_history_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_constellation_health.constellation_health_diagnosis_history
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS bizont_edms_constellation_health.constellation_health_diagnosis_history_id_seq;

CREATE SEQUENCE IF NOT EXISTS bizont_edms_constellation_health.constellation_health_diagnosis_history_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY constellation_health_diagnosis_history.id;

ALTER SEQUENCE bizont_edms_constellation_health.constellation_health_diagnosis_history_id_seq
    OWNER TO postgres;

/**************************************************************/
/********** constellation_health_demographics *****************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_constellation_health.constellation_health_demographics
(
    id bigint NOT NULL,
    value character varying(100) NOT NULL,
    description character varying(500) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT demographics_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_constellation_health.constellation_health_demographics
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS bizont_edms_constellation_health.constellation_health_demographics_id_seq;

CREATE SEQUENCE IF NOT EXISTS bizont_edms_constellation_health.constellation_health_demographics_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY constellation_health_demographics.id;

ALTER SEQUENCE bizont_edms_constellation_health.constellation_health_demographics_id_seq
    OWNER TO postgres;


/**************************************************************/
/********** constellation_health_language *********************/
/**************************************************************/

INSERT INTO bizont_edms_constellation_health.constellation_health_language(
id, value, description)
VALUES (1, 'english', 'I prefer to receive services in English'),
        (2, 'french', 'I prefer to receive services in French'),
        (3, 'other_language', 'I prefer to receive services in another language'),
        (4, 'they_english', 'They prefer to receive services in English'),
        (5, 'they_french', 'They prefer to receive services in French'),
        (6, 'they_other_language', 'They prefer to receive services in another language');

/**************************************************************/
/******* constellation_health_diagnosis_history ***************/
/**************************************************************/

INSERT INTO bizont_edms_constellation_health.constellation_health_diagnosis_history(id, value, description)
VALUES  (1, 'cancer', 'I have been diagnosed with cancer'),
        (2, 'palliative_diagnosis', 'I have a palliative care diagnosis'),
        (3, 'chronic_condition', 'I have been diagnosed with a chronic health condition (for example: COPD, diabetes, heart disease)'),
        (4, 'disability_limits_daily_act', 'I have a disability that limits my daily activities'),
        (5, 'mental_diagnosis', 'I have a mental health diagnosis or problem that impacts my daily activities'),
        (6, 'covid_complications', 'I have been diagnosed with long-term COVID-19 complications'),
        (7, 'alcohol_substance_misuse', 'I use or have a history of alcohol or substance misuse'),
        (8, 'they_cancer', 'They have been diagnosed with cancer'),
        (9, 'they_palliative_diagnosis', 'They have a palliative care diagnosis'),
        (10, 'they_chronic_condition', 'They have been diagnosed with a chronic health condition (for example: COPD, diabetes, heart disease)'),
        (11, 'they_disability_limits_daily_act', 'They have a disability that limits their daily activities'),
        (12, 'they_mental_diagnosis', 'They have a mental health diagnosis or problem that impacts their daily activities'),
        (13, 'they_covid_complications', 'They have been diagnosed with long-term COVID-19 complications'),
        (14, 'they_alcohol_substance_misuse', 'They use or have a history of alcohol or substance misuse'),
        (15, 'none', 'None of the above');

/**************************************************************/
/********** constellation_health_demographics *****************/
/**************************************************************/

INSERT INTO bizont_edms_constellation_health.constellation_health_demographics(
id, value, description)
VALUES (1, 'yukonFN', 'Yukon First Nation'),
        (2, 'non-yukonFN', 'Non-Yukon First Nation, Metis, or Inuit'),
        (3, 'none', 'None of the above'),
        (4, 'not-say', 'Prefer not to say'),
        (5, 'they_yukonFN', 'Yukon First Nation'),
        (6, 'they_non-yukonFN', 'Non-Yukon First Nation, Metis, or Inuit');