use crate::mongo::MongoDB;
use rocket::State;
use rocket_contrib::json::Json;
use serde::{Deserialize, Serialize};

/// Better to keep balance as two separate unsigned values
/// than a float to avoid floating point math and errors.
#[derive(Debug, Serialize, Deserialize)]
pub struct Balance {
    dollars: u32,
    cents: u32,
}

/// Reader represents a user on the site.
/// Going to leave the credit card and other private information in another struct.
#[derive(Debug, Serialize, Deserialize)]
pub struct Reader {
    email: String,
    name: String,
    balance: Balance,
}

/// Scan of entire readers table.
#[get("/readers")]
pub fn get_readers(mongo_db: State<MongoDB>) -> Json<Vec<Reader>> {
    let readers = mongo_db.get_collection_from_user_db::<Reader>("Readers");
    // find with no parameters is just a scan.
    let cursor = readers
        .find(None, None)
        .expect("Error scanning readers table.");
    let readers_vec = cursor.map(|item| item.unwrap()).collect::<Vec<Reader>>();
    Json(readers_vec)
}
