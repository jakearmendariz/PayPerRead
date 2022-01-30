/// session.rs
/// Maintains sessions on the backend.
use crate::common::{mongo_error, ApiError};
use crate::mongo::MongoDB;
use crate::reader::get_reader;
use mongodb::{
    bson::{doc, DateTime},
    sync::{Client, Collection},
};
use rand::{distributions::Alphanumeric, Rng};
use rocket::{
    http::{Cookie, Cookies, Status},
    request::{self, FromRequest, Outcome, Request},
    State,
};
use serde::{Deserialize, Serialize};

lazy_static::lazy_static! {
    static ref CLIENT: Client = Client::with_uri_str(dotenv!("MONGO_URI")).expect("Mongo client connection");
    /// Connection to mongodb session collection.
    static ref MONGO_SESSIONS:Collection<Session> = CLIENT.database("Users").collection("Sessions");
}

/// Session for keeping users logged in.
/// Browsers store the token, and the table of sessions
/// is indexed at the token.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Session {
    pub email: String,
    // Sessions expire X seconds after creation for security purposes.
    created_at: DateTime,
    pub token: String,
}

impl Session {
    /// Builds a new session obj for a user.
    fn new(email: String) -> Self {
        let token: String = rand::thread_rng()
            .sample_iter(&Alphanumeric)
            .take(12)
            .map(char::from)
            .collect();
        Session {
            email,
            created_at: DateTime::now(),
            token,
        }
    }
}

impl<'r, 'a> FromRequest<'r, 'a> for Session {
    type Error = ApiError;
    /// Request guard for sessions, returning a 404 if session isn't there or expired.
    fn from_request(request: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        let cookies = request.cookies();
        let token = match cookies.get("Session") {
            Some(cookie) => cookie.value(),
            None => return Outcome::Failure((Status::NotFound, ApiError::NotFound)),
        };
        match MONGO_SESSIONS.find_one(doc! {"token": token}, None) {
            Ok(result) => match result {
                Some(session) => Outcome::Success(session),
                None => Outcome::Failure((Status::NotFound, ApiError::NotFound)),
            },
            Err(_) => Outcome::Failure((Status::InternalServerError, ApiError::MongoDBError)),
        }
    }
}

/// Creates a session token for the provided email
/// inside of the session collection in mongodb. Returns
/// a cookie with the email and session cookie.
pub fn create_session<'a>(email: String) -> Result<Cookie<'a>, ApiError> {
    let session = Session::new(email);
    MONGO_SESSIONS
        .insert_one(session.clone(), None)
        .or_else(mongo_error)?;
    Ok(Cookie::build("Session", session.token)
        .http_only(true)
        .path("/")
        .finish())
}

/// Logs you in and creates a session for the user
#[get("/login/<email>")]
pub fn login(
    mongo_db: State<MongoDB>,
    email: String,
    mut cookies: Cookies,
) -> Result<Status, ApiError> {
    // Verify that the user we are looking up exists.
    get_reader(mongo_db, email.clone())?;
    // Create cookie, save and return.
    let cookie = create_session(email)?;
    cookies.add(cookie);
    Ok(Status::Ok)
}

/// If the user has a valid session cookie, then return their email.
#[get("/cookies")]
pub fn check_cookies(session: Session) -> String {
    session.email
}
