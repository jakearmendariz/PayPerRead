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



/*

TOKEN=ya29.A0ARrdaM9VMGpfdr--iSC_ATKfa1f2OEzPU-PAfeLdjxiFkSh9pyv1GCgQHxzGNJDyuHoe6oeUpDF3uNeeKM9bgM1SD3stOtD4gsew2eZSWvQRI1bzTo9xXj4pC-RCy--oLdzwfiRPzv_GebKKwy40yrMffwIn
TOKEN_ID=eyJhbGciOiJSUzI1NiIsImtpZCI6IjllYWEwMjZmNjM1MTU3ZGZhZDUzMmU0MTgzYTZiODIzZDc1MmFkMWQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMzk1MzI2OTI1NzgxLWdzNnViajY5cjBlZ2trZWlmaW1vaHJrdHIyaDNhbjZwLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMzk1MzI2OTI1NzgxLWdzNnViajY5cjBlZ2trZWlmaW1vaHJrdHIyaDNhbjZwLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAxNTg5OTk2MzY2OTk3NjU4MzA5IiwiaGQiOiJ1Y3NjLmVkdSIsImVtYWlsIjoiZHdpbGJ5QHVjc2MuZWR1IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJHdEd0MnRTTEJkV3pORkpCQ3MtcTF3IiwibmFtZSI6IkRhbmllbCBXaWxieSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQVRYQUp4WkVJNzN1S20wWVZHam9wTnFxNVJRbm53TjNBTXR3MVdobjdqVj1zOTYtYyIsImdpdmVuX25hbWUiOiJEYW5pZWwiLCJmYW1pbHlfbmFtZSI6IldpbGJ5IiwibG9jYWxlIjoiZW4iLCJpYXQiOjE2NDM1ODA1MzcsImV4cCI6MTY0MzU4NDEzNywianRpIjoiNjAxM2RhZTNkNGRhZGE0OWM5NTdlNzZhZjJiZTRiMjNiNjc1NDgwYiJ9.bOkBj0LWxLt_7aFyxwm-I0di8lY2a2IrxL8u8QGPar4Hu2iQxvdQpqEdZYZABZLyzx3TcGSTot5rjHWvwifNogya8CRHb0_8pmZO9mRJybrts1-ZAjVWTorI1HEvUXiDewsDrQOsfxVqfPXHS7hUSzA4DqON1n5go15bqLw2n7BLUh7Ox36StAlxN4ZzbWXBoKI_sxrnVWc8_Wmo7h91lNCirHmG1rxZis7FQ__KBdqQGs6IoKNVmJnRUElvOpiNiLMwNi6Und60aEroMD4i3vAHpjHqbnDN7C0BPyMwJqubigKMPuC78nuDr4ZiCWnlrygn9cUbmLS7BHSKl13oPQ
API_KEY=AIzaSyBpdkhrNgfCi8kpuZC9NR6h4LVCuOGibX4

curl 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=[API_KEY]' \
-H 'Content-Type: application/json' \
--data-binary '{"postBody":"id_token=[GOOGLE_ID_TOKEN]&providerId=[google.com]","requestUri":"[http://localhost]","returnIdpCredential":true,"returnSecureToken":true}'


curl 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=AIzaSyBpdkhrNgfCi8kpuZC9NR6h4LVCuOGibX4' \
-H 'Content-Type: application/json' \
--data-binary '{"postBody":"id_token=[ya29.A0ARrdaM9VMGpfdr--iSC_ATKfa1f2OEzPU-PAfeLdjxiFkSh9pyv1GCgQHxzGNJDyuHoe6oeUpDF3uNeeKM9bgM1SD3stOtD4gsew2eZSWvQRI1bzTo9xXj4pC-RCy--oLdzwfiRPzv_GebKKwy40yrMffwIn]&providerId=[google.com]","requestUri":"[http://localhost]","returnIdpCredential":true,"returnSecureToken":true}'

curl 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=AIzaSyBpdkhrNgfCi8kpuZC9NR6h4LVCuOGibX4' \
-H 'Content-Type: application/json' \
--data-binary '{"postBody":"id_token=[ya29.A0ARrdaM9VMGpfdr--iSC_ATKfa1f2OEzPU-PAfeLdjxiFkSh9pyv1GCgQHxzGNJDyuHoe6oeUpDF3uNeeKM9bgM1SD3stOtD4gsew2eZSWvQRI1bzTo9xXj4pC-RCy--oLdzwfiRPzv_GebKKwy40yrMffwIn]&providerId=[google.com]","requestUri":"http://localhost:8000","returnIdpCredential":true,"returnSecureToken":true}'


curl 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=AIzaSyBpdkhrNgfCi8kpuZC9NR6h4LVCuOGibX4' \
-H 'Content-Type: application/json' \
--data-binary '{"postBody":"id_token=[eyJhbGciOiJSUzI1NiIsImtpZCI6IjllYWEwMjZmNjM1MTU3ZGZhZDUzMmU0MTgzYTZiODIzZDc1MmFkMWQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMzk1MzI2OTI1NzgxLWdzNnViajY5cjBlZ2trZWlmaW1vaHJrdHIyaDNhbjZwLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMzk1MzI2OTI1NzgxLWdzNnViajY5cjBlZ2trZWlmaW1vaHJrdHIyaDNhbjZwLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAxNTg5OTk2MzY2OTk3NjU4MzA5IiwiaGQiOiJ1Y3NjLmVkdSIsImVtYWlsIjoiZHdpbGJ5QHVjc2MuZWR1IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJHdEd0MnRTTEJkV3pORkpCQ3MtcTF3IiwibmFtZSI6IkRhbmllbCBXaWxieSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQVRYQUp4WkVJNzN1S20wWVZHam9wTnFxNVJRbm53TjNBTXR3MVdobjdqVj1zOTYtYyIsImdpdmVuX25hbWUiOiJEYW5pZWwiLCJmYW1pbHlfbmFtZSI6IldpbGJ5IiwibG9jYWxlIjoiZW4iLCJpYXQiOjE2NDM1ODA1MzcsImV4cCI6MTY0MzU4NDEzNywianRpIjoiNjAxM2RhZTNkNGRhZGE0OWM5NTdlNzZhZjJiZTRiMjNiNjc1NDgwYiJ9.bOkBj0LWxLt_7aFyxwm-I0di8lY2a2IrxL8u8QGPar4Hu2iQxvdQpqEdZYZABZLyzx3TcGSTot5rjHWvwifNogya8CRHb0_8pmZO9mRJybrts1-ZAjVWTorI1HEvUXiDewsDrQOsfxVqfPXHS7hUSzA4DqON1n5go15bqLw2n7BLUh7Ox36StAlxN4ZzbWXBoKI_sxrnVWc8_Wmo7h91lNCirHmG1rxZis7FQ__KBdqQGs6IoKNVmJnRUElvOpiNiLMwNi6Und60aEroMD4i3vAHpjHqbnDN7C0BPyMwJqubigKMPuC78nuDr4ZiCWnlrygn9cUbmLS7BHSKl13oPQ]&providerId=[google.com]","requestUri":"http://localhost:8000","returnIdpCredential":true,"returnSecureToken":true}'


curl 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=AIzaSyBpdkhrNgfCi8kpuZC9NR6h4LVCuOGibX4' \
-H 'Content-Type: application/json' \
--data-binary '{"postBody":"access_token=[ya29.A0ARrdaM9VMGpfdr--iSC_ATKfa1f2OEzPU-PAfeLdjxiFkSh9pyv1GCgQHxzGNJDyuHoe6oeUpDF3uNeeKM9bgM1SD3stOtD4gsew2eZSWvQRI1bzTo9xXj4pC-RCy--oLdzwfiRPzv_GebKKwy40yrMffwIn]&providerId=[google.com]","requestUri":"http://localhost:8000","returnIdpCredential":true,"returnSecureToken":true}'
*/