/// reader.rs
/// create, read, scan and delete users.
/// TODO: Update users account balance
use crate::common;
use crate::common::{email_filter, mongo_error, ApiError, Balance};
use crate::mongo::MongoDB;
use mongodb::bson::doc;
use mongodb::sync::Collection;
use rocket::http::Status;
use rocket::State;
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
    email: String,
    name: String,
}

/// Scan of entire readers table.
#[get("/readers")]
pub fn scan_readers(mongo_db: State<MongoDB>) -> Result<Json<Vec<Reader>>, ApiError> {
    let readers = mongo_db.get_collection_from_user_db::<Reader>("Readers");
    // find with no parameters is just a scan.
    let cursor = readers.find(None, None).or_else(mongo_error)?;
    let readers_vec = cursor.map(|item| item.unwrap()).collect::<Vec<Reader>>();
    Ok(Json(readers_vec))
}

#[get("/reader/<email>")]
pub fn get_reader(mongo_db: State<MongoDB>, email: String) -> Result<Json<Reader>, ApiError> {
    let readers: Collection<Reader> = mongo_db.get_collection_from_user_db::<Reader>("Readers");
    let result = readers
        .find_one(email_filter(email), None)
        .or_else(mongo_error)?;
    match result {
        Some(reader) => Ok(Json(reader)),
        None => Err(ApiError::NotFound),
    }
}

#[post("/add-balance/<email>", data = "<amount>")]
pub fn add_to_balance(
    mongo_db: State<MongoDB>,
    email: String,
    amount: Json<Balance>,
) -> Result<Status, ApiError> {
    let readers = mongo_db.get_collection_from_user_db::<Reader>("Readers");
    // Find reader
    let reader = get_reader(mongo_db, email.clone())?;
    // Add the new balance
    let updated_balance = amount.into_inner() + reader.balance;
    common::update_balance(readers, updated_balance, email)
}

#[post("/sub-balance/<email>", data = "<amount>")]
pub fn sub_from_balance(
    mongo_db: State<MongoDB>,
    email: String,
    amount: Json<Balance>,
) -> Result<Status, ApiError> {
    let readers = mongo_db.get_collection_from_user_db::<Reader>("Readers");
    let reader = get_reader(mongo_db, email.clone())?;
    // Verify user has enough balance to pay.
    let amount_to_subtract = amount.into_inner();
    if amount_to_subtract < reader.balance {
        return Err(ApiError::NotEnoughFunds);
    }
    let updated_balance = reader.balance - amount_to_subtract;
    common::update_balance(readers, updated_balance, email)
}

#[post("/new-reader", data = "<reader>")]
pub fn add_reader(mongo_db: State<MongoDB>, reader: Json<NewReader>) -> Result<Status, ApiError> {
    let readers = mongo_db.get_collection_from_user_db::<Reader>("Readers");
    match readers
        .find_one(email_filter(reader.email.clone()), None)
        .or_else(mongo_error)?
    {
        Some(_) => return Err(ApiError::UserAlreadyExists),
        None => (),
    };
    match readers.insert_one(Reader::from(reader.into_inner()), None) {
        Ok(_) => Ok(Status::Created),
        Err(_) => Err(ApiError::MongoDBError),
    }
}

#[delete("/reader/<email>")]
pub fn delete_reader(mongo_db: State<MongoDB>, email: String) -> Result<Status, ApiError> {
    let readers = mongo_db.get_collection_from_user_db::<Reader>("Readers");
    let result = readers.find_one_and_delete(email_filter(email), None);
    match result {
        Ok(_) => Ok(Status::Ok),
        Err(_) => Err(ApiError::MongoDBError),
    }
}
