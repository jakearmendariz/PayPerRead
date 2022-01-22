/// common.rs
/// Contains commonly used structs and features
use serde::{Deserialize, Serialize};
use rocket::http::Status;
use rocket::request::Request;
use rocket::response::{self, Responder, Response};
use std::error::Error as StdError;
use std::fmt;
use std::ops::Add;
use std::ops::Sub;

/// Primary error for api.
/// Feel free to add enum arms!
#[derive(Debug)]
pub enum ApiError {
    MongoDBError,
    NotFound,
    InternalServerError,
    UserAlreadyExists,
}

static USER_ALREADY_EXISTS_MSG: &str = "User Already exists";
static MONGO_DB_ERROR_MSG: &str = "MongoDB Error";
static NOT_FOUND_MSG: &str = "Record Not Found";
static INTERAL_SERVER_ERROR_MSG: &str = "Internal Server Error";

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            ApiError::NotFound => f.write_str(NOT_FOUND_MSG),
            ApiError::MongoDBError => f.write_str(MONGO_DB_ERROR_MSG),
            ApiError::InternalServerError => f.write_str(INTERAL_SERVER_ERROR_MSG),
            ApiError::UserAlreadyExists => f.write_str(USER_ALREADY_EXISTS_MSG),
        }
    }
}

impl StdError for ApiError {
    fn description(&self) -> &str {
        match *self {
            ApiError::NotFound => NOT_FOUND_MSG,
            ApiError::InternalServerError => INTERAL_SERVER_ERROR_MSG,
            ApiError::MongoDBError => MONGO_DB_ERROR_MSG,
            ApiError::UserAlreadyExists => USER_ALREADY_EXISTS_MSG,
        }
    }
}

impl<'r> Responder<'r> for ApiError {
    fn respond_to(self, _: &Request) -> response::Result<'r> {
        match self {
            ApiError::NotFound => Err(Status::NotFound),
            ApiError::InternalServerError => Err(Status::InternalServerError),
            ApiError::MongoDBError => {
                Ok(Response::build().raw_status(424, MONGO_DB_ERROR_MSG).finalize())
            }
            ApiError::UserAlreadyExists => Ok(Response::build()
                .raw_status(403, USER_ALREADY_EXISTS_MSG)
                .finalize()),
        }
    }
}

/// Converts mongo's error struct to ours, printing information.
/// Why not return the mongo error? 
/// If mongo errors out, its not the clients fault, its a mongo problem,
/// and we neeed to investigate database via the mongo console.
pub fn mongo_error<T>(e:mongodb::error::Error) -> Result<T, ApiError> {
    println!("Unexpected MongoDB Error {}", e);
    return Err(ApiError::MongoDBError)
}

/// Better to keep balance as two separate unsigned values
/// than a float to avoid floating point math and errors.
#[derive(Debug, Default, Serialize, Deserialize, Copy, Clone)]
pub struct Balance {
    dollars: u32,
    cents: u32,
}

impl Add for Balance {
    type Output = Self;
    fn add(self, other: Self) -> Self {
        Self {
            dollars: self.dollars + other.dollars + ((self.cents + other.cents) / 100),
            cents: (self.cents + other.cents) % 100,
        }
    }
}

impl Sub for Balance {
    type Output = Self;
    fn sub(self, other: Self) -> Self {
        let self_total = self.dollars * 100 + self.cents;
        let other_total = other.dollars * 100 + other.cents;
        let self_rem = self_total - other_total;
        Self {
            dollars: self_rem / 100,
            cents: self_rem % 100,
        }
    }
}
