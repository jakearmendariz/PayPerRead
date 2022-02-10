/// session.rs
/// Maintains sessions on the backend.
use crate::common::{mongo_error, ApiError};
use crate::mongo::MongoDB;
use crate::publisher::get_publisher;
use crate::reader::get_reader;
use mongodb::{
    bson::{doc, DateTime},
    sync::Collection,
};
use rand::{distributions::Alphanumeric, Rng};
use rocket::{
    http::{Cookie, Cookies, Status},
    request::{self, FromRequest, Outcome, Request},
    State,
};
use serde::{Deserialize, Serialize};

static SESSION_COOKIE_STR: &str = "Session";
static GOOGLE_TOKEN_AUTH: &str = "https://oauth2.googleapis.com/tokeninfo?id_token=";

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
        let mongo_db = match request.guard::<State<MongoDB>>() {
            Outcome::Success(mongo_db) => mongo_db.inner(),
            _ => return Outcome::Failure((Status::NotFound, ApiError::NotFound)),
        };
        let sessions = mongo_db.get_session_collection();
        let token = match cookies.get(SESSION_COOKIE_STR) {
            Some(cookie) => cookie.value(),
            None => return Outcome::Failure((Status::NotFound, ApiError::NotFound)),
        };
        match sessions.find_one(doc! {"token": token}, None) {
            Ok(result) => match result {
                Some(session) => Outcome::Success(session),
                None => Outcome::Failure((Status::NotFound, ApiError::NotFound)),
            },
            Err(_) => Outcome::Failure((Status::InternalServerError, ApiError::MongoDBError)),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JwtAuth {
    pub email: String,
}

impl<'r, 'a> FromRequest<'r, 'a> for JwtAuth {
    type Error = ApiError;
    /// Request guard for JWT authorization, verifies JWT with google.
    fn from_request(request: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        let headers = request.headers();
        let jwt = match headers.get("Authorization").next() {
            Some(jwt) => jwt,
            None => return Outcome::Failure((Status::BadRequest, ApiError::AuthorizationError)),
        };
        let google_response = reqwest::blocking::get(format!("{}{}", GOOGLE_TOKEN_AUTH, jwt))
            .map_err(|_| (Status::Unauthorized, ApiError::AuthorizationError))?;
        let reader: JwtAuth = google_response
            .json()
            .map_err(|_| (Status::InternalServerError, ApiError::InternalServerError))?;
        Outcome::Success(reader)
    }
}

/// Creates a session token for the provided email
/// inside of the session collection in mongodb. Returns
/// a cookie with the email and session cookie.
pub fn create_session<'a>(
    sessions: Collection<Session>,
    email: String,
) -> Result<Cookie<'a>, ApiError> {
    let session = Session::new(email);
    sessions
        .insert_one(session.clone(), None)
        .or_else(mongo_error)?;
    Ok(Cookie::build(SESSION_COOKIE_STR, session.token)
        .http_only(true)
        .max_age(time::Duration::hours(1))
        .path("/")
        .finish())
}

/// Logs you in and creates a session for the user
#[get("/login/reader")]
pub fn login(
    mongo_db: State<MongoDB>,
    reader: JwtAuth,
    cookies: Cookies,
) -> Result<Status, ApiError> {
    // Verify that the user we are looking up exists.
    let sessions = mongo_db.get_session_collection();
    get_reader(mongo_db, reader.email.clone())?;
    // Create cookie, save and return.
    start_session(sessions, reader.email, cookies)
}

#[get("/login/publisher")]
pub fn login_publisher(
    mongo_db: State<MongoDB>,
    publisher_auth: JwtAuth,
    cookies: Cookies,
) -> Result<Status, ApiError> {
    // Verify that the user we are looking up exists.
    let sessions = mongo_db.get_session_collection();
    get_publisher(mongo_db, publisher_auth.email.clone())?;
    // Create cookie, save and return.
    start_session(sessions, publisher_auth.email, cookies)
}

fn start_session<'a>(
    sessions: Collection<Session>,
    email: String,
    mut cookies: Cookies,
) -> Result<Status, ApiError> {
    let cookie = create_session(sessions, email)?;
    cookies.add(cookie);
    Ok(Status::Ok)
}

/// If the user has a valid session cookie, then return their email.
#[get("/cookies")]
pub fn check_cookies(session: Session) -> String {
    session.email
}
