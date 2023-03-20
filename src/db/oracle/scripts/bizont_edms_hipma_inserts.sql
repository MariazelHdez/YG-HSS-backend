hipma health information
INSERT INTO bizont_edms_hipma.health_information VALUES (1, '5F2B4B7C2', 1, 2, 2, 4, 'Paul', 'Lennon', 'Oratione', '11 Brook Alley Road. APT 1', 'Springfield', '12345', '10mainstreet@jh.klk', '(098) 765-4321', 'Paul', 'McCartney', TO_DATE('2012-09-06', 'yyyy-mm-dd'), '11 Brook Alley Road. APT 1', 'Springfield', '11111', '10mainstreet@jkjn.kjn', '(123) 456-7890', NULL, 2, NULL, utl_raw.cast_to_raw('{ data: [3] }'), '', NULL, NULL, 1, '1', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.health_information VALUES (2, '5F2B4BDA9', 1, 1, 1, NULL, '', '', '', '', '', '', '', '', 'Ringo', 'McCartney', TO_DATE('2017-10-06', 'yyyy-mm-dd'), '11 Brook Alley Road. APT 1', 'Springfield', '11111', '10mainstreet@hjhj.jknkjn', '(123) 456-7890', 3, NULL, utl_raw.cast_to_raw('{ data: [1] }'), NULL, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Negat esse eam, inquit, propter se expetendam. Primum Theophrasti, Strato, physicum se voluit; Id mihi magnum videtur. Itaque mihi non satis videmini considerare quod iter sit naturae quaeque progressio. Quare hoc videndum est, possitne nobis hoc ratio philosophorum dare. Est enim tanti philosophi tamque nobilis audacter sua decreta defendere.', TO_DATE('2022-03-02', 'yyyy-mm-dd'), TO_DATE('2022-08-02', 'yyyy-mm-dd'), 1, '1', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.health_information VALUES (3, '5F2B4C2FF', 1, 1, 2, 4, 'George', 'McCartney', 'Loremipsum', '10 Main Street', 'Pleasantville', '11111', '10mainstreet@jjh.jkn', '(098) 765-4321', 'Ringo', 'Harrison', TO_DATE('2010-10-06', 'yyyy-mm-dd'), '10 Main Street', 'Springfield', '12345', '11brookalleyroad.apt1j@jkn.jkn', '(098) 765-4321', 3, NULL, utl_raw.cast_to_raw('{ data: [5] }'), NULL, 'Huius, Lyco, oratione locuples, rebus ipsis ielunior. Duo Reges: constructio interrete. Sed haec in pueris; Sed utrum hortandus es nobis, Luci, inquit, an etiam tua sponte propensus es? Sapiens autem semper beatus est et est aliquando in dolore; Immo videri fortasse. Paulum, cum regem Persem captum adduceret, eodem flumine invectio? Et ille ridens: Video, inquit, quid agas;', NULL, NULL, 1, '1', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.health_information VALUES (4, '5F2B4BDA9', 1, 1, 1, NULL, '', '', '', '', '', '', '', '', 'Ringo', 'McCartney', TO_DATE('2017-10-06', 'yyyy-mm-dd'), '11 Brook Alley Road. APT 1', 'Springfield', '11111', '10mainstreet@hjhj.jknkjn', '(123) 456-7890', 3, NULL, utl_raw.cast_to_raw('{ data: [1] }'), utl_raw.cast_to_raw('{ data: ["NULL"] }'), 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Negat esse eam, inquit, propter se expetendam. Primum Theophrasti, Strato, physicum se voluit; Id mihi magnum videtur. Itaque mihi non satis videmini considerare quod iter sit naturae quaeque progressio. Quare hoc videndum est, possitne nobis hoc ratio philosophorum dare. Est enim tanti philosophi tamque nobilis audacter sua decreta defendere.', TO_DATE('2022-03-02', 'yyyy-mm-dd'), TO_DATE('2022-08-02', 'yyyy-mm-dd'), 1, '1', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.health_information VALUES (5, '5F2B4C2FF', 1, 1, 2, 4, 'George', 'McCartney', 'Loremipsum', '10 Main Street', 'Pleasantville', '11111', '10mainstreet@jjh.jkn', '(098) 765-4321', 'Ringo', 'Harrison', TO_DATE('2010-10-06', 'yyyy-mm-dd'), '10 Main Street', 'Springfield', '12345', '11brookalleyroad.apt1j@jkn.jkn', '(098) 765-4321', 3, NULL, utl_raw.cast_to_raw('{ data: [5] }'), utl_raw.cast_to_raw('{ data: ["NULL"] }'), 'Huius, Lyco, oratione locuples, rebus ipsis ielunior. Duo Reges: constructio interrete. Sed haec in pueris; Sed utrum hortandus es nobis, Luci, inquit, an etiam tua sponte propensus es? Sapiens autem semper beatus est et est aliquando in dolore; Immo videri fortasse. Paulum, cum regem Persem captum adduceret, eodem flumine invectio? Et ille ridens: Video, inquit, quid agas;', NULL, NULL, 1, '1', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

hipma hipma_copy_activity_request
INSERT INTO bizont_edms_hipma.hipma_copy_activity_request VALUES (1, 'Send me a copy by email', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_copy_activity_request VALUES (2, 'Mail me a copy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

hipma_copy_health_information
INSERT INTO bizont_edms_hipma.hipma_copy_health_information VALUES (1, 'Send me a copy by email', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_copy_health_information VALUES (2, 'Mail me a copy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_copy_health_information VALUES (3, 'I would like to view the original records in person', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

hipma_health_social_services_program
INSERT INTO bizont_edms_hipma.hipma_health_social_services_program VALUES (1, 'Community Nursing (includes records held at all community health centres)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_health_social_services_program VALUES (2, 'Family and Children''s Services (records pertaining to children in care, child abuse investigations etc.)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_health_social_services_program VALUES (3, 'Mental Wellness and Substance Use (records held at the Referred Care Clinic, mental health support services, etc.)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_health_social_services_program VALUES (4, 'Program area is unknown or not listed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_health_social_services_program VALUES (5, 'Continuing care (Whistlebend Place, Copper Ridge Place, Thompson Centre, home care)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

hipma_hss_systems
INSERT INTO bizont_edms_hipma.hipma_hss_systems VALUES (1, 'Panorama (immunization records)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_hss_systems VALUES (2, 'Chronic Disease Management Toolkit (CDM)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_hss_systems VALUES (3, 'Client Registry (e.g. name, address, phone number)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_hss_systems VALUES (4, 'Drug Information system (prescriptions)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_hss_systems VALUES (5, 'Lab Information System (lab tests)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_hss_systems VALUES (6, 'HSS system is unknown', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

hipma_request_access_personal_health_information
INSERT INTO bizont_edms_hipma.hipma_request_access_personal_health_information VALUES (1, 'I''m requesting access to my personal health information.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_request_access_personal_health_information VALUES (2, 'I''m requesting access on behalf of another individual.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

hipma_request_type
INSERT INTO bizont_edms_hipma.hipma_request_type VALUES (1, 'A request for your personal health information.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_request_type VALUES (2, 'A request for a record of user activity.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

hipma_situations
INSERT INTO bizont_edms_hipma.hipma_situations VALUES (1, 'Parent/guardian requesting records on behalf of their child.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_situations VALUES (2, 'Personal representative requesting records of a deceased individual.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_situations VALUES (3, 'Substitute decision maker request.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_situations VALUES (4, 'Request on behalf of another individual.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

hipma_status
INSERT INTO bizont_edms_hipma.hipma_status VALUES (1, 'New/Unread', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_status VALUES (2, 'Entered', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_status VALUES (3, 'Declined', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO bizont_edms_hipma.hipma_status VALUES (4, 'Closed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);