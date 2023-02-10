/* Replace with your SQL commands */
create trigger events_hipma before
insert
    or
delete
    or
update
    on
    bizont_edms_hipma.health_information for each row execute function bizont_edms_general.log_submissions();
