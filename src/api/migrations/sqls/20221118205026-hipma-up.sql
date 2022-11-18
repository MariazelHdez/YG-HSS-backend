/* Replace with your SQL commands */

/**************************************************************/
/***************** health_information *************************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.health_information
(
    id bigint NOT NULL,
    confirmation_number character varying(10) COLLATE pg_catalog."default",
    status character varying(100) COLLATE pg_catalog."default",

    what_type_of_request_do_you_want_to_make_ int COLLATE pg_catalog."default",
    are_you_requesting_access_to_your_own_personal_health_informatio int COLLATE pg_catalog."default",
    select_the_situation_that_applies_ int COLLATE pg_catalog."default",
    first_name_behalf character varying(255) COLLATE pg_catalog."default",
    last_name_behalf character varying(255) COLLATE pg_catalog."default",
    company_or_organization_optional_behalf character varying(255) COLLATE pg_catalog."default",
    address_behalf character varying(255) COLLATE pg_catalog."default",
    city_or_town_behalf character varying(255) COLLATE pg_catalog."default",
    postal_code_behalf character varying(50) COLLATE pg_catalog."default",
    email_address_behalf character varying(255) COLLATE pg_catalog."default",
    phone_number_behalf character varying(100) COLLATE pg_catalog."default",
    first_name character varying(100) COLLATE pg_catalog."default",
    last_name character varying(100) COLLATE pg_catalog."default",
    date_of_birth DATE COLLATE pg_catalog."default",
    address character varying(255) COLLATE pg_catalog."default",
    city_or_town character varying(100) COLLATE pg_catalog."default",
    postal_code character varying(50) COLLATE pg_catalog."default",
    email_address character varying(255) COLLATE pg_catalog."default",
    phone_number character varying(25) COLLATE pg_catalog."default",
    get_a_copy_of_your_health_information_ TEXT [] COLLATE pg_catalog."default",
    get_a_copy_of_your_activity_request TEXT [] COLLATE pg_catalog."default",
    name_of_health_and_social_services_program_area_optional_ character varying(255) COLLATE pg_catalog."default",
    indicate_the_hss_system_s_you_would_like_a_record_of_user_activi character varying(255) COLLATE pg_catalog."default",
    provide_details_about_your_request_ text COLLATE pg_catalog."default",
    date_from_ DATE COLLATE pg_catalog."default",
    date_to_ DATE COLLATE pg_catalog."default",
    date_range_is_unknown_or_i_need_help_identifying_the_date_range bool COLLATE pg_catalog."default" NOT NULL,
    i_affirm_the_information_above_to_be_true_and_accurate_ character varying(50) COLLATE pg_catalog."default",
    issued_identification character varying(255) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT midwifery_services_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.health_information
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.health_information_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.health_information_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY health_information.id;

ALTER SEQUENCE public.health_information_id_seq
    OWNER TO postgres;


/**************************************************************/
/********************** hipma_files ***************************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.hipma_files
(
    id bigint NOT NULL,
    hipma_id int COLLATE pg_catalog."default",
    description character varying(255) COLLATE pg_catalog."default" NOT NULL,
    file_name character varying(500) COLLATE pg_catalog."default" NOT NULL,
    file_type character varying(500) COLLATE pg_catalog."default" NOT NULL,
    file_size character varying(500) COLLATE pg_catalog."default" NOT NULL,
    file_data TEXT COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hipma_files_id PRIMARY KEY (id)
    CONSTRAINT hipma_id_fk FOREIGN KEY(hipma_id) REFERENCES health_information(id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.hipma_files
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.hipma_files_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.hipma_files_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY hipma_files.id;

ALTER SEQUENCE public.hipma_files_id_seq
    OWNER TO postgres;

/**************************************************************/
/**** hipma_request_access_personal_health_information ********/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.hipma_request_access_personal_health_information
(
    id bigint NOT NULL,
    description character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hipma_request_access_personal_health_information_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.hipma_request_access_personal_health_information
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.hipma_request_access_personal_health_information_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.hipma_request_access_personal_health_information_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY hipma_request_access_personal_health_information.id;

ALTER SEQUENCE public.hipma_request_access_personal_health_information_id_seq
    OWNER TO postgres;

/**************************************************************/
/**************** hipma_situations ****************************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.hipma_situations
(
    id bigint NOT NULL,
    description character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hipma_situations_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.hipma_situations
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.hipma_situations_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.hipma_situations_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY hipma_situations.id;

ALTER SEQUENCE public.hipma_situations_id_seq
    OWNER TO postgres;

/**************************************************************/
/************ hipma_copy_health_information *******************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.hipma_copy_health_information
(
    id bigint NOT NULL,
    description character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hipma_copy_health_information_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.hipma_copy_health_information
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.hipma_copy_health_information_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.hipma_copy_health_information_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY hipma_copy_health_information.id;

ALTER SEQUENCE public.hipma_copy_health_information_id_seq
    OWNER TO postgres;

/**************************************************************/
/************** hipma_copy_activity_request *******************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.hipma_copy_activity_request
(
    id bigint NOT NULL,
    description character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hipma_copy_activity_request_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.hipma_copy_activity_request
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.hipma_copy_activity_request_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.hipma_copy_activity_request_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY hipma_copy_activity_request.id;

ALTER SEQUENCE public.hipma_copy_activity_request_id_seq
    OWNER TO postgres;

/**************************************************************/
/********* hipma_health_social_services_program ***************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.hipma_health_social_services_program
(
    id bigint NOT NULL,
    description character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hipma_health_social_services_program_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.hipma_health_social_services_program
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.hipma_health_social_services_program_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.hipma_health_social_services_program_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY hipma_health_social_services_program.id;

ALTER SEQUENCE public.hipma_health_social_services_program_id_seq
    OWNER TO postgres;


/**************************************************************/
/******************** hipma_hss_systems ***********************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS public.hipma_hss_systems
(
    id bigint NOT NULL,
    description character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hipma_hss_systems_id PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.hipma_hss_systems
    OWNER to postgres;

-- DROP SEQUENCE IF EXISTS public.hipma_hss_systems_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.hipma_hss_systems_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    OWNED BY hipma_hss_systems.id;

ALTER SEQUENCE public.hipma_hss_systems_id_seq
    OWNER TO postgres;