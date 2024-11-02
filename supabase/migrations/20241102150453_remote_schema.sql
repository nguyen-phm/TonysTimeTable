alter table "public"."Courses" drop constraint "Courses_name_key";

alter table "public"."Subjects" drop constraint "Subjects_code_key";

alter table "public"."Classes" drop constraint "Classes_location_id_fkey";

alter table "public"."Classes" drop constraint "Classes_subject_id_fkey";

alter table "public"."Courses" drop constraint "Courses_campus_id_fkey";

alter table "public"."Locations" drop constraint "Locations_campus_id_fkey";

alter table "public"."StudentSubject" drop constraint "StudentSubject_student_id_fkey";

alter table "public"."StudentSubject" drop constraint "StudentSubject_subject_id_fkey";

alter table "public"."Students" drop constraint "Students_course_id_fkey";

alter table "public"."Subjects" drop constraint "Subjects_course_id_fkey";

alter table "public"."StudentSubject" drop constraint "StudentSubject_pkey";

drop index if exists "public"."Courses_name_key";

drop index if exists "public"."Subjects_code_key";

drop index if exists "public"."StudentSubject_pkey";

alter type "public"."ClassType" rename to "ClassType__old_version_to_be_dropped";

create type "public"."ClassType" as enum ('Lecture', 'Tutorial', 'Practical');

alter table "public"."Classes" alter column class_type type "public"."ClassType" using class_type::text::"public"."ClassType";

drop type "public"."ClassType__old_version_to_be_dropped";

alter table "public"."Campuses" add column "venue_name" character varying;

alter table "public"."Classes" alter column "staff_id" drop not null;

alter table "public"."Locations" drop column "class_type";

alter table "public"."Locations" add column "class_types" "ClassType"[];

alter table "public"."StudentSubject" add column "id" bigint generated by default as identity not null;

alter table "public"."StudentSubject" add column "test" text;

alter table "public"."Students" add column "student_id" bigint not null;

alter table "public"."Subjects" drop column "semester";

alter table "public"."Subjects" drop column "year";

CREATE UNIQUE INDEX "StudentSubject_id_key" ON public."StudentSubject" USING btree (id);

CREATE UNIQUE INDEX "Students_student_id_key" ON public."Students" USING btree (student_id);

CREATE UNIQUE INDEX student_subject ON public."StudentSubject" USING btree (student_id, subject_id);

CREATE UNIQUE INDEX "StudentSubject_pkey" ON public."StudentSubject" USING btree (id);

alter table "public"."StudentSubject" add constraint "StudentSubject_pkey" PRIMARY KEY using index "StudentSubject_pkey";

alter table "public"."Classes" add constraint "Classes_duration_30mins_check" CHECK (((duration_30mins >= 2) AND (duration_30mins <= 10))) not valid;

alter table "public"."Classes" validate constraint "Classes_duration_30mins_check";

alter table "public"."StudentSubject" add constraint "StudentSubject_id_key" UNIQUE using index "StudentSubject_id_key";

alter table "public"."Students" add constraint "Students_student_id_key" UNIQUE using index "Students_student_id_key";

alter table "public"."Classes" add constraint "Classes_location_id_fkey" FOREIGN KEY (location_id) REFERENCES "Locations"(id) ON DELETE SET NULL not valid;

alter table "public"."Classes" validate constraint "Classes_location_id_fkey";

alter table "public"."Classes" add constraint "Classes_subject_id_fkey" FOREIGN KEY (subject_id) REFERENCES "Subjects"(id) ON DELETE CASCADE not valid;

alter table "public"."Classes" validate constraint "Classes_subject_id_fkey";

alter table "public"."Courses" add constraint "Courses_campus_id_fkey" FOREIGN KEY (campus_id) REFERENCES "Campuses"(id) ON DELETE CASCADE not valid;

alter table "public"."Courses" validate constraint "Courses_campus_id_fkey";

alter table "public"."Locations" add constraint "Locations_campus_id_fkey" FOREIGN KEY (campus_id) REFERENCES "Campuses"(id) ON DELETE CASCADE not valid;

alter table "public"."Locations" validate constraint "Locations_campus_id_fkey";

alter table "public"."StudentSubject" add constraint "StudentSubject_student_id_fkey" FOREIGN KEY (student_id) REFERENCES "Students"(id) ON DELETE CASCADE not valid;

alter table "public"."StudentSubject" validate constraint "StudentSubject_student_id_fkey";

alter table "public"."StudentSubject" add constraint "StudentSubject_subject_id_fkey" FOREIGN KEY (subject_id) REFERENCES "Subjects"(id) ON DELETE CASCADE not valid;

alter table "public"."StudentSubject" validate constraint "StudentSubject_subject_id_fkey";

alter table "public"."Students" add constraint "Students_course_id_fkey" FOREIGN KEY (course_id) REFERENCES "Courses"(id) ON DELETE CASCADE not valid;

alter table "public"."Students" validate constraint "Students_course_id_fkey";

alter table "public"."Subjects" add constraint "Subjects_course_id_fkey" FOREIGN KEY (course_id) REFERENCES "Courses"(id) ON DELETE CASCADE not valid;

alter table "public"."Subjects" validate constraint "Subjects_course_id_fkey";


