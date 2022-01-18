use mongodb::bson::doc;
use mongodb::sync::{Client, Collection, Database};

/// Primary struct for maintaining connection to MongoDB
pub struct MongoDB {
    // Keeping client for now, may not be needed.
    _client: Client,
    // Preloading user database because it will be used often.
    user_db: Database,
}

impl MongoDB {
    // FYI (reason for this function) its best practice to keep attributes private.
    pub fn get_collection_from_user_db<T>(&self, name: &str) -> Collection<T> {
        self.user_db.collection(name)
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
    Ok(MongoDB {
        _client: client,
        user_db,
    })
}
