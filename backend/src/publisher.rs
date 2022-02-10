use crate::common;
use crate::common::{email_filter, mongo_error, ApiError, Balance};
use crate::mongo::MongoDB;
use crate::session;
use mongodb::bson::doc;
use mongodb::sync::Collection;
use rocket::http::{Cookies, Status};
use rocket::State;
use rocket_contrib::json::Json;
use serde::{Deserialize, Serialize};

/// Publisher provides the contents viewed by readers
#[derive(Debug, Serialize, Deserialize)]
pub struct Publisher {
    pub email: String,
    name: String,
    domain: String,
    balance: Balance,
}

impl From<NewPublisher> for Publisher {
    fn from(publisher: NewPublisher) -> Self {
        Publisher {
            email: publisher.email,
            name: publisher.name,
            domain: publisher.domain,
            balance: Balance::default(),
        }
    }
}

/// For adding Publishers
#[derive(Debug, Deserialize)]
pub struct NewPublisher {
    email: String,
    name: String,
    domain: String,
}

/// Scan of entire publishers table.
#[get("/publishers")]
pub fn scan_publishers(mongo_db: State<MongoDB>) -> Result<Json<Vec<Publisher>>, ApiError> {
    let publishers = mongo_db.get_publishers_collection();
    // find with no parameters is just a scan.
    let cursor = publishers.find(None, None).or_else(mongo_error)?;
    let publishers_vec = cursor.map(|item| item.unwrap()).collect::<Vec<Publisher>>();
    Ok(Json(publishers_vec))
}

#[get("/publisher/<email>")]
pub fn get_publisher(mongo_db: State<MongoDB>, email: String) -> Result<Json<Publisher>, ApiError> {
    let publishers: Collection<Publisher> = mongo_db.get_publishers_collection();
    let result = publishers
        .find_one(email_filter(email), None)
        .or_else(mongo_error)?;
    match result {
        Some(publisher) => Ok(Json(publisher)),
        None => Err(ApiError::NotFound),
    }
}

#[get("/publisher")]
pub fn get_account(
    mongo_db: State<MongoDB>,
    session: session::Session,
) -> Result<Json<Publisher>, ApiError> {
    get_publisher(mongo_db, session.email)
}

#[post("/publisher/add-balance/<email>", data = "<amount>")]
pub fn add_to_balance(
    mongo_db: State<MongoDB>,
    email: String,
    amount: Json<Balance>,
) -> Result<Status, ApiError> {
    let publishers = mongo_db.get_publishers_collection();
    let publisher = get_publisher(mongo_db, email.clone())?;
    let updated_balance = amount.into_inner() + publisher.balance;
    common::update_balance(publishers, updated_balance, email)
}

#[post("/publisher/clear-balance/<email>")]
pub fn clear_balance(mongo_db: State<MongoDB>, email: String) -> Result<Status, ApiError> {
    let publishers = mongo_db.get_publishers_collection();
    let updated_balance = Balance::default();
    common::update_balance(publishers, updated_balance, email)
}

#[post("/publisher/new-publisher", data = "<publisher>")]
pub fn add_publisher(
    mongo_db: State<MongoDB>,
    publisher: Json<NewPublisher>,
    mut cookies: Cookies,
) -> Result<Status, ApiError> {
    let publishers = mongo_db.get_publishers_collection();
    let email = publisher.email.clone();
    match publishers.insert_one(Publisher::from(publisher.into_inner()), None) {
        Ok(_) => {
            cookies.add(session::create_session(
                mongo_db.get_session_collection(),
                email,
            )?);
            Ok(Status::Created)
        }
        Err(e) => {
            use mongodb::error::ErrorKind;
            match *e.kind {
                ErrorKind::Write(_) => Err(ApiError::UserAlreadyExists),
                _ => Err(ApiError::MongoDBError),
            }
        }
    }
}

#[delete("/publisher/<email>")]
pub fn delete_publisher(mongo_db: State<MongoDB>, email: String) -> Result<Status, ApiError> {
    let publishers = mongo_db.get_publishers_collection();
    let result = publishers.find_one_and_delete(email_filter(email), None);
    match result {
        Ok(_) => Ok(Status::Ok),
        Err(_) => Err(ApiError::MongoDBError),
    }
}
