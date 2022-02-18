/// mongo.rs
/// Connection to mongoDB
use crate::publisher::Publisher;
use crate::reader::Reader;
use crate::session::Session;
use mongodb::bson::doc;
use mongodb::sync::{Client, Collection, Database};

/// Primary struct for maintaining connection to MongoDB
///
/// Note: Considering changing this to a series of collections.
/// That would avoid making a request for the collection each time we try to interact with data.
/// Slower startup time, but I think its worth it as long as we don't run on a a lambda.
#[derive(Debug)]
pub struct MongoDB {
    // Keeping client for now, may not be needed.
    _client: Client,
    // Preloading user database because it will be used often.
    user_db: Database,
    pub readers: Collection<Reader>,
    pub publishers: Collection<Publisher>,
}

impl MongoDB {
    // General use
    pub fn get_collection_from_user_db<T>(&self, name: &str) -> Collection<T> {
        self.user_db.collection(name)
    }

    /// Readers collection is used often enough for its own function
    pub fn get_readers_collection(&self) -> Collection<Reader> {
        self.user_db.collection("Readers")
    }

    pub fn get_session_collection(&self) -> Collection<Session> {
        self.user_db.collection("Sessions")
    }

    pub fn get_publishers_collection(&self) -> Collection<Publisher> {
        self.user_db.collection("Publishers")
    }
}

/// Connects to MongoDB, if the request is rejected for any reason
/// this will return an error, but the site should panic.
pub fn connect_to_mongo() -> Result<MongoDB, mongodb::error::Error> {
    let client = Client::with_uri_str(dotenv!("MONGO_URI"))?;
    // Ping the server to see if you can connect to the cluster
    client
        .database("admin")
        .run_command(doc! {"ping": 1}, None)?;

    // Preload the user database
    let user_db = client.database("Users");
    let readers = user_db.collection("Readers");
    let publishers = user_db.collection("Publishers");
    Ok(MongoDB {
        _client: client,
        user_db,
        readers,
        publishers,
    })
}
