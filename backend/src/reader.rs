use crate::articles::ArticleGuid;
/// reader.rs
/// create, read, scan and delete users.
/// TODO: Update users account balance
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
    pub fn owns_article(self, article_guid: String) -> bool {
        self.articles.contains(&article_guid)
    }
}

/// Scan of entire readers table.
/// Only for debugging/testing purposes
#[get("/readers")]
pub fn scan_readers(mongo_db: State<MongoDB>) -> Result<Json<Vec<Reader>>, ApiError> {
    let readers = mongo_db.get_readers_collection();
    // find with no parameters is just a scan.
    let cursor = readers.find(None, None).or_else(mongo_error)?;
    let readers_vec = cursor.map(|item| item.unwrap()).collect::<Vec<Reader>>();
    Ok(Json(readers_vec))
}

pub fn find_reader(readers: Collection<Reader>, email: String) -> Result<Reader, ApiError> {
    readers
        .find_one(email_filter(email), None)
        .or_else(mongo_error)?
        .ok_or(ApiError::UserNotFound)
}

#[get("/reader")]
pub fn get_account(mongo_db: State<MongoDB>, session: Session) -> Result<Json<Reader>, ApiError> {
    let readers: Collection<Reader> = mongo_db.get_readers_collection();
    Ok(Json(find_reader(readers, session.email)?))
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

#[delete("/reader")]
pub fn delete_reader(mongo_db: State<MongoDB>, session: Session) -> Result<Status, ApiError> {
    let readers = mongo_db.get_readers_collection();
    let result = readers.find_one_and_delete(email_filter(session.email), None);
    match result {
        Ok(_) => Ok(Status::Ok),
        Err(_) => Err(ApiError::MongoDBError),
    }
}
