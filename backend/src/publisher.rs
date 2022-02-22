use crate::articles::ArticleGuid;
use crate::common::{email_filter, mongo_error, ApiError, Balance};
use crate::mongo::MongoDB;
use crate::session;
use crate::session::{JwtAuth, Session};
use mongodb::bson::doc;
use rocket::http::{Cookies, Status};
use rocket::State;
use rocket_contrib::json::Json;
use serde::{Deserialize, Serialize};

/// Publisher provides the contents viewed by readers
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Publisher {
    pub email: String,
    name: String,
    domain: String,
    pub balance: Balance,
    pub articles: Vec<ArticleGuid>,
}

impl MongoDB {
    pub fn find_publisher(&self, email: &str) -> Result<Publisher, ApiError> {
        self.publishers
            .find_one(email_filter(email), None)
            .or_else(mongo_error)?
            .ok_or(ApiError::UserNotFound)
    }
}

impl From<NewPublisher> for Publisher {
    fn from(publisher: NewPublisher) -> Self {
        Publisher {
            email: publisher.email,
            name: publisher.name,
            domain: publisher.domain,
            balance: Balance::default(),
            articles: Vec::new(),
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
    // find with no parameters is just a scan.
    let cursor = mongo_db.publishers.find(None, None).or_else(mongo_error)?;
    let publishers_vec = cursor.map(|item| item.unwrap()).collect::<Vec<Publisher>>();
    Ok(Json(publishers_vec))
}

#[get("/publisher")]
pub fn get_account(
    mongo_db: State<MongoDB>,
    session: session::Session,
) -> Result<Json<Publisher>, ApiError> {
    Ok(Json(mongo_db.find_publisher(&session.email)?))
}

#[get("/publisher/<email>")]
pub fn publisher_exists(mongo_db: State<MongoDB>, email: String) -> Result<Status, ApiError> {
    mongo_db.find_publisher(&email)?;
    Ok(Status::Ok)
}

#[post("/publisher/new-publisher", data = "<new_publisher>")]
pub fn add_publisher(
    mongo_db: State<MongoDB>,
    new_publisher: Json<NewPublisher>,
    publisher_auth: JwtAuth,
    cookies: Cookies,
) -> Result<Status, ApiError> {
    let publisher = new_publisher.into_inner();
    if publisher_auth.email != publisher.email {
        // Didn't match auth.
        return Err(ApiError::AuthorizationError);
    }
    let email = publisher.email.clone();
    match mongo_db
        .publishers
        .insert_one(Publisher::from(publisher), None)
    {
        Ok(_) => {
            mongo_db.start_session(email, cookies)?;
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

#[delete("/publisher")]
pub fn delete_publisher(mongo_db: State<MongoDB>, session: Session) -> Result<Status, ApiError> {
    let result = mongo_db
        .publishers
        .find_one_and_delete(email_filter(&session.email), None);
    match result {
        Ok(_) => Ok(Status::Ok),
        Err(_) => Err(ApiError::MongoDBError),
    }
}
