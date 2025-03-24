SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--


select pgmq.create('embedding_jobs');






--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: account_status; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_members; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: post_authors; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: post_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: post_comment_replies; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('images', 'images', NULL, '2025-03-13 01:09:23.87357+00', '2025-03-13 01:09:23.87357+00', true, false, 5242880, '{image/png,image/jpeg}', NULL);


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('20ea099f-1de8-47a1-9f3b-7a46b4e1cb00', 'images', 'defaults/default1.png', NULL, '2025-03-13 01:09:23.891204+00', '2025-03-13 01:09:23.891204+00', '2025-03-13 01:09:23.891204+00', '{"eTag": "\"5251b94554caa1d3588a11a450ac0add\"", "size": 12822, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-03-13T01:09:23.885Z", "contentLength": 12822, "httpStatusCode": 200}', 'fc17864e-b6c5-4ba0-adb3-a40a87544c09', NULL, '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;



INSERT INTO account_roles (name, description, default_permissions)
VALUES
    ('instructor', 'Administrator role', 
        '{
            "can_delete_course": true,
            "can_invite": {
                "instructor": true,
                "staff": true,
                "student": true
            },
            "can_remove": {
                "instructor": true,
                "staff": true,
                "student": true
            },
            "can_change_course_visibility": true,
            "can_create_tags": true,
            "can_edit_tags": true,
            "can_delete_tags": true,
            "can_create_post": true,
            "can_view_posts": {
                "public": true,
                "private": true
            },
            "can_change_post_visibility": {
                "own": true,
                "others": true
            },
            "can_edit_post": {
                "own": true,
                "others": true
            },
            "can_delete_posts": {
                "own": true,
                "others": true
            },
            "can_tag_posts": {
                "own": true,
                "others": true
            }
        }'
    ),
    ('staff', 'Instructor role',
        '{
            "can_delete_course": false,
            "can_invite": {
                "instructor": false,
                "staff": true,
                "student": true
            },
            "can_remove": {
                "instructor": false,
                "staff": false,
                "student": true
            },
            "can_change_course_visibility": false,
            "can_create_tags": true,
            "can_edit_tags": true,
            "can_delete_tags": true,
            "can_create_post": true,
            "can_view_posts": {
                "public": true,
                "private": true
            },
            "can_change_post_visibility": {
                "own": true,
                "others": true
            },
            "can_edit_post": {
                "own": true,
                "others": true
            },
            "can_delete_posts": {
                "own": true,
                "others": true
            },
            "can_tag_posts": {
                "own": true,
                "others": true
            }
        }'
    ),
    ('student', 'Student role',  
        '{
            "can_delete_course": false,
            "can_invite": {
                "instructor": false,
                "staff": false,
                "student": false
            },
            "can_remove": {
                "instructor": false,
                "staff": false,
                "student": false
            },
            "can_change_course_visibility": false,
            "can_create_tags": false,
            "can_edit_tags": false,
            "can_delete_tags": false,
            "can_create_post": true,
            "can_view_posts": {
                "public": true,
                "private": false
            },
            "can_change_post_visibility": {
                "own": true,
                "others": false
            },
            "can_edit_post": {
                "own": true,
                "others": false
            },
            "can_delete_posts": {
                "own": true,
                "others": false
            },
            "can_tag_posts": {
                "own": true,
                "others": false
            }
        }'
    );
