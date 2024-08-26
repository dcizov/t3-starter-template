CREATE TABLE IF NOT EXISTS "t3-starter-template_credentials_verification_token" (
	"id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "t3-starter-template_credentials_verification_token_email_token_pk" PRIMARY KEY("email","token")
);
