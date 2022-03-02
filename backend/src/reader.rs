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
    match mongo_db.readers.insert_one(Reader::from(reader), None) {
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

#[post("/reader/add-balance", data = "<add_balance>")]
pub fn add_to_balance(
    mongo_db: State<MongoDB>,
    session: Session,
    add_balance: Json<Balance>,
) -> Result<Status, ApiError> {
    let reader = mongo_db.find_reader(&session.email)?;
    let additional_balance = add_balance.into_inner();
    let updated_balance = reader.balance + additional_balance;
    update_balance(&mongo_db.readers, updated_balance, &session.email)
}
