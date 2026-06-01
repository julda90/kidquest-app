--
-- PostgreSQL database dump
--

\restrict i7NLvb1ZN9ZqksqDBvxhT9N6b8gXgaSdkJzsY9tpkTVgdpKeNy7ng9uWlwTYd2u

-- Dumped from database version 16.12 (Debian 16.12-1.pgdg13+1)
-- Dumped by pg_dump version 16.12 (Debian 16.12-1.pgdg13+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_user; Type: TABLE; Schema: public; Owner: kidquest
--

CREATE TABLE public.app_user (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    family_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.app_user OWNER TO kidquest;

--
-- Name: child; Type: TABLE; Schema: public; Owner: kidquest
--

CREATE TABLE public.child (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    family_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    age integer,
    avatar character varying(50),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.child OWNER TO kidquest;

--
-- Name: family; Type: TABLE; Schema: public; Owner: kidquest
--

CREATE TABLE public.family (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.family OWNER TO kidquest;

--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: kidquest
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO kidquest;

--
-- Name: point_transaction; Type: TABLE; Schema: public; Owner: kidquest
--

CREATE TABLE public.point_transaction (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    child_id uuid NOT NULL,
    amount integer NOT NULL,
    reason character varying(200),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.point_transaction OWNER TO kidquest;

--
-- Name: reward; Type: TABLE; Schema: public; Owner: kidquest
--

CREATE TABLE public.reward (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    family_id uuid NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    point_cost integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reward OWNER TO kidquest;

--
-- Name: task; Type: TABLE; Schema: public; Owner: kidquest
--

CREATE TABLE public.task (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    family_id uuid NOT NULL,
    child_id uuid,
    title character varying(200) NOT NULL,
    description text,
    point_value integer DEFAULT 10 NOT NULL,
    status character varying(50) NOT NULL,
    due_date date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.task OWNER TO kidquest;

--
-- Data for Name: app_user; Type: TABLE DATA; Schema: public; Owner: kidquest
--

COPY public.app_user (id, email, password, role, family_id, created_at, updated_at) FROM stdin;
4cbf53ce-9218-442f-b70a-b61d40277a0c	parent@smith.com	$2a$10$FXMAw2Tz.uyMalOYRWCh5edvyuwN6UbYhow3EMM.m.PWIzllQavrC	PARENT	ab6a3255-11dc-4d61-8551-5e3e58787d4c	2026-03-12 18:24:34.214765	2026-05-05 19:28:45.13197
\.


--
-- Data for Name: child; Type: TABLE DATA; Schema: public; Owner: kidquest
--

COPY public.child (id, family_id, name, age, avatar, created_at, updated_at, deleted_at) FROM stdin;
2f83c642-1b14-4dde-bc10-4976780b439c	58c3009e-fc8e-4a86-bae9-22b12cd731dd	Sam	6	≡ƒªü	2026-04-20 22:11:26.609965	2026-04-20 22:11:26.609965	\N
dfa818b9-fcea-45bf-86b5-8287f23976cb	6d051edd-fe21-413e-a648-c7fc886ee9ea	Little Mary	9	≡ƒªü	2026-03-02 19:52:23.750602	2026-04-20 22:39:33.003742	2026-04-20 22:39:32.991775
a950e0dc-c4d4-4991-9a75-6c3fe422a28d	6d051edd-fe21-413e-a648-c7fc886ee9ea	Samuel	6	≡ƒªû	2026-04-20 22:39:55.157464	2026-04-20 22:40:49.042342	2026-04-20 22:40:49.041824
64942f9b-ce1c-473b-a0ed-db9b14aec31f	ab6a3255-11dc-4d61-8551-5e3e58787d4c	Samuel	6	hotwheels	2026-04-20 22:46:13.186223	2026-04-20 22:58:23.2309	\N
612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	ab6a3255-11dc-4d61-8551-5e3e58787d4c	Sara	6	unicorn	2026-04-20 22:46:29.191242	2026-04-20 22:59:23.066668	\N
156123df-ed25-4129-b24f-05d1c1062138	ab6a3255-11dc-4d61-8551-5e3e58787d4c	Rebeka	4	elsa	2026-04-20 22:59:32.084631	2026-04-20 22:59:32.084631	\N
\.


--
-- Data for Name: family; Type: TABLE DATA; Schema: public; Owner: kidquest
--

COPY public.family (id, name, created_at, updated_at, deleted_at) FROM stdin;
58c3009e-fc8e-4a86-bae9-22b12cd731dd	Smith Family	2026-03-12 17:39:12.709744	2026-04-20 22:45:47.678496	2026-04-20 22:45:47.668498
6d051edd-fe21-413e-a648-c7fc886ee9ea	Johnson Family	2026-03-02 15:40:25.508143	2026-04-20 22:45:50.004805	2026-04-20 22:45:50.004805
ab6a3255-11dc-4d61-8551-5e3e58787d4c	Seidlovi	2026-04-20 22:46:03.457158	2026-04-20 22:46:03.457158	\N
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: kidquest
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	create initial tables	SQL	V1__create_initial_tables.sql	-922013672	kidquest	2026-02-20 12:29:27.081429	83	t
2	2	add unassigned task status	SQL	V2__add_unassigned_task_status.sql	-1208379472	kidquest	2026-03-03 12:47:01.358027	11	t
3	3	change task status to varchar	SQL	V3__change_task_status_to_varchar.sql	1771080732	kidquest	2026-03-03 13:01:05.027716	29	t
4	4	create users table	SQL	V4__create_users_table.sql	426697643	kidquest	2026-03-10 18:02:59.42874	46	t
5	5	add soft delete	SQL	V5__add_soft_delete.sql	983942578	kidquest	2026-04-20 22:39:26.721124	27	t
6	6	add family soft delete	SQL	V6__add_family_soft_delete.sql	310913937	kidquest	2026-04-20 22:45:26.471968	8	t
7	7	decouple point transaction from task	SQL	V7__decouple_point_transaction_from_task.sql	-744346512	kidquest	2026-04-21 13:37:34.495067	32	t
\.


--
-- Data for Name: point_transaction; Type: TABLE DATA; Schema: public; Owner: kidquest
--

COPY public.point_transaction (id, child_id, amount, reason, created_at) FROM stdin;
82e9be3d-d4f0-40a0-a829-8adc586aaaff	dfa818b9-fcea-45bf-86b5-8287f23976cb	10	Completed cleaning task	2026-03-10 17:39:25.97897
67621cf5-d548-4f00-9439-3f30b6bf4fc3	dfa818b9-fcea-45bf-86b5-8287f23976cb	10	Completed cleaning task	2026-03-12 17:39:14.647967
a738767c-6b38-40c5-9769-dfec5ff414f9	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	15	Completed task: Clean room	2026-04-21 12:18:26.928104
30fc54ea-0602-48f0-815c-bf266dcec54b	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	30	Completed task: Clean room	2026-04-21 12:22:46.655346
cb50efd7-2bc1-4424-b2cd-0b244a9c88e9	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	30	Completed task: Clean room	2026-04-21 12:38:31.940684
188ff734-3633-4ed5-9ffc-b194afc7c005	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	-75	Points deducted manually	2026-04-21 13:29:15.121767
a69c0420-d198-47f0-8304-99c625f8b5c7	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	-75	reset	2026-04-21 13:29:33.780788
804de253-0016-4e17-8d86-f3a00c38a9a6	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	-70	reset	2026-04-21 13:29:41.010095
1081833b-ace3-4e05-9c18-38bbbb6662d7	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	145	Points added manually	2026-04-21 13:37:57.512868
1cab3edc-e1b0-489e-b0b3-9dd5dbc67116	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	50	Points added manually	2026-04-21 13:38:22.755262
e3a1851f-ca7d-4e82-92ab-a448d693b5fe	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	5	Points added manually	2026-04-21 15:29:09.369713
4d78a548-89c0-4b2f-a5a7-4a1cdf9761f1	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	-55	Points deducted manually	2026-04-21 15:54:03.334767
035ccac7-0830-48a7-9dc2-d2ea36ce98a0	64942f9b-ce1c-473b-a0ed-db9b14aec31f	1	Oblekani	2026-04-22 06:57:40.42642
f75050ad-f4b7-42bb-9831-29ab46044f76	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	1	Oblekani	2026-04-22 06:57:48.967762
0094ba28-f919-40b3-b25e-a64cdd502aba	64942f9b-ce1c-473b-a0ed-db9b14aec31f	20	Pomahani na mlyne	2026-04-22 07:12:49.248158
a18cca21-047d-48a1-bbbb-bf9f0f9b9e9f	64942f9b-ce1c-473b-a0ed-db9b14aec31f	45	Points added manually	2026-05-05 10:03:03.256732
2d498c46-04ad-4bdf-957b-eca569ba43e0	64942f9b-ce1c-473b-a0ed-db9b14aec31f	-18	Points deducted manually	2026-05-05 10:03:17.34391
3ae0ccd1-3896-40f9-93c7-cc3fc9e88288	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	45	Points added manually	2026-05-05 10:03:24.223819
ea078892-6f42-4172-8e0d-59dc804766b4	156123df-ed25-4129-b24f-05d1c1062138	30	Points added manually	2026-05-05 10:03:29.289282
576d4e3c-b9b1-4e0e-bb4b-1eec08114cc4	64942f9b-ce1c-473b-a0ed-db9b14aec31f	-48	Points deducted manually	2026-05-05 10:46:39.631972
913a4cfb-0f5a-4928-b592-a2ac8e4bff34	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	-46	Points deducted manually	2026-05-05 10:46:43.428747
31aa0da9-8017-49c8-aa61-eec6688055fd	156123df-ed25-4129-b24f-05d1c1062138	-30	Points deducted manually	2026-05-05 10:46:46.713646
ea9c8ca7-0985-4082-a200-fcfc0e40c42b	64942f9b-ce1c-473b-a0ed-db9b14aec31f	500	Points added manually	2026-05-05 10:51:19.60267
754a6448-b0b9-4a5a-bfa8-7b74563db068	64942f9b-ce1c-473b-a0ed-db9b14aec31f	-452	Points deducted manually	2026-05-05 12:22:13.003881
099b27f9-f32c-4f1f-967f-1c7834b99681	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	40	Points added manually	2026-05-05 12:22:19.563511
34dff173-468c-410a-9c55-bdc3e2377daa	156123df-ed25-4129-b24f-05d1c1062138	30	Points added manually	2026-05-05 12:22:25.739196
4a4b5ab6-169a-4081-a185-b4650b7b80ff	64942f9b-ce1c-473b-a0ed-db9b14aec31f	1	Points added manually	2026-05-05 19:58:39.062073
0628d9c6-f21b-4ff4-bd4d-ae9807234b01	156123df-ed25-4129-b24f-05d1c1062138	1	Points added manually	2026-05-05 19:58:46.170613
2c81f460-dba7-47fd-a0e9-f8992d24d0ba	64942f9b-ce1c-473b-a0ed-db9b14aec31f	1	Points added manually	2026-05-06 06:38:00.819709
6791abee-d9fa-4f5e-b190-139610b6e96e	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	2	Points added manually	2026-05-06 06:43:10.364717
004fb552-634d-4153-8e3e-72fa1c4f043d	64942f9b-ce1c-473b-a0ed-db9b14aec31f	1	oblekani	2026-05-06 07:08:04.827381
f941e94e-8662-4e73-b26f-f32b885d6595	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	1	oblekani	2026-05-06 07:08:11.060213
240ec1fa-8f2d-4f3c-b3e9-d9e2a32f21dc	64942f9b-ce1c-473b-a0ed-db9b14aec31f	3	Points added manually	2026-05-07 07:27:39.356486
30055dc2-d33e-4401-bd4b-88297e70d8a2	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	3	Points added manually	2026-05-07 07:27:43.530604
b64f4814-1c4a-462c-b328-ee37f9f9da14	64942f9b-ce1c-473b-a0ed-db9b14aec31f	1	Points added manually	2026-05-07 07:28:43.534324
f0547e53-129b-42af-b554-f0c328769777	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	1	Points added manually	2026-05-07 07:28:46.091098
e17cd8b0-e3e8-4b80-a727-dd7525540a64	156123df-ed25-4129-b24f-05d1c1062138	4	Points added manually	2026-05-07 07:28:49.567931
86ef0f74-0d5c-4541-83cf-00be550f93fb	64942f9b-ce1c-473b-a0ed-db9b14aec31f	5	Points added manually	2026-05-12 06:27:08.573905
b5c5b481-6da1-4f67-a255-a48bff9df8a8	64942f9b-ce1c-473b-a0ed-db9b14aec31f	1	Points added manually	2026-05-12 06:27:36.719961
25834fa6-3c0d-43a2-a1bf-b9187b99806d	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	6	Points added manually	2026-05-12 06:28:03.848417
39c92aad-605d-4c11-ab4d-418863b152ce	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	58	Points added manually	2026-05-12 06:28:12.682987
4b0443aa-e9f5-435b-a7ba-28c29d22a4b2	156123df-ed25-4129-b24f-05d1c1062138	5	Points added manually	2026-05-12 06:28:24.420681
a8e434b8-b999-4b0f-b319-deaf1f97056b	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	-55	Points deducted manually	2026-05-12 06:28:42.595089
9756b20a-0eb4-4f34-937d-2c168af82b0e	64942f9b-ce1c-473b-a0ed-db9b14aec31f	50	Points added manually	2026-05-12 07:08:45.774857
9a11dc95-c2d4-48b4-8804-d6df8cfcc505	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	50	Points added manually	2026-05-12 07:08:48.324224
93d1a208-38dc-45cb-a6a7-345e604bec33	156123df-ed25-4129-b24f-05d1c1062138	50	Points added manually	2026-05-12 07:08:50.486987
7fc90e57-86ef-4764-9b4d-c1aed4ee7d85	64942f9b-ce1c-473b-a0ed-db9b14aec31f	2	Points added manually	2026-05-14 06:42:09.367335
fa2c0817-a86e-4f98-aead-448f0858da57	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	2	Points added manually	2026-05-14 06:42:12.578172
2cc7e0d8-bd87-4ed6-a532-e36889729864	156123df-ed25-4129-b24f-05d1c1062138	2	Points added manually	2026-05-14 06:49:10.971088
b7e6e77c-5fe8-4e0b-9268-3917ed0fd877	64942f9b-ce1c-473b-a0ed-db9b14aec31f	1	Points added manually	2026-05-14 07:23:41.811592
61882f7c-a04b-4a01-a837-d9b81355f6d1	64942f9b-ce1c-473b-a0ed-db9b14aec31f	2	Points added manually	2026-05-18 07:28:28.563225
366f1436-9ab4-410c-8ad1-c22baeb317f7	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	4	Points added manually	2026-05-18 07:28:41.067871
2aa741d2-34c2-44ef-8b90-a3cbf6fadede	156123df-ed25-4129-b24f-05d1c1062138	3	Points added manually	2026-05-18 07:29:05.110157
7b33673b-f18b-47f8-a638-3d122338aa59	64942f9b-ce1c-473b-a0ed-db9b14aec31f	3	Points added manually	2026-05-21 06:32:54.242016
135aff07-c378-4267-b79f-586d82c9082c	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	2	Points added manually	2026-05-21 06:32:58.357439
552b488a-25e7-4443-842f-3d4d67a45032	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	-2	Points deducted manually	2026-05-21 06:33:04.562105
a19dea35-644e-47a5-b870-a94c41886dd8	156123df-ed25-4129-b24f-05d1c1062138	2	Points added manually	2026-05-21 06:33:07.458613
880e98e8-aa82-4185-aad9-dce6497fb21d	64942f9b-ce1c-473b-a0ed-db9b14aec31f	5	Points added manually	2026-05-26 07:36:13.420783
efdd9032-07de-4755-91d6-d9a5d8ff7581	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	6	Points added manually	2026-05-26 07:36:18.947709
7f96ca8c-a763-4953-b986-370649453a1f	156123df-ed25-4129-b24f-05d1c1062138	5	Points added manually	2026-05-26 07:36:25.675746
0f5af4d8-14b8-431a-8c75-ed401e2e0a6f	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	4	Points added manually	2026-05-26 07:36:41.143052
\.


--
-- Data for Name: reward; Type: TABLE DATA; Schema: public; Owner: kidquest
--

COPY public.reward (id, family_id, name, description, point_cost, active, created_at, updated_at) FROM stdin;
7147eea6-3a7c-45a8-ab20-ac822e28aeed	ab6a3255-11dc-4d61-8551-5e3e58787d4c	Stena	Odpoledne na stene	100	t	2026-04-21 12:37:53.663642	2026-04-21 12:37:53.663642
18189053-f17b-448e-9514-29a087d8b7f8	ab6a3255-11dc-4d61-8551-5e3e58787d4c	Jumppark	Hodinka v jumpparku	200	t	2026-04-21 12:50:30.490731	2026-04-21 12:50:30.490731
41511317-e114-4897-9b83-3e249369ee2d	ab6a3255-11dc-4d61-8551-5e3e58787d4c	Zmrzka	Kemelakem	50	t	2026-04-21 12:21:55.234009	2026-04-21 13:39:23.878958
95d2682f-263d-4199-b2e5-b0fd12c8feff	ab6a3255-11dc-4d61-8551-5e3e58787d4c	Puzzle	\N	500	t	2026-04-21 13:39:48.758561	2026-04-21 13:39:48.758561
e8d438c3-503c-4a75-a15d-bb6d597d0c3d	ab6a3255-11dc-4d61-8551-5e3e58787d4c	Dobr┼»tka	N├íkup men┼í├¡ dobr┼»tky v obchod─¢	25	t	2026-04-21 15:24:19.105916	2026-04-21 15:29:25.42687
\.


--
-- Data for Name: task; Type: TABLE DATA; Schema: public; Owner: kidquest
--

COPY public.task (id, family_id, child_id, title, description, point_value, status, due_date, created_at, updated_at, deleted_at) FROM stdin;
a4cf8ea8-e461-4578-9e0d-438349d67c9e	58c3009e-fc8e-4a86-bae9-22b12cd731dd	\N	Clean	Room	6	UNASSIGNED	\N	2026-04-20 22:11:43.334331	2026-04-20 22:11:43.334331	\N
031394a6-c391-4267-a25f-2d3717bf1aba	6d051edd-fe21-413e-a648-c7fc886ee9ea	\N	Uklidit pokoj	\N	10	UNASSIGNED	2026-04-23	2026-04-20 22:40:42.407141	2026-04-20 22:40:45.635806	2026-04-20 22:40:45.635271
86aa2004-ad75-4371-a963-9b132f2f8f29	ab6a3255-11dc-4d61-8551-5e3e58787d4c	612abe26-ff5f-4b5d-ab4d-2e4bf335a8c5	Clean room	Room	30	COMPLETED	2026-04-23	2026-04-21 11:58:04.079495	2026-04-21 13:01:06.804404	2026-04-21 13:01:06.803883
\.


--
-- Name: app_user app_user_email_key; Type: CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_email_key UNIQUE (email);


--
-- Name: app_user app_user_pkey; Type: CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_pkey PRIMARY KEY (id);


--
-- Name: child child_pkey; Type: CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.child
    ADD CONSTRAINT child_pkey PRIMARY KEY (id);


--
-- Name: family family_pkey; Type: CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.family
    ADD CONSTRAINT family_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: point_transaction point_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.point_transaction
    ADD CONSTRAINT point_transaction_pkey PRIMARY KEY (id);


--
-- Name: reward reward_pkey; Type: CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.reward
    ADD CONSTRAINT reward_pkey PRIMARY KEY (id);


--
-- Name: task task_pkey; Type: CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: kidquest
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: app_user app_user_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.family(id);


--
-- Name: child child_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.child
    ADD CONSTRAINT child_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.family(id);


--
-- Name: point_transaction point_transaction_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.point_transaction
    ADD CONSTRAINT point_transaction_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id);


--
-- Name: reward reward_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.reward
    ADD CONSTRAINT reward_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.family(id);


--
-- Name: task task_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id);


--
-- Name: task task_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kidquest
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.family(id);


--
-- PostgreSQL database dump complete
--

\unrestrict i7NLvb1ZN9ZqksqDBvxhT9N6b8gXgaSdkJzsY9tpkTVgdpKeNy7ng9uWlwTYd2u

