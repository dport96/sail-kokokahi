--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.4

-- Started on 2025-10-12 10:48:48 HST

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
-- TOC entry 5 (class 2615 OID 67858)
-- Name: public; Type: SCHEMA; Schema: -; Owner: danport
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO danport;

--
-- TOC entry 3665 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: danport
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 853 (class 1247 OID 67869)
-- Name: Role; Type: TYPE; Schema: public; Owner: danport
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO danport;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 67906)
-- Name: Event; Type: TABLE; Schema: public; Owner: danport
--

CREATE TABLE public."Event" (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    date text NOT NULL,
    location text NOT NULL,
    hours double precision NOT NULL,
    "time" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    qr text,
    "signupReq" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Event" OWNER TO danport;

--
-- TOC entry 218 (class 1259 OID 67905)
-- Name: Event_id_seq; Type: SEQUENCE; Schema: public; Owner: danport
--

CREATE SEQUENCE public."Event_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Event_id_seq" OWNER TO danport;

--
-- TOC entry 3667 (class 0 OID 0)
-- Dependencies: 218
-- Name: Event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: danport
--

ALTER SEQUENCE public."Event_id_seq" OWNED BY public."Event".id;


--
-- TOC entry 221 (class 1259 OID 67965)
-- Name: HoursLog; Type: TABLE; Schema: public; Owner: danport
--

CREATE TABLE public."HoursLog" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    action text NOT NULL,
    hours double precision NOT NULL,
    "performedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."HoursLog" OWNER TO danport;

--
-- TOC entry 220 (class 1259 OID 67964)
-- Name: HoursLog_id_seq; Type: SEQUENCE; Schema: public; Owner: danport
--

CREATE SEQUENCE public."HoursLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."HoursLog_id_seq" OWNER TO danport;

--
-- TOC entry 3668 (class 0 OID 0)
-- Dependencies: 220
-- Name: HoursLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: danport
--

ALTER SEQUENCE public."HoursLog_id_seq" OWNED BY public."HoursLog".id;


--
-- TOC entry 225 (class 1259 OID 68015)
-- Name: Qr; Type: TABLE; Schema: public; Owner: danport
--

CREATE TABLE public."Qr" (
    id integer NOT NULL,
    data text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Qr" OWNER TO danport;

--
-- TOC entry 224 (class 1259 OID 68014)
-- Name: Qr_id_seq; Type: SEQUENCE; Schema: public; Owner: danport
--

CREATE SEQUENCE public."Qr_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Qr_id_seq" OWNER TO danport;

--
-- TOC entry 3669 (class 0 OID 0)
-- Dependencies: 224
-- Name: Qr_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: danport
--

ALTER SEQUENCE public."Qr_id_seq" OWNED BY public."Qr".id;


--
-- TOC entry 217 (class 1259 OID 67884)
-- Name: User; Type: TABLE; Schema: public; Owner: danport
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "firstName" text DEFAULT 'John'::text NOT NULL,
    "lastName" text DEFAULT 'Doe'::text NOT NULL,
    "approvedHours" double precision DEFAULT 0 NOT NULL,
    "pendingHours" double precision DEFAULT 0 NOT NULL,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL
);


ALTER TABLE public."User" OWNER TO danport;

--
-- TOC entry 223 (class 1259 OID 67981)
-- Name: UserEvent; Type: TABLE; Schema: public; Owner: danport
--

CREATE TABLE public."UserEvent" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "eventId" integer NOT NULL,
    attended boolean DEFAULT false NOT NULL
);


ALTER TABLE public."UserEvent" OWNER TO danport;

--
-- TOC entry 222 (class 1259 OID 67980)
-- Name: UserEvent_id_seq; Type: SEQUENCE; Schema: public; Owner: danport
--

CREATE SEQUENCE public."UserEvent_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UserEvent_id_seq" OWNER TO danport;

--
-- TOC entry 3670 (class 0 OID 0)
-- Dependencies: 222
-- Name: UserEvent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: danport
--

ALTER SEQUENCE public."UserEvent_id_seq" OWNED BY public."UserEvent".id;


--
-- TOC entry 216 (class 1259 OID 67883)
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: danport
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO danport;

--
-- TOC entry 3671 (class 0 OID 0)
-- Dependencies: 216
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: danport
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- TOC entry 215 (class 1259 OID 67859)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: danport
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO danport;

--
-- TOC entry 3480 (class 2604 OID 67909)
-- Name: Event id; Type: DEFAULT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public."Event" ALTER COLUMN id SET DEFAULT nextval('public."Event_id_seq"'::regclass);


--
-- TOC entry 3483 (class 2604 OID 67968)
-- Name: HoursLog id; Type: DEFAULT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public."HoursLog" ALTER COLUMN id SET DEFAULT nextval('public."HoursLog_id_seq"'::regclass);


--
-- TOC entry 3487 (class 2604 OID 68018)
-- Name: Qr id; Type: DEFAULT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public."Qr" ALTER COLUMN id SET DEFAULT nextval('public."Qr_id_seq"'::regclass);


--
-- TOC entry 3472 (class 2604 OID 67887)
-- Name: User id; Type: DEFAULT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- TOC entry 3485 (class 2604 OID 67984)
-- Name: UserEvent id; Type: DEFAULT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public."UserEvent" ALTER COLUMN id SET DEFAULT nextval('public."UserEvent_id_seq"'::regclass);


--
-- TOC entry 3653 (class 0 OID 67906)
-- Dependencies: 219
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: danport
--

COPY public."Event" (id, title, description, date, location, hours, "time", status, qr, "signupReq") FROM stdin;
3	Club Day	Club day cleanup	10/12/2025	Club	1.5	08:30 AM	pending	\N	f
4	Club Day	Club day cleanup	02/15/2025	club	1.5	08:30 PM	pending	\N	f
\.


--
-- TOC entry 3655 (class 0 OID 67965)
-- Dependencies: 221
-- Data for Name: HoursLog; Type: TABLE DATA; Schema: public; Owner: danport
--

COPY public."HoursLog" (id, "userId", action, hours, "performedBy", "createdAt") FROM stdin;
4	3	check-in	1.5	daniel@port.as	2025-10-12 04:48:29.153
5	3	check-in	1.5	daniel@port.as	2025-10-12 04:49:12.623
6	3	check-in	1.5	daniel@port.as	2025-10-12 18:26:16.484
7	17	check-in	1.5	sparker003@outlook.com	2025-10-12 18:29:32.65
8	13	check-in	1.5	doug@dbdzn.com	2025-10-12 18:35:34.561
9	18	check-in	1.5	kaifunakawa@gmail.com	2025-10-12 18:40:30.15
10	19	check-in	1.5	hkerkering@gmail.com	2025-10-12 18:40:52.857
11	20	check-in	1.5	braffet@gmail.com	2025-10-12 18:43:34.056
12	5	check-in	1.5	andy.fridlund@gmail.com	2025-10-12 18:58:58.657
13	22	check-in	1.5	framey@hdcc.com	2025-10-12 19:02:33.542
14	11	check-in	1.5	awgiii63@gmail.com	2025-10-12 19:02:51.449
15	23	check-in	1.5	mrmoore467@gmail.com	2025-10-12 19:03:11.567
16	15	check-in	1.5	twilightaudio@gmail.com	2025-10-12 19:12:15.09
17	26	check-in	1.5	peter.hawaii@gmail.com	2025-10-12 19:17:05.053
18	27	check-in	1.5	sealegs808@icloud.com	2025-10-12 19:17:34.211
19	28	check-in	1.5	mjsaloha@gmail.com	2025-10-12 19:19:20.173
20	9	check-in	1.5	thaylett.808@gmail.com	2025-10-12 19:24:32.626
21	14	check-in	1.5	sydneysrw@gmail.com	2025-10-12 19:26:29.347
22	29	check-in	1.5	nacrahawaii@gmail.com	2025-10-12 19:26:53.699
23	30	check-in	1.5	hhca13@aol.com	2025-10-12 19:37:59.072
\.


--
-- TOC entry 3659 (class 0 OID 68015)
-- Dependencies: 225
-- Data for Name: Qr; Type: TABLE DATA; Schema: public; Owner: danport
--

COPY public."Qr" (id, data, "createdAt") FROM stdin;
\.


--
-- TOC entry 3651 (class 0 OID 67884)
-- Dependencies: 217
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: danport
--

COPY public."User" (id, email, password, role, "firstName", "lastName", "approvedHours", "pendingHours", phone, "createdAt", "updatedAt", status) FROM stdin;
1	admin@foo.com	$2b$10$qdylf1zUUQSfDvLyg1eDsuK4p5yBkIH6fCR4cko.18QioZdhP0EwW	ADMIN	Admin	User	0	0	\N	2025-09-12 19:30:17.488	2025-09-12 19:30:17.488	pending
18	kaifunakawa@gmail.com	$2b$10$7N0MGGZMJWcwearTGMD2i.gTY4vn7YIIZZddBWtdwco1TcnQEXK.u	USER	Kai	Funakawa	0	1.5	8083897467	2025-10-12 18:39:57.882	2025-10-12 18:40:30.147	pending
19	hkerkering@gmail.com	$2b$10$LJXuCWZMHLg8f9V2Yw5.sujIr/MMu.L7P3liH4P7G5usKggQB0u9G	USER	Heather	Kerkering	0	1.5	\N	2025-10-12 18:40:10.776	2025-10-12 18:40:52.856	pending
20	braffet@gmail.com	$2b$10$BexViiH2Qnnjq4YvH8bto.haeHkfYL1PlZ3wD7ZBu7RHtjENOFDJi	USER	Elizabeth 	Ratliff 	0	1.5	8082392028	2025-10-12 18:41:23.979	2025-10-12 18:43:34.054	pending
21	jonesta79@gmail.com	$2b$10$69r4Xv.KjmRF9TYJXCyKV.Iv2SdEBrimKMw1VhslEWo8PJFC.GhS.	USER	Trevor	Jones	0	0	\N	2025-10-12 18:44:38.841	2025-10-12 18:44:38.841	pending
5	andy.fridlund@gmail.com	$2b$10$UN1EHlI0eGzxWu95z0UOs.y8JXPr2mMmcdtGP6iBSr2y.iZ13EsIW	USER	Anders	Fridlund	0	1.5	8084528899	2025-10-12 05:40:06.275	2025-10-12 18:58:58.655	pending
22	framey@hdcc.com	$2b$10$MCMK/8.dF2Nqo9nqN7uaW./T8biK6eLz1/1kkVys5.EAk591o5NLa	USER	Forrest	Ramey	0	1.5	8083422815	2025-10-12 19:02:06.927	2025-10-12 19:02:33.539	pending
11	awgiii63@gmail.com	$2b$10$61g9kVBQ1Xm2vLEUzB.oOeVi.A.Qq5QdZ68Nnh8D/mECu0hXrdvOW	USER	Bud	Green	0	1.5	6198858555	2025-10-12 15:12:31.844	2025-10-12 19:02:51.446	pending
23	mrmoore467@gmail.com	$2b$10$HNqkdLyiM.egEcEVB.90UuYp.z2nRWDHqd2XXS7CwJ0zTkYA/4E5S	USER	Matt	Moore	0	1.5	\N	2025-10-12 19:02:44.102	2025-10-12 19:03:11.566	pending
6	ek@eddie.com	$2b$10$RZnB8quUdVZRD/PftA90ze3fBs2NKXa36nUtpX82zjoqn4iFOofKy	USER	Eddie	Kowal	0	0	\N	2025-10-12 05:57:41.596	2025-10-12 05:57:41.596	pending
7	mitchell.selby@gmail.com	$2b$10$0MA.0VgdQlG8smQiL.iwoO/NFQz7kWr9PPz9DgDfAiUREj.qdGvGa	USER	Mitchell	Selby	0	0	4052051061	2025-10-12 06:16:40.597	2025-10-12 06:16:40.597	pending
12	ezbrez61@gmail.com	$2b$10$hcW88iESEfi6m1/EoCSNEe14wYDrx.y5w.o3Up3R9OPNyNpsbWgs2	USER	Scott	Coffman	0	0	8085541815	2025-10-12 15:46:23.73	2025-10-12 15:46:23.73	pending
15	twilightaudio@gmail.com	$2b$10$UxsxD59o5KwFH/QtnPV0X.c2zpKEg9pwP4st/HbTkUibcSzQtxe6O	USER	CHRISTOPHER	CHILDRESS	0	1.5	8083723390	2025-10-12 17:37:35.652	2025-10-12 19:12:15.088	pending
17	sparker003@outlook.com	$2b$10$mau5LUb2gBqKb/W8VEDLx.FSV/Ahz.Zy7NM0tbvr.bkxJbvBPYMue	USER	Ruben	Amodo	1.5	0	\N	2025-10-12 18:29:11.67	2025-10-12 18:32:01.177	pending
3	daniel@port.as	$2b$10$9D5RvGJzCX7H87/CurlFQOEEL.t4b9RDRhh86XPT/zaCpbX9n4Fom	USER	Daniel	Port	4	0	8083728400	2025-09-12 19:49:38.596	2025-10-12 18:32:01.337	pending
26	peter.hawaii@gmail.com	$2b$10$qZNKKKJza0kO97gdwIkQaec.gyn2sJyETNJh5jbur0KK73J./j9cu	USER	Peter	Nicholson	0	1.5	\N	2025-10-12 19:15:47.747	2025-10-12 19:17:05.048	pending
13	doug@dbdzn.com	$2b$10$oc/YJRyy/FnA/uxFXOoGAe3y/xYmwGuUBEoa9s9kG/bWgef0tV45C	USER	Doug	Behrens	1.5	0	8082851627	2025-10-12 16:44:16.977	2025-10-12 18:37:54.667	pending
27	sealegs808@icloud.com	$2b$10$rI7.6nkcp4Psg1JCk1b4M.4d/pC60TpqO1qUEkSMwU.Rz5M/Cpyme	USER	Carlos 	Castillo	0	1.5	8084294497	2025-10-12 19:17:04.977	2025-10-12 19:17:34.209	pending
28	mjsaloha@gmail.com	$2b$10$1D4sLgBjvZfYsK6xiIqtPO7vGuTVg/EhKjmy8o4liKSmMRJm8VCnu	USER	Mary	Sadler	0	1.5	8087416279	2025-10-12 19:17:53.568	2025-10-12 19:19:20.172	pending
9	thaylett.808@gmail.com	$2b$10$LZxD3yro2TvR/U8ZVy9bzOjJTdEt7hV7s2JeW7Ts8cEQBJWN6qmn2	USER	Todd	Haylett 	0	1.5	\N	2025-10-12 07:17:29.224	2025-10-12 19:24:32.624	pending
14	sydneysrw@gmail.com	$2b$10$.Wj9ZBnnAKubhs07F.vKx.SN4BqeMxb0/.tDbIkuRPIOe92r0etQa	USER	Sydney	West	0	1.5	5094203195	2025-10-12 16:59:57.413	2025-10-12 19:26:29.345	pending
29	nacrahawaii@gmail.com	$2b$10$1EgnNtP2EPdFowa8cMXgvuP.P/ifDjaP2Nn4Rl/Fw9ahwn2eWbQkq	USER	Dan	Williams 	0	1.5	\N	2025-10-12 19:26:35.664	2025-10-12 19:26:53.698	pending
30	hhca13@aol.com	$2b$10$glZvrCMMhWMzPDFTxkHEkuHEFnQDT7TA4WFKF8T55bvk8tqRH8x3u	USER	Robert 	Wythes 	0	1.5	\N	2025-10-12 19:37:12.047	2025-10-12 19:37:59.07	pending
\.


--
-- TOC entry 3657 (class 0 OID 67981)
-- Dependencies: 223
-- Data for Name: UserEvent; Type: TABLE DATA; Schema: public; Owner: danport
--

COPY public."UserEvent" (id, "userId", "eventId", attended) FROM stdin;
2	3	4	t
7	3	3	t
8	17	3	t
9	13	3	t
10	18	3	t
11	19	3	t
12	20	3	t
13	5	3	t
14	22	3	t
15	11	3	t
16	23	3	t
17	15	3	t
18	26	3	t
19	27	3	t
20	28	3	t
21	9	3	t
22	14	3	t
23	29	3	t
24	30	3	t
\.


--
-- TOC entry 3649 (class 0 OID 67859)
-- Dependencies: 215
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: danport
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
06ec1c55-0762-4108-88de-baee33625e8c	dca8940add97f3bac8cb0da66c55c0e5e6ddecbf94466b455bc18eda744c46c4	2025-09-12 09:30:15.589143-10	20241128021211_add_hours_log_model	\N	\N	2025-09-12 09:30:15.588512-10	1
3a36ca5a-3849-409c-8bff-c7f2d88fa83a	4f2ca9fc31d8e69f69e9e8a2700488c3abab30bac268604f9b0aacca8c32d3ab	2025-09-12 09:30:15.554088-10	20240708195109_init	\N	\N	2025-09-12 09:30:15.539074-10	1
66d370fc-e062-4c1a-b5e0-5f71854d07af	b2ce4622f08fc1f42c994eda67ce2c9d7a82357ee8184a26f6ff8d918f5a5c3d	2025-09-12 09:30:15.558778-10	20241115200936_event	\N	\N	2025-09-12 09:30:15.554651-10	1
afc32ed2-8b09-4d85-8697-eeb8ee11efbd	0c86a78149ca2029d7185843bc4229289e3565fcaf4df66143b1076449912fe9	2025-09-12 09:30:15.561526-10	20241115202147_event	\N	\N	2025-09-12 09:30:15.559148-10	1
37df9b18-ce57-4032-a5d5-fe8feb9a99a8	4d11b7298ec647ec82fdde9062a8ca7cc9fd73b436073602a4a31e3bd7555291	2025-09-12 09:30:15.590568-10	20241128031804_add_status_to_user	\N	\N	2025-09-12 09:30:15.589597-10	1
960ab509-1162-4ead-b104-d9bdc71d6bed	bc19896f1db128250225516bea67e4458baad1f2e80c859d13adea92fe500338	2025-09-12 09:30:15.565544-10	20241119221114_events	\N	\N	2025-09-12 09:30:15.56187-10	1
a7e6595a-dfad-4119-ab9c-ab52cce30bbf	671c8797ebc2c1a8b88ecb5a6a2ab348de49598bd21a7983abb758b8258901b4	2025-09-12 09:30:15.567574-10	20241121105231_events	\N	\N	2025-09-12 09:30:15.566206-10	1
77bbfb1c-9013-4b2d-9dad-b4fd62fe0a49	e6858d8222553c0e1892bb5a26d6cd628aefc04e3bacc7adef341142f11594a8	2025-09-12 09:30:15.619967-10	20250110040956_	\N	\N	2025-09-12 09:30:15.619139-10	1
d67ce95a-5e6a-4763-97ae-ff7e11699a88	2f23e7bfccd7fd7ad1a2d7ded69092ec84619a1f8451782518039ad07e25f262	2025-09-12 09:30:15.568938-10	20241123190238_add_email_notifications	\N	\N	2025-09-12 09:30:15.567964-10	1
6f74c5d3-b0c0-4a52-8e41-920fe5316543	ae5c895f1e2a9ef3f99c46f764ce71411ca4cca5e5e6c5f544989b5b690c7633	2025-09-12 09:30:15.594888-10	20241202095721_update_event_user_relationship	\N	\N	2025-09-12 09:30:15.590823-10	1
ac204deb-b352-4bea-8be0-69255cb9661e	e632b55a2505c1401e4c91c7a3bac31d6fcf8e57a1d4b65e518c97bbb798cf59	2025-09-12 09:30:15.572047-10	20241123193234_floats	\N	\N	2025-09-12 09:30:15.569172-10	1
bf03b7d1-6542-4124-a090-59f5d2d13973	ce9c08a30ddbfba8f4e88a94f05783d60e58e98870bd0db984f579a54c46b7ad	2025-09-12 09:30:15.576758-10	20241123202733_add_billing_relation	\N	\N	2025-09-12 09:30:15.572289-10	1
22e79dab-918a-4017-ae09-490e5e411188	52ca907db1f131b0cb48d3debe148667ef034f663017d20e8cc3ff82dfa0c277	2025-09-12 09:30:15.578143-10	20241123225424_add_phone_to_user	\N	\N	2025-09-12 09:30:15.577242-10	1
009134f0-153c-4f42-a28a-b611e4bf60cf	2ff6d30e7e7a1fcb061d74804a7f3e9db28d1b28dfe4cf9c4107b33c29d579c7	2025-09-12 09:30:15.597963-10	20241203193309_init	\N	\N	2025-09-12 09:30:15.595116-10	1
afb85ecf-00d8-457c-a3c9-7f3f8083ebab	37ff5894b2bcb423c8570d768d75954bc24adf0664300754e3a149ca59305bb5	2025-09-12 09:30:15.579309-10	20241124025744_add_payment_fields	\N	\N	2025-09-12 09:30:15.578414-10	1
440dece6-a604-4972-9c08-e0547002c823	402ceff7754a85af08642256e6c14b65eeff9749fd7ceb980cc6027c3bc29ca3	2025-09-12 09:30:15.580452-10	20241125025026_add_reminders_field	\N	\N	2025-09-12 09:30:15.579542-10	1
4e05c2c6-e29f-4011-ad70-be84fa4c28b3	b2520d6afd12638bcdb21f85259faf04fa8cb230059f759d083d171f79da9116	2025-09-12 09:30:15.583843-10	20241126223840_hours	\N	\N	2025-09-12 09:30:15.580684-10	1
1a7394a1-0e5b-462e-9aff-7399cce4b5e1	6a12903f5929da731c3adcd9f40d4f762f36665e6e6d955285fcdcdd9d45cf79	2025-09-12 09:30:15.602149-10	20241203195951_events	\N	\N	2025-09-12 09:30:15.600127-10	1
768d8434-55d6-4a93-bf60-89c2bc5830a0	73532e03e16870dbfaff840eeab91b74394b4ed3fbf9a60c2e537e6ba2fec042	2025-09-12 09:30:15.588169-10	20241128020523_add_updated_at_column	\N	\N	2025-09-12 09:30:15.584354-10	1
298308a6-3de8-44de-b516-399b1be0db96	d3b5aeeb60e1750ee04dd87d485ade055e45164601b161daa83df08aa97d37a7	2025-09-12 09:30:15.621301-10	20250718174352_make_qr_optional	\N	\N	2025-09-12 09:30:15.620322-10	1
55190632-5d6a-4f32-8b90-14fc11b0c81b	f84c63defda981f01643e3dc41b2c5c0a5cca62e8c03d8ce76dc3621e55cc521	2025-09-12 09:30:15.607844-10	20241203231412_add_user_event_table	\N	\N	2025-09-12 09:30:15.602934-10	1
173fdd34-004a-4ba8-befd-413227b5b13c	20afc1be02fa43e69661632aee41bf1083504bcc4d823d758a76b5d379d1d3ed	2025-09-12 09:30:15.610776-10	20241206212840_events	\N	\N	2025-09-12 09:30:15.60812-10	1
9ed589b1-db69-41be-b610-542d6c68b954	b769fec264569bcff7b9eea1e0fe4c3481832cf76cfb4a6ad6a23b4afcc59cd1	2025-09-12 09:30:15.613347-10	20241215103159_events	\N	\N	2025-09-12 09:30:15.610998-10	1
db4ab39a-5aa1-4323-97fa-77d5df2b46ef	fe8486eeb52ef194240c11ba1a8c01893c707f1da423d7088d6e2994dbe39a45	2025-09-12 09:30:15.618801-10	20250110025423_	\N	\N	2025-09-12 09:30:15.615109-10	1
\.


--
-- TOC entry 3672 (class 0 OID 0)
-- Dependencies: 218
-- Name: Event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: danport
--

SELECT pg_catalog.setval('public."Event_id_seq"', 36, true);


--
-- TOC entry 3673 (class 0 OID 0)
-- Dependencies: 220
-- Name: HoursLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: danport
--

SELECT pg_catalog.setval('public."HoursLog_id_seq"', 23, true);


--
-- TOC entry 3674 (class 0 OID 0)
-- Dependencies: 224
-- Name: Qr_id_seq; Type: SEQUENCE SET; Schema: public; Owner: danport
--

SELECT pg_catalog.setval('public."Qr_id_seq"', 1, false);


--
-- TOC entry 3675 (class 0 OID 0)
-- Dependencies: 222
-- Name: UserEvent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: danport
--

SELECT pg_catalog.setval('public."UserEvent_id_seq"', 24, true);


--
-- TOC entry 3676 (class 0 OID 0)
-- Dependencies: 216
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: danport
--

SELECT pg_catalog.setval('public."User_id_seq"', 30, true);


--
-- TOC entry 3495 (class 2606 OID 67914)
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- TOC entry 3497 (class 2606 OID 67973)
-- Name: HoursLog HoursLog_pkey; Type: CONSTRAINT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public."HoursLog"
    ADD CONSTRAINT "HoursLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 3502 (class 2606 OID 68023)
-- Name: Qr Qr_pkey; Type: CONSTRAINT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public."Qr"
    ADD CONSTRAINT "Qr_pkey" PRIMARY KEY (id);


--
-- TOC entry 3499 (class 2606 OID 67986)
-- Name: UserEvent UserEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public."UserEvent"
    ADD CONSTRAINT "UserEvent_pkey" PRIMARY KEY (id);


--
-- TOC entry 3493 (class 2606 OID 67892)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3490 (class 2606 OID 67867)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3500 (class 1259 OID 67987)
-- Name: UserEvent_userId_eventId_key; Type: INDEX; Schema: public; Owner: danport
--

CREATE UNIQUE INDEX "UserEvent_userId_eventId_key" ON public."UserEvent" USING btree ("userId", "eventId");


--
-- TOC entry 3491 (class 1259 OID 67902)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: danport
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 3503 (class 2606 OID 67974)
-- Name: HoursLog HoursLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public."HoursLog"
    ADD CONSTRAINT "HoursLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3504 (class 2606 OID 67993)
-- Name: UserEvent UserEvent_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public."UserEvent"
    ADD CONSTRAINT "UserEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3505 (class 2606 OID 67988)
-- Name: UserEvent UserEvent_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: danport
--

ALTER TABLE ONLY public."UserEvent"
    ADD CONSTRAINT "UserEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3666 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: danport
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2025-10-12 10:48:49 HST

--
-- PostgreSQL database dump complete
--

