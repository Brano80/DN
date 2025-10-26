CREATE TYPE "public"."audit_action_type" AS ENUM('MANDATE_CREATED', 'MANDATE_ACCEPTED', 'MANDATE_REJECTED', 'MANDATE_REVOKED', 'USER_LOGIN', 'USER_LOGOUT', 'COMPANY_CONNECTED', 'SECURITY_SETTINGS_UPDATED', 'DOCUMENT_UPLOADED', 'DOCUMENT_SIGNED');--> statement-breakpoint
CREATE TYPE "public"."company_status" AS ENUM('active', 'inactive', 'pending_verification', 'verification_failed');--> statement-breakpoint
CREATE TYPE "public"."mandate_rozsah_opravneni" AS ENUM('samostatne', 'spolocne_s_inym', 'obmedzene');--> statement-breakpoint
CREATE TYPE "public"."mandate_status" AS ENUM('active', 'inactive', 'pending_confirmation', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."participant_status" AS ENUM('INVITED', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."signature_status" AS ENUM('PENDING', 'SIGNED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"action_type" "audit_action_type" NOT NULL,
	"details" text NOT NULL,
	"user_id" varchar NOT NULL,
	"company_id" varchar
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ico" varchar(10) NOT NULL,
	"dic" varchar(12),
	"ic_dph" varchar(15),
	"nazov" varchar(255) NOT NULL,
	"sidlo_ulica" varchar(255),
	"sidlo_cislo" varchar(50),
	"sidlo_mesto" varchar(255),
	"sidlo_psc" varchar(20),
	"registracny_sud" varchar(255),
	"cislo_vlozky" varchar(255),
	"datum_zapisu" date,
	"pravna_forma" varchar(255),
	"stat" varchar(2) DEFAULT 'SK' NOT NULL,
	"stav" "company_status" DEFAULT 'pending_verification' NOT NULL,
	"last_verified_at" timestamp with time zone,
	"enforce_two_factor_auth" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_ico_unique" UNIQUE("ico")
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"owner_email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_company_mandates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"company_id" varchar NOT NULL,
	"rola" varchar(255) NOT NULL,
	"rozsah_opravneni" "mandate_rozsah_opravneni" NOT NULL,
	"platny_od" date NOT NULL,
	"platny_do" date,
	"zdroj_overenia" varchar(255) DEFAULT 'OR SR Mock' NOT NULL,
	"stav" "mandate_status" DEFAULT 'pending_confirmation' NOT NULL,
	"is_verified_by_kep" boolean DEFAULT false NOT NULL,
	"invitation_context" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"is_two_factor_auth_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_auth_secret" text,
	"two_factor_auth_method" varchar(10),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "virtual_office_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"virtual_office_id" varchar NOT NULL,
	"contract_id" varchar NOT NULL,
	"uploaded_by_id" varchar NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virtual_office_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"virtual_office_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"user_company_mandate_id" varchar,
	"required_role" text,
	"required_company_ico" text,
	"status" "participant_status" DEFAULT 'INVITED' NOT NULL,
	"invitation_context" varchar(50),
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "virtual_office_signatures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"virtual_office_document_id" varchar NOT NULL,
	"participant_id" varchar NOT NULL,
	"status" "signature_status" DEFAULT 'PENDING' NOT NULL,
	"signed_at" timestamp,
	"signature_data" text,
	"user_company_mandate_id" varchar
);
--> statement-breakpoint
CREATE TABLE "virtual_offices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_by_id" varchar NOT NULL,
	"owner_company_id" varchar,
	"status" text DEFAULT 'active' NOT NULL,
	"process_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_company_mandates" ADD CONSTRAINT "user_company_mandates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_company_mandates" ADD CONSTRAINT "user_company_mandates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_office_documents" ADD CONSTRAINT "virtual_office_documents_virtual_office_id_virtual_offices_id_fk" FOREIGN KEY ("virtual_office_id") REFERENCES "public"."virtual_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_office_documents" ADD CONSTRAINT "virtual_office_documents_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_office_documents" ADD CONSTRAINT "virtual_office_documents_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_office_participants" ADD CONSTRAINT "virtual_office_participants_virtual_office_id_virtual_offices_id_fk" FOREIGN KEY ("virtual_office_id") REFERENCES "public"."virtual_offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_office_participants" ADD CONSTRAINT "virtual_office_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_office_participants" ADD CONSTRAINT "virtual_office_participants_user_company_mandate_id_user_company_mandates_id_fk" FOREIGN KEY ("user_company_mandate_id") REFERENCES "public"."user_company_mandates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_office_signatures" ADD CONSTRAINT "virtual_office_signatures_virtual_office_document_id_virtual_office_documents_id_fk" FOREIGN KEY ("virtual_office_document_id") REFERENCES "public"."virtual_office_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_office_signatures" ADD CONSTRAINT "virtual_office_signatures_participant_id_virtual_office_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."virtual_office_participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_office_signatures" ADD CONSTRAINT "virtual_office_signatures_user_company_mandate_id_user_company_mandates_id_fk" FOREIGN KEY ("user_company_mandate_id") REFERENCES "public"."user_company_mandates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_offices" ADD CONSTRAINT "virtual_offices_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_offices" ADD CONSTRAINT "virtual_offices_owner_company_id_companies_id_fk" FOREIGN KEY ("owner_company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;