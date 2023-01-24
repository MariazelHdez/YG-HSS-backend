/* Replace with your SQL commands */

/**************************************************************/
/***************** health_information *************************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_hipma.health_information
(
    id SERIAL PRIMARY KEY,
    confirmation_number character varying(10),
    status character varying(25) DEFAULT 'open',
    what_type_of_request_do_you_want_to_make_ int,
    are_you_requesting_access_to_your_own_personal_health_informatio int,
    select_the_situation_that_applies_ int,
    first_name_behalf character varying(255),
    last_name_behalf character varying(255),
    company_or_organization_optional_behalf character varying(255),
    address_behalf character varying(255),
    city_or_town_behalf character varying(255),
    postal_code_behalf character varying(50),
    email_address_behalf character varying(255),
    phone_number_behalf character varying(100),
    first_name character varying(100),
    last_name character varying(100),
    date_of_birth DATE,
    address character varying(255),
    city_or_town character varying(100),
    postal_code character varying(50),
    email_address character varying(255),
    phone_number character varying(25),
    get_a_copy_of_your_health_information_ int,
    get_a_copy_of_your_activity_request int,
    name_of_health_and_social_services_program_area_optional_ TEXT [],
    indicate_the_hss_system_s_you_would_like_a_record_of_user_activ TEXT [],
    provide_details_about_your_request_ text,
    date_from_ DATE,
    date_to_ DATE,
    date_range_is_unknown_or_i_need_help_identifying_the_date_range bool NOT NULL,
    i_affirm_the_information_above_to_be_true_and_accurate_ character varying(50),
    issued_identification character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_hipma.health_information
    OWNER to postgres;

CREATE INDEX health_information_status_idx ON bizont_edms_hipma.health_information (status);
CREATE INDEX health_information_creation_date_idx ON bizont_edms_hipma.health_information (created_at);
CREATE INDEX health_information_name_idx ON bizont_edms_hipma.health_information (first_name, last_name);


/**************************************************************/
/********************** hipma_files ***************************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_hipma.hipma_files
(
    id SERIAL PRIMARY KEY,
    hipma_id int,
    description character varying(255) NOT NULL,
    file_name character varying(500) NOT NULL,
    file_type character varying(500) NOT NULL,
    file_size character varying(500) NOT NULL,
    file_data TEXT NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hipma_id_fk FOREIGN KEY(hipma_id) REFERENCES bizont_edms_hipma.health_information(id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_hipma.hipma_files
    OWNER to postgres;

CREATE INDEX hipma_id_idx ON bizont_edms_hipma.hipma_files (hipma_id);


/**************************************************************/
/**** hipma_request_access_personal_health_information ********/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_hipma.hipma_request_access_personal_health_information
(
    id SERIAL PRIMARY KEY,
    description character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_hipma.hipma_request_access_personal_health_information
    OWNER to postgres;

/**************************************************************/
/**************** hipma_situations ****************************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_hipma.hipma_situations
(
    id SERIAL PRIMARY KEY,
    description character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_hipma.hipma_situations
    OWNER to postgres;

/**************************************************************/
/************ hipma_copy_health_information *******************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_hipma.hipma_copy_health_information
(
    id SERIAL PRIMARY KEY,
    description character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_hipma.hipma_copy_health_information
    OWNER to postgres;

/**************************************************************/
/************** hipma_copy_activity_request *******************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_hipma.hipma_copy_activity_request
(
    id SERIAL PRIMARY KEY,
    description character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_hipma.hipma_copy_activity_request
    OWNER to postgres;

/**************************************************************/
/********* hipma_health_social_services_program ***************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_hipma.hipma_health_social_services_program
(
    id SERIAL PRIMARY KEY,
    description character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_hipma.hipma_health_social_services_program
    OWNER to postgres;


/**************************************************************/
/******************** hipma_hss_systems ***********************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_hipma.hipma_hss_systems
(
    id SERIAL PRIMARY KEY,
    description character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_hipma.hipma_hss_systems
    OWNER to postgres;


/**************************************************************/
/******************** hipma_request_type **********************/
/**************************************************************/

CREATE TABLE IF NOT EXISTS bizont_edms_hipma.hipma_request_type
(
    id SERIAL PRIMARY KEY,
    description character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS bizont_edms_hipma.hipma_request_type
    OWNER to postgres;


/**************************************************************/
/**** hipma_request_access_personal_health_information ********/
/**************************************************************/
INSERT INTO bizont_edms_hipma.hipma_request_access_personal_health_information(
id, description)
VALUES
(1, 'I''m requesting access to my personal health information.'),
(2, 'I''m requesting access on behalf of another individual.');


/**************************************************************/
/**************** hipma_situations ****************************/
/**************************************************************/
INSERT INTO bizont_edms_hipma.hipma_situations(
id, description)
VALUES  (1, 'Parent/guardian requesting records on behalf of their child.'),
        (2, 'Personal representative requesting records of a deceased individual.'),
        (3, 'Substitute decision maker request.'),
        (4, 'Request on behalf of another individual.');


/**************************************************************/
/************ hipma_copy_health_information *******************/
/**************************************************************/
INSERT INTO bizont_edms_hipma.hipma_copy_health_information(
id, description)
VALUES  (1, 'Send me a copy by email'),
        (2, 'Mail me a copy'),
        (3, 'I would like to view the original records in person');


/**************************************************************/
/************** hipma_copy_activity_request *******************/
/**************************************************************/
INSERT INTO bizont_edms_hipma.hipma_copy_activity_request(
id, description)
VALUES  (1, 'Send me a copy by email'),
        (2, 'Mail me a copy');


/**************************************************************/
/********* hipma_health_social_services_program ***************/
/**************************************************************/
INSERT INTO bizont_edms_hipma.hipma_health_social_services_program(
id, description)
VALUES  (1, 'Community Nursing (includes records held at all community health centres)'),
        (2, 'Family and Children''s Services (records pertaining to children in care, child abuse investigations etc.)'),
        (3, 'Mental Wellness and Substance Use (records held at the Referred Care Clinic, mental health support services, etc.)'),
        (4, 'Program area is unknown or not listed'),
        (5, 'Continuing care (Whistlebend Place, Copper Ridge Place, Thompson Centre, home care)');


/**************************************************************/
/******************** hipma_hss_systems ***********************/
/**************************************************************/
INSERT INTO bizont_edms_hipma.hipma_hss_systems(
id, description)
VALUES  (1, 'Panorama (immunization records)'),
        (2, 'Chronic Disease Management Toolkit (CDM)'),
        (3, 'Client Registry (e.g. name, address, phone number)'),
        (4, 'Drug Information system (prescriptions)'),
        (5, 'Lab Information System (lab tests)'),
        (6, 'HSS system is unknown');

/**************************************************************/
/******************** hipma_request_type **********************/
/**************************************************************/
INSERT INTO bizont_edms_hipma.hipma_request_type(id, description)
VALUES  (1, 'A request for your personal health information.'),
        (2, 'A request for a record of user activity.');