use crate::common::ApiError;
use lettre::smtp::authentication::Credentials;
use lettre::{SmtpClient, Transport};
use lettre_email::EmailBuilder;
use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct EmailForm {
    name: String,
    email: String,
    message: String,
}

impl EmailForm {
    fn display(self) -> String {
        format!(
            "<h2>Email from {} {}</h2><p>{}</p>",
            self.name, self.email, self.message
        )
    }
}

#[post("/email", data = "<email_json>")]
pub fn email(email_json: Json<EmailForm>) -> Result<(), ApiError> {
    let email_form = email_json.into_inner();
    let email_body = email_form.display();
    let email = EmailBuilder::new()
        .to(dotenv!("RECIEPIENT_EMAIL"))
        .from(dotenv!("SENDER_EMAIL"))
        .subject("PayPerRead Email")
        .html(email_body)
        .build()
        .unwrap();

    let mut mailer = SmtpClient::new_simple("smtp.gmail.com")
        .unwrap()
        .credentials(Credentials::new(
            dotenv!("SENDER_USERNAME").into(),
            dotenv!("SENDER_PASSWORD").into(),
        ))
        .transport();

    let result = mailer.send(email.into());

    println!("{:?}", result);
    Ok(())
}
