drop view if exists public.courses_query cascade;
create view public.courses_query as
select c.id, c.c_group, c.code, c.section, c.name, c.start_date, uc.user_id, c.config
from courses c
inner join user_courses uc on c.id = uc.course_id