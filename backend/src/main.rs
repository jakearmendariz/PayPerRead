#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
#[macro_use]
extern crate dotenv_codegen;

use mongodb::{bson::doc, sync::Client};
use rocket::State;
use rocket_contrib::json::Json;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Balance {
    dollars: u32,
    cents: u32,
}

#[derive(Debug, Serialize, Deserialize)]

struct Reader {
    email: String,
    name: String,
    balance: Balance,
}

struct MongoDB {
    // Not sure if we will need the client yet, but might be useful.
    _client: Client,
    // preloading the user database because it will be used a lot.
    user_db: mongodb::sync::Database,
}

#[get("/readers")]
fn readers(mongo_db: State<MongoDB>) -> Json<Vec<Reader>> {
    let readers = mongo_db.user_db.collection::<Reader>("Readers");
    let cursor = readers.find(None, None).expect("Couldn't find object");
    let readers_vec: Vec<Reader> = cursor.map(|item| item.unwrap()).collect();
    Json(readers_vec)
}

fn connect_to_mongo() -> Result<MongoDB, mongodb::error::Error> {
    let client = Client::with_uri_str(dotenv!("MONGO_URI"))?;
    // Ping the server to see if you can connect to the cluster
    client
        .database("admin")
        .run_command(doc! {"ping": 1}, None)?;

    // preload the user database
    let user_db = client.database("Users");
    Ok(MongoDB {
        _client: client,
        user_db,
    })
}

#[get("/")]
fn index() -> String {
    "Hello, World".to_string()
}

fn main() {
    let mongo_db = connect_to_mongo()
        .expect("Could not connect to mongoDB, try adding your IP address to allowlist.");
    rocket::ignite()
        .manage(mongo_db)
        .mount("/", routes![index, readers])
        .launch();
}
