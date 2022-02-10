/// reader.rs
/// create, read, scan and delete users.
/// TODO: Update users account balance
use crate::common;
use crate::common::{email_filter, mongo_error, ApiError, Balance};
use crate::mongo::MongoDB;
use crate::session;
use crate::session::{JwtAuth, Session};
use mongodb::{bson::doc, sync::Collection};
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
    balance: Balance,
}

impl From<NewReader> for Reader {
    fn from(reader: NewReader) -> Self {
        Reader {
            email: reader.email,
            name: reader.name,
            balance: Balance::default(),
        }
    }
}

/// NewReader for adding readers
#[derive(Debug, Deserialize)]
pub struct NewReader {
    pub email: String,
    name: String,
}

/// Scan of entire readers table.
#[get("/readers")]
pub fn scan_readers(mongo_db: State<MongoDB>) -> Result<Json<Vec<Reader>>, ApiError> {
    let readers = mongo_db.get_readers_collection();
    // find with no parameters is just a scan.
    let cursor = readers.find(None, None).or_else(mongo_error)?;
    let readers_vec = cursor.map(|item| item.unwrap()).collect::<Vec<Reader>>();
    Ok(Json(readers_vec))
}

#[get("/reader/<email>")]
pub fn get_reader(mongo_db: State<MongoDB>, email: String) -> Result<Json<Reader>, ApiError> {
    let readers: Collection<Reader> = mongo_db.get_readers_collection();
    let result = readers
        .find_one(email_filter(email), None)
        .or_else(mongo_error)?;
    match result {
        Some(reader) => Ok(Json(reader)),
        None => Err(ApiError::NotFound),
    }
}

#[get("/reader")]
pub fn get_account(mongo_db: State<MongoDB>, session: Session) -> Result<Json<Reader>, ApiError> {
    get_reader(mongo_db, session.email)
}

#[post("/reader/add-balance/<email>", data = "<amount>")]
pub fn add_to_balance(
    mongo_db: State<MongoDB>,
    email: String,
    amount: Json<Balance>,
) -> Result<Status, ApiError> {
    let readers = mongo_db.get_readers_collection();
    let reader = get_reader(mongo_db, email.clone())?;
    // Add the new balance
    let updated_balance = amount.into_inner() + reader.balance;
    common::update_balance(readers, updated_balance, email)
}

#[post("/reader/sub-balance/<email>", data = "<amount>")]
pub fn sub_from_balance(
    mongo_db: State<MongoDB>,
    email: String,
    amount: Json<Balance>,
) -> Result<Status, ApiError> {
    let readers = mongo_db.get_readers_collection();
    let reader = get_reader(mongo_db, email.clone())?;
    // Verify user has enough balance to pay.
    let amount_to_subtract = amount.into_inner();
    if amount_to_subtract < reader.balance {
        return Err(ApiError::NotEnoughFunds);
    }
    let updated_balance = reader.balance - amount_to_subtract;
    common::update_balance(readers, updated_balance, email)
}

#[post("/reader/new-reader", data = "<new_reader>")]
pub fn add_reader(
    mongo_db: State<MongoDB>,
    new_reader: Json<NewReader>,
    reader_auth: JwtAuth,
    mut cookies: Cookies,
) -> Result<Status, ApiError> {
    let readers = mongo_db.get_readers_collection();
    let reader = new_reader.into_inner();
    if reader_auth.email != reader.email {
        // Tried to create a user that didn't match authorization.
        return Err(ApiError::AuthorizationError);
    }
    let email = reader.email.clone();
    match readers.insert_one(Reader::from(reader), None) {
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
                // Reader collection has a unique email index.
                // Will error on duplicate email address.
                ErrorKind::Write(_) => Err(ApiError::UserAlreadyExists),
                _ => Err(ApiError::MongoDBError),
            }
        }
    }
}

#[delete("/reader/<email>")]
pub fn delete_reader(mongo_db: State<MongoDB>, email: String) -> Result<Status, ApiError> {
    let readers = mongo_db.get_readers_collection();
    let result = readers.find_one_and_delete(email_filter(email), None);
    match result {
        Ok(_) => Ok(Status::Ok),
        Err(_) => Err(ApiError::MongoDBError),
    }
}
