/* Replace with your SQL commands */
create trigger events_constellation before
insert
    or
delete
    or
update
    on
    bizont_edms_constellation_health.constellation_health for each row execute function bizont_edms_general.log_submissions();
