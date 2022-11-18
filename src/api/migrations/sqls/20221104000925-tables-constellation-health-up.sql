/* Replace with your SQL commands */

/**************************************************************/
/*************** constellation_health *************************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.constellation_health
(
    id bigint NOT NULL,
    status character varying(100) COLLATE pg_catalog."default",
    first_name character varying(255) COLLATE pg_catalog."default",
    last_name character varying(255) COLLATE pg_catalog."default",
    is_this_your_legal_name_ character varying(255) COLLATE pg_catalog."default",
    your_legal_name character varying(255) COLLATE pg_catalog."default",
    pronouns character varying(100) COLLATE pg_catalog."default",
    date_of_birth DATE COLLATE pg_catalog."default",
    have_yhcip character varying(255) COLLATE pg_catalog."default",
    health_care_card character varying(25) COLLATE pg_catalog."default",
    province character varying(255) COLLATE pg_catalog."default",
    yhcip character varying(25) COLLATE pg_catalog."default",
    postal_code character varying(25) COLLATE pg_catalog."default",
    prefer_to_be_contacted character varying(255) COLLATE pg_catalog."default",
    phone_number character varying(255) COLLATE pg_catalog."default",
    email_address character varying(255) COLLATE pg_catalog."default",
    leave_phone_message character varying(255) COLLATE pg_catalog."default",
    language_prefer_to_receive_services int COLLATE pg_catalog."default",
    preferred_language character varying(100) COLLATE pg_catalog."default",
    interpretation_support character varying(255) COLLATE pg_catalog."default",
    family_physician character varying(255) COLLATE pg_catalog."default",
    current_family_physician character varying(255) COLLATE pg_catalog."default",
    accessing_health_care character varying(255) COLLATE pg_catalog."default",
    /*diagnosis character varying(100) COLLATE pg_catalog."default",*/
    diagnosis TEXT [] COLLATE pg_catalog."default",
    demographics_groups character varying(100) COLLATE pg_catalog."default",
    include_family_members character varying(255) COLLATE pg_catalog."default",

    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT constellation_health_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.constellation_health
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.constellation_health_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.constellation_health_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY constellation_health.id;

ALTER SEQUENCE public.constellation_health_id_seq
    OWNER TO postgres;

/**************************************************************/
/********** constellation_health_family_members ***************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.constellation_health_family_members
(
    id bigint NOT NULL,
    constellation_health_id int COLLATE pg_catalog."default",

    first_name_family_member character varying(255) COLLATE pg_catalog."default" NULL,
    last_name_family_member character varying(255) COLLATE pg_catalog."default",
    is_this_your_legal_name__family_member character varying(255) COLLATE pg_catalog."default",
    your_legal_name_family_member character varying(255) COLLATE pg_catalog."default",
    pronouns_family_member character varying(100) COLLATE pg_catalog."default",
    date_of_birth_family_member DATE COLLATE pg_catalog."default",
    have_yhcip_family_member character varying(255) COLLATE pg_catalog."default",
    health_care_card_family_member character varying(25) COLLATE pg_catalog."default",
    province_family_member character varying(255) COLLATE pg_catalog."default",
    yhcip_family_member character varying(25) COLLATE pg_catalog."default",
    relationship_family_member character varying(255) COLLATE pg_catalog."default",

    language_prefer_to_receive_services_family_member int COLLATE pg_catalog."default",
    preferred_language_family_member character varying(100) COLLATE pg_catalog."default",
    interpretation_support_family_member character varying(255) COLLATE pg_catalog."default",
    family_physician_family_member character varying(255) COLLATE pg_catalog."default",
    current_family_physician_family_member character varying(255) COLLATE pg_catalog."default",
    accessing_health_care_family_member character varying(255) COLLATE pg_catalog."default",
    /*diagnosis_family_member character varying(100) COLLATE pg_catalog."default",*/
    diagnosis_family_member TEXT [] COLLATE pg_catalog."default",
    demographics_groups_family_member character varying(100) COLLATE pg_catalog."default",

    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT constellation_health_family_members_id PRIMARY KEY (id),
    CONSTRAINT constellation_health_id_fk FOREIGN KEY(constellation_health_id) REFERENCES constellation_health(id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.constellation_health_family_members
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.constellation_health_family_members_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.constellation_health_family_members_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY constellation_health_family_members.id;

ALTER SEQUENCE public.constellation_health_family_members_id_seq
    OWNER TO postgres;

/**************************************************************/
/********** constellation_health_language *********************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.constellation_health_language
(
    id bigint NOT NULL,
    value character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT language_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.constellation_health_language
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.constellation_health_language_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.constellation_health_language_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY constellation_health_language.id;

ALTER SEQUENCE public.constellation_health_language_id_seq
    OWNER TO postgres;

/**************************************************************/
/******* constellation_health_diagnosis_history ***************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.constellation_health_diagnosis_history
(
    id bigint NOT NULL,
    value character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT language_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.constellation_health_diagnosis_history
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.constellation_health_diagnosis_history_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.constellation_health_diagnosis_history_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY constellation_health_diagnosis_history.id;

ALTER SEQUENCE public.constellation_health_diagnosis_history_id_seq
    OWNER TO postgres;

/**************************************************************/
/********** constellation_health_demographics *****************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.constellation_health_demographics
(
    id bigint NOT NULL,
    value character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT language_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.constellation_health_demographics
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.constellation_health_demographics_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.constellation_health_demographics_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY constellation_health_demographics.id;

ALTER SEQUENCE public.constellation_health_demographics_id_seq
    OWNER TO postgres;