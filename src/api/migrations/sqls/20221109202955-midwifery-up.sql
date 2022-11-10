/* Replace with your SQL commands */

/**************************************************************/
/*************** midwifery_services *************************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.midwifery_services
(
    id bigint NOT NULL,
    confirmation_number character varying(10) COLLATE pg_catalog."default",
    status character varying(100) COLLATE pg_catalog."default",
    first_name character varying(255) COLLATE pg_catalog."default",
    last_name character varying(255) COLLATE pg_catalog."default",
    preferred_name character varying(255) COLLATE pg_catalog."default",
    pronouns character varying(255) COLLATE pg_catalog."default",
    date_of_birth DATE COLLATE pg_catalog."default",
    yukon_health_insurance int COLLATE pg_catalog."default",
    community_located character varying(100) COLLATE pg_catalog."default",
    preferred_language character varying(100) COLLATE pg_catalog."default",
    need_interpretation int COLLATE pg_catalog."default",
    preferred_phone character varying(255) COLLATE pg_catalog."default",
    preferred_email character varying(255) COLLATE pg_catalog."default",
    okay_to_leave_message int COLLATE pg_catalog."default",
    prefer_to_be_contacted int COLLATE pg_catalog."default",
    when_was_the_first_day_of_your_last_period_ DATE COLLATE pg_catalog."default",
    due_date DATE COLLATE pg_catalog."default",
    date_confirmed int COLLATE pg_catalog."default",
    first_pregnancy int COLLATE pg_catalog."default",
    how_many_vaginal_births character varying(255) COLLATE pg_catalog."default",
    how_many_c_section_births character varying(255) COLLATE pg_catalog."default",
    complications_with_previous int COLLATE pg_catalog."default",
    provide_details text COLLATE pg_catalog."default",
    midwife_before int COLLATE pg_catalog."default",
    where_to_give_birth int COLLATE pg_catalog."default",
    medical_concerns int COLLATE pg_catalog."default",
    provide_details2 text COLLATE pg_catalog."default",
    have_you_had_primary_health_care int COLLATE pg_catalog."default",
    menstrual_cycle_length character varying(255) COLLATE pg_catalog."default",
    family_physician int COLLATE pg_catalog."default",
    physician_s_name character varying(255) COLLATE pg_catalog."default",
    major_medical_conditions int COLLATE pg_catalog."default",
    provide_details3 text COLLATE pg_catalog."default",
    do_you_identify_with_one_or_more_of_these_groups_and_communities character varying(100) COLLATE pg_catalog."default",
    how_did_you_find_out_about_the_midwifery_clinic_select_all_that_ character varying(100) COLLATE pg_catalog."default",

    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT midwifery_services_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.midwifery_services
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.midwifery_services_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.midwifery_services_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY midwifery_services.id;

ALTER SEQUENCE public.midwifery_services_id_seq
    OWNER TO postgres;


/**************************************************************/
/******************* midwifery_options ************************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.midwifery_options
(
    id bigint NOT NULL,
    field_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    field_value bool COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT midwifery_options_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.midwifery_options
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.midwifery_options_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.midwifery_options_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY midwifery_options.id;

ALTER SEQUENCE public.midwifery_options_id_seq
    OWNER TO postgres;

/**************************************************************/
/*************** midwifery_community_locations ****************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.midwifery_community_locations
(
    id bigint NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT midwifery_community_locations_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.midwifery_community_locations
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.midwifery_community_locations_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.midwifery_community_locations_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY midwifery_community_locations.id;

ALTER SEQUENCE public.midwifery_community_locations_id_seq
    OWNER TO postgres;

/**************************************************************/
/****************** midwifery_birth_locations *****************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.midwifery_birth_locations
(
    id bigint NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT midwifery_birth_locations_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.midwifery_birth_locations
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.midwifery_birth_locations_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.midwifery_birth_locations_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY midwifery_birth_locations.id;

ALTER SEQUENCE public.midwifery_birth_locations_id_seq
    OWNER TO postgres;

/**************************************************************/
/****************** midwifery_groups_communities **************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.midwifery_groups_communities
(
    id bigint NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT midwifery_groups_communities_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.midwifery_groups_communities
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.midwifery_groups_communities_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.midwifery_groups_communities_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY midwifery_groups_communities.id;

ALTER SEQUENCE public.midwifery_groups_communities_id_seq
    OWNER TO postgres;

/**************************************************************/
/*************** midwifery_clinic_contact_types ***************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.midwifery_clinic_contact_types
(
    id bigint NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT midwifery_clinic_contact_types_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.midwifery_clinic_contact_types
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.midwifery_clinic_contact_types_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.midwifery_clinic_contact_types_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY midwifery_clinic_contact_types.id;

ALTER SEQUENCE public.midwifery_clinic_contact_types_id_seq
    OWNER TO postgres;

/**************************************************************/
/********************* midwifery_languages ********************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.midwifery_languages
(
    id bigint NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT midwifery_languages_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.midwifery_languages
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.midwifery_languages_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.midwifery_languages_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY midwifery_languages.id;

ALTER SEQUENCE public.midwifery_languages_id_seq
    OWNER TO postgres;

/**************************************************************/
/************** midwifery_preferred_contact_types *************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.midwifery_preferred_contact_types
(
    id bigint NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT midwifery_preferred_contact_types_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.midwifery_preferred_contact_types
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.midwifery_preferred_contact_types_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.midwifery_preferred_contact_types_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY midwifery_preferred_contact_types.id;

ALTER SEQUENCE public.midwifery_preferred_contact_types_id_seq
    OWNER TO postgres;