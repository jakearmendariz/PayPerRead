use crate::articles::Article;
/// mongo.rs
/// Connection to mongoDB
use crate::publisher::Publisher;
use crate::reader::Reader;
use crate::session::Session;
use mongodb::bson::doc;
use mongodb::sync::{Client, Collection};

/// Primary struct for maintaining connection to MongoDB
/// Contains connections to the collections we will be using.
/// Note: This was previously just a database collection,
/// but this is master and reduces amount of async calls.
#[derive(Debug)]
pub struct MongoDB {
    pub readers: Collection<Reader>,
    pub publishers: Collection<Publisher>,
    pub sessions: Collection<Session>,
    pub articles: Collection<Article>,
}

/// Connects to MongoDB, if the request is rejected for any reason
/// this will return an error, but the site should panic.
pub fn connect_to_mongo() -> Result<MongoDB, mongodb::error::Error> {
    let client = Client::with_uri_str(dotenv!("MONGO_URI"))?;
    // Ping the server to see if you can connect to the cluster
    client
        .database("admin")
        .run_command(doc! {"ping": 1}, None)
        .expect("Ping failed");

    // Preload the user database
    let user_db = client.database("Users");
    let readers = user_db.collection("Readers");
    let publishers = user_db.collection("Publishers");
    let sessions = user_db.collection("Sessions");
    let article_db = client.database("Articles");
    let articles = article_db.collection("Articles");
    Ok(MongoDB {
        readers,
        publishers,
        sessions,
        articles,
    })
}
