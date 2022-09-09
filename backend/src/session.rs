/// session.rs
/// Maintains sessions on the backend.
use crate::common::{mongo_error, random_string, ApiError};
use crate::mongo::MongoDB;
use mongodb::bson::{doc, DateTime};
use rocket::{
    http::{Cookie, CookieJar, Status},
    request::{self, FromRequest, Outcome, Request},
    State,
};
use serde::{Deserialize, Serialize};

static SESSION_COOKIE_STR: &str = "Session";
static GOOGLE_TOKEN_AUTH: &str = "https://oauth2.googleapis.com/tokeninfo?id_token=";
static COOKIE_LIFETIME_IN_HOURS: i64 = 1;

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
        let token = random_string(12);
        Session {
            email,
            created_at: DateTime::now(),
            token,
        }
    }
}

/// Logs you in and creates a session for the user
#[get("/login/reader")]
pub fn login_reader(
    mongo_db: &State<MongoDB>,
    reader: JwtAuth,
    cookies: &CookieJar<'_>,
) -> Result<Status, ApiError> {
    println!("In Function");
    // Verify that the user we are looking up exists.
    mongo_db.find_reader(&reader.email)?;
    // Create cookie, save and return.
    mongo_db.start_session(reader.email, cookies)
}

#[get("/login/publisher")]
pub fn login_publisher(
    mongo_db: &State<MongoDB>,
    publisher_auth: JwtAuth,
    cookies: &CookieJar<'_>,
) -> Result<Status, ApiError> {
    // Verify that the user we are looking up exists.
    mongo_db.find_publisher(&publisher_auth.email)?;
    // Create cookie, save and return.
    mongo_db.start_session(publisher_auth.email, cookies)
}

/// If the user has a valid session cookie, then return success
#[get("/cookies")]
pub fn check_cookies(_session: Session) -> Status {
    Status::Ok
}

#[get("/logout")]
pub fn logout(_session: Session, cookies: &CookieJar<'_>) -> Status {
    // Just remove cookie from browser.
    // No need to delete it from mongo, it will expire on its own.
    cookies.remove(Cookie::named("Session"));
    Status::Ok
}

impl MongoDB {
    /// Finds the session in mongoDB table
    fn find_session(&self, token: &str) -> request::Outcome<Session, ApiError> {
        match self.sessions.find_one(doc! {"token": token}, None) {
            Ok(result) => match result {
                Some(session) => Outcome::Success(session),
                None => Outcome::Failure((Status::Unauthorized, ApiError::AuthorizationError)),
            },
            Err(_) => Outcome::Failure((Status::InternalServerError, ApiError::MongoDBError)),
        }
    }

    /// Starts session by adding cookies
    pub fn start_session(
        &self,
        email: String,
        cookies: &CookieJar<'_>,
    ) -> Result<Status, ApiError> {
        let cookie = self.create_session(email)?;
        cookies.add(cookie);
        Ok(Status::Ok)
    }

    /// Creates a session token for the provided email
    /// inside of the session collection in mongodb. Returns
    /// a cookie with the email and session cookie.
    fn create_session<'a>(&self, email: String) -> Result<Cookie<'a>, ApiError> {
        let session = Session::new(email);
        self.sessions
            .insert_one(&session, None)
            .or_else(mongo_error)?;
        Ok(Cookie::build(SESSION_COOKIE_STR, session.token)
            .http_only(true)
            .secure(true)
            .same_site(rocket::http::SameSite::Lax)
            .max_age(rocket::time::Duration::hours(COOKIE_LIFETIME_IN_HOURS))
            .path("/")
            .finish())
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for Session {
    type Error = ApiError;
    /// Request guard for sessions, returning a 404 if session isn't there or expired.
    async fn from_request(request: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        let cookies = request.cookies();
        let outcome = request.guard::<&State<MongoDB>>().await;
        let mongo_db = match outcome {
            Outcome::Success(mongo_db) => mongo_db.inner(),
            _ => return Outcome::Failure((Status::NotFound, ApiError::NotFound)),
        };
        let token = match cookies.get(SESSION_COOKIE_STR) {
            Some(cookie) => cookie.value(),
            None => return Outcome::Failure((Status::NotFound, ApiError::NotFound)),
        };
        mongo_db.find_session(token)
    }
}

/// From Googles JWT token, verify and retrieve the email.
#[derive(Debug, Serialize, Deserialize)]
pub struct JwtAuth {
    pub email: String,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for JwtAuth {
    type Error = ApiError;
    /// Request guard for JWT authorization, verifies JWT with google.
    async fn from_request(request: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        let headers = request.headers();
        let jwt = match headers.get("Authorization").next() {
            Some(jwt) => jwt,
            None => return Outcome::Failure((Status::BadRequest, ApiError::AuthorizationError)),
        };
        let google_response = match reqwest::get(format!("{}{}", GOOGLE_TOKEN_AUTH, jwt)).await {
            Ok(g_resp) => g_resp,
            Err(_) => {
                return request::Outcome::Failure((
                    Status::Unauthorized,
                    ApiError::AuthorizationError,
                ))
            }
        };
        let reader: JwtAuth = match google_response.json().await {
            Ok(reader) => reader,
            Err(_) => {
                return request::Outcome::Failure((
                    Status::InternalServerError,
                    ApiError::InternalServerError,
                ))
            }
        };
        Outcome::Success(reader)
    }
}
