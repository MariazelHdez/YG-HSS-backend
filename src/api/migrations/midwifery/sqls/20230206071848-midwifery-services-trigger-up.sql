/* Replace with your SQL commands */
create trigger events_midwifery before
insert
    or
delete
    or
update
    on
    bizont_edms_midwifery.midwifery_services for each row execute function bizont_edms_general.log_submissions();
