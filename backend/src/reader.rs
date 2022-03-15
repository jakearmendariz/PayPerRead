use crate::articles::ArticleGuid;
/// reader.rs
/// create, read, scan and delete users.
/// TODO: Update users account balance
use crate::common::{email_filter, mongo_error, update_balance, ApiError, Balance};
use crate::mongo::MongoDB;
use crate::session::{JwtAuth, Session};
use mongodb::bson::doc;
use rocket::{
    http::{Cookies, Status},
    State,
};
use rocket_contrib::json::Json;
use serde::{Deserialize, Serialize};

/// Reader represents a user on the site.
/// Going to leave the credit card and other private information in another struct.
#[derive(Debug, Serialize, Deserialize)]
pub struct Reader {
    pub email: String,
    name: String,
    pub balance: Balance,
    articles: Vec<ArticleGuid>,
}

impl From<NewReader> for Reader {
    fn from(reader: NewReader) -> Self {
        Reader {
            email: reader.email,
            name: reader.name,
            balance: Balance::default(),
            articles: Vec::new(),
        }
    }
}

/// NewReader for adding readers
#[derive(Debug, Deserialize)]
pub struct NewReader {
    pub email: String,
    name: String,
}

impl Reader {
    /// Does the reader own the article
    pub fn owns_article(&self, article_guid: &str) -> bool {
        self.articles.contains(&article_guid.to_string())
    }
}

impl MongoDB {
    pub fn find_reader(&self, email: &str) -> Result<Reader, ApiError> {
        self.readers
            .find_one(email_filter(email), None)
            .or_else(mongo_error)?
            .ok_or(ApiError::UserNotFound)
    }
}

/// Scan of entire readers table.
/// Only for debugging/testing purposes
#[get("/readers")]
pub fn scan_readers(mongo_db: State<MongoDB>) -> Result<Json<Vec<Reader>>, ApiError> {
    // find with no parameters is just a scan.
    let cursor = mongo_db.readers.find(None, None).or_else(mongo_error)?;
    let readers_vec = cursor.map(|item| item.unwrap()).collect::<Vec<Reader>>();
    Ok(Json(readers_vec))
}

#[get("/reader/<email>")]
pub fn reader_exists(mongo_db: State<MongoDB>, email: String) -> Result<Status, ApiError> {
    // Verify that a reader exists, do not return reader
    mongo_db.find_reader(&email)?;
    Ok(Status::Ok)
}

#[get("/reader/account")]
pub fn get_account(mongo_db: State<MongoDB>, session: Session) -> Result<Json<Reader>, ApiError> {
    Ok(Json(mongo_db.find_reader(&session.email)?))
}

#[post("/reader/new-reader", data = "<new_reader>")]
pub fn add_reader(
    mongo_db: State<MongoDB>,
    new_reader: Json<NewReader>,
    reader_auth: JwtAuth,
    cookies: Cookies,
) -> Result<Status, ApiError> {
    let reader = new_reader.into_inner();
    if reader_auth.email != reader.email {
        // Tried to create a user that didn't match authorization.
        return Err(ApiError::AuthorizationError);
    }
    let email = reader.email.clone();
    let mut reader = Reader::from(reader);
    reader.balance = Balance::new(5, 0);
    match mongo_db.readers.insert_one(reader, None) {
        Ok(_) => {
            mongo_db.start_session(email, cookies)?;
            Ok(Status::Created)
        }
        Err(e) => {
            use mongodb::error::ErrorKind;
            match *e.kind {
                // Reader collection has a unique email index.
                // Will error on duplicate email address.
                ErrorKind::Write(_) => Err(ApiError::UserAlreadyExists),
                _ => Err(ApiError::MongoDBError),
            }
        }
    }
}

#[delete("/reader")]
pub fn delete_reader(mongo_db: State<MongoDB>, session: Session) -> Result<Status, ApiError> {
    let result = mongo_db
        .readers
        .find_one_and_delete(email_filter(&session.email), None);
    match result {
        Ok(_) => Ok(Status::Ok),
        Err(_) => Err(ApiError::MongoDBError),
    }
}

#[derive(Debug, Deserialize)]
pub struct StripePayment {
    pub id: String,
    pub dollars: u32,
    pub cents: u32,
}

impl From<StripePayment> for Balance {
    fn from(stripe: StripePayment) -> Self {
        Balance::new(stripe.dollars, stripe.cents)
    }
}
// curl https://api.stripe.com/v1/charges \
// -u sk_test_4eC39HqLyjWDarjtT1zdp7dc: \
// -d "amount"=999 \                   
// -d "currency"="usd" \   
// -d "description"="Example charge" \
// -d "source"="tok_1KdeJ72eZvKYlo2CPdJnqNfQ" \
// -d "statement_descriptor"="Custom descriptor"
fn stripe_payment_body(amount: Balance, token: String) -> String {
    // format!("{{\"amount\":{}, \"currency\":\"usd\", \"source\":\"tok_visa\"}}", amount.to_stripe())
    format!("{{\"amount\":{}, \"currency\":\"usd\", \"source\":\"{}\"}}", amount.to_stripe(), token)
}

/*
curl https://api.stripe.com/v1/charges \
-u sk_test_4eC39HqLyjWDarjtT1zdp7dc: \
--data {amount:999, currency}

*/

#[post("/reader/add-balance", data = "<add_balance>")]
pub fn add_to_balance(
    mongo_db: State<MongoDB>,
    session: Session,
    add_balance: Json<StripePayment>,
) -> Result<Status, ApiError> {
    let reader = mongo_db.find_reader(&session.email)?;
    let stripe_payment = add_balance.into_inner();
    println!("TOKEN {}", &stripe_payment.id);
    let client = reqwest::blocking::Client::builder()
        .user_agent("sk_test_4eC39HqLyjWDarjtT1zdp7dc")
        .build()
        .unwrap();
    let token = stripe_payment.id.clone();
    let payment_amount = Balance::from(stripe_payment);
    /*curl https://api.stripe.com/v1/payment_intents \
    -u sk_test_4eC39HqLyjWDarjtT1zdp7dc: \
    -d "amount"=1099 \
    -d "currency"="usd" \
    -d "payment_method_types[]"="card"
    */
    let stripe_response =  client.post("https://api.stripe.com/v1/payment_intents")
        .body("{amount: 10, currency: usd, payment_method_types[]: card}")
        .send();
    // let stripe_response = client
    //     .post("https://api.stripe.com/v1/charges")
    //     .header("Authorization", "Basic ".to_owned() + "sk_test_4eC39HqLyjWDarjtT1zdp7dc")
    //     .body(stripe_payment_body(payment_amount, token))
    //     .send();
    match stripe_response {
        Ok(response) => {
            if !response.status().is_success() {
                println!("Error not successful {:?}", response.text());
                return Err(ApiError::AuthorizationError);
            }
        }
        Err(_) => {
            return Err(ApiError::AuthorizationError);
        }
    };
    let updated_balance = reader.balance + payment_amount;
    update_balance(&mongo_db.readers, updated_balance, &session.email)
}

// ACCEPTING STRIPE PAYMENTS
// Create a token for a given user
// curl https://api.stripe.com/v1/tokens \
//   -u sk_test_4eC39HqLyjWDarjtT1zdp7dc: \
//   -d "card[number]"=4242424242424242 \
//   -d "card[exp_month]"=3 \
//   -d "card[exp_year]"=2023 \
//   -d "card[cvc]"=314

// curl https://api.stripe.com/v1/charges \
// -u sk_test_4eC39HqLyjWDarjtT1zdp7dc: \
// -d "amount"=999 \
// -d "currency"="usd" \
// -d "description"="Example charge" \
// -d "source"="tok_visa" \
// -d "statement_descriptor"="Custom descriptor"

// use stripe;

// fn stripe_shit(stripe_payment: StripePayment) {
//     let token = "tok_ID_FROM_CHECKOUT".parse().unwrap();
//     let mut params = stripe::CreateCharge::new();
//     // NOTE: Stripe represents currency in the lowest denominations (e.g. cents)
//     params.amount = Some(1095); // e.g. $10.95
//     params.source = Some(stripe::ChargeSourceParams::Token(token));
// }

// #[post("/reader/stipe/add-balance", data = "<add_balance>")]
// pub fn stripe_auth(
//     mongo_db: State<MongoDB>,
//     session: Session,
//     add_balance: Json<Balance>,
// ) -> Result<Status, ApiError> {
//     let reader = mongo_db.find_reader(&session.email)?;
//     let additional_balance = add_balance.into_inner();
//     let updated_balance = reader.balance + additional_balance;
//     update_balance(&mongo_db.readers, updated_balance, &session.email)
// }

// Hi,
// I am the Product Owner for PayPerRead, and I was wondering if you were open to switching presentation times with me? My group is scheduled to present at 8:30 am on Wednesday, however, another teammate and I have a final at this time.

// Please let me know if you can, we would really appreciate it.

// Cheers,
// Jake
