/// articles.rs
/// Manage article creation
use crate::common::{email_filter, mongo_error, update_balance, ApiError, Balance};
use crate::mongo::MongoDB;
use crate::publisher::Publisher;
use crate::reader::Reader;
use crate::session::Session;
use mongodb::bson::DateTime;
use mongodb::bson::{doc, to_bson};
use rocket::{http::Status, State};
use rocket_contrib::json::Json;
use serde::{Deserialize, Serialize};

// hash(email, uid) => guid
// Problem: owns_article() still needs email and uid
// Benefit: Publishers don't need as large of a uid, specific to them, not globally
// We still have globally unique

// Storing articles
/*

guid => (uuid, guid)
guid => publisher.uid
pub struct Article {
    article_guid: String, // hash from email and publisher
    article_name: String,
    created_at: DateTime,
    price: Balance,
    views: u32,
}


*/

/// Seperate type so we can abstract this later on.
/// Should probably be a set number of characters and enforce as unique.
pub type ArticleGuid = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Article {
    article_name: String,
    created_at: DateTime,
    price: Balance,
    views: u32,
}

impl Article {
    pub fn new(article_name: String, price: Balance) -> Self {
        Article {
            article_name,
            created_at: DateTime::now(),
            price,
            views: 0,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BuyArticle {
    publisher_email: String,
    article_guid: ArticleGuid,
}

/// Buy article if reader doesn't own it.
/// Subtract balance from reader
/// Pay publisher.
#[post("/articles/purchase", data = "<article_to_buy>")]
pub fn purchase_article(
    mongo_db: State<MongoDB>,
    article_to_buy: Json<BuyArticle>,
    session: Session,
) -> Result<Status, ApiError> {
    // Retrieve information
    let BuyArticle {
        article_guid,
        publisher_email,
    } = article_to_buy.into_inner();
    let publisher = mongo_db.find_publisher(&publisher_email)?;
    let reader = mongo_db.find_reader(&session.email)?;
    let article = mongo_db
        .get_article(&publisher_email, &article_guid)?
        .ok_or(ApiError::ArticleNotRegistered)?;
    if reader.owns_article(&article_guid) {
        // Already purchased the article.
        return Ok(Status::Ok);
    }

    // Preform the transaction, add the article
    mongo_db.finalize_transaction(&publisher, &reader, &article_guid, &article)?;
    // Increase article view count
    mongo_db.increment_article_views(&publisher, &article, &article_guid)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterArticle {
    publisher_email: String,
    article_name: String,
    article_guid: ArticleGuid,
    price: Balance,
}

/// Register an article for a publisher.
/// If it already exists 200, else 201
#[post("/articles/register", data = "<article>")]
pub fn register_article(
    mongo_db: State<MongoDB>,
    article: Json<RegisterArticle>,
    // Add an API key later on to verify this request
) -> Result<Status, ApiError> {
    let article = article.into_inner();
    if mongo_db.article_exists(&article.publisher_email, &article.article_guid)? {
        return Ok(Status::Ok);
    }
    mongo_db.insert_article(article)
}

#[get("/articles/own/<article_guid>")]
pub fn owns_article(
    mongo_db: State<MongoDB>,
    article_guid: String,
    session: Session,
) -> Result<Status, ApiError> {
    // Does the current user own the article?
    // If so return 200, otherwise 404
    let reader = mongo_db.find_reader(&session.email)?;
    if reader.owns_article(&article_guid) {
        Ok(Status::Ok)
    } else {
        Ok(Status::NotFound)
    }
}

impl MongoDB {
    /// Retrieve article from publisher collection.
    fn get_article(
        &self,
        publisher_email: &str,
        article_guid: &str,
    ) -> Result<Option<Article>, ApiError> {
        let publisher = self.find_publisher(publisher_email)?;
        Ok(publisher.lookup_article(article_guid))
    }

    /// Check if the article exists in the collection
    fn article_exists(&self, publisher_email: &str, article_guid: &str) -> Result<bool, ApiError> {
        Ok(self.get_article(publisher_email, article_guid)?.is_some())
    }

    /// Inserts article for a publisher. Only call when article doesn't exist.
    fn insert_article(&self, register_article: RegisterArticle) -> Result<Status, ApiError> {
        let mut publisher = self.find_publisher(&register_article.publisher_email)?;
        let article = Article::new(register_article.article_name, register_article.price);
        publisher.insert_article(register_article.article_guid, article)?;
        let update = doc! { "$set":  { "articles": &to_bson(&publisher.articles).unwrap() } };
        self.publishers
            .update_one(email_filter(&publisher.email), update, None)
            .or_else(mongo_error)?;
        Ok(Status::Created)
    }

    // Register an article for a reader.
    // might need to modify the slug
    fn add_article_to_reader(
        &self,
        reader_email: &str,
        article_guid: &ArticleGuid,
    ) -> Result<Status, ApiError> {
        let document = email_filter(reader_email);
        let update = doc! { "$push":  { "articles": article_guid } };
        let update_query = self.readers.update_one(document, update, None);

        match update_query {
            Ok(_) => Ok(Status::Ok),
            Err(_) => Err(ApiError::MongoDBError),
        }
    }

    /// Buy an article for a reader
    /// Subtract balance from reader
    /// Add Balance to writer
    /// Save article for reader
    fn finalize_transaction(
        &self,
        publisher: &Publisher,
        reader: &Reader,
        article_guid: &ArticleGuid,
        article: &Article,
    ) -> Result<Status, ApiError> {
        // Subtract balance from reader.
        let reader_balance = reader.balance.try_subtracting(article.price)?;
        update_balance(&self.readers, reader_balance, &reader.email)?;
        // Add balance to writer.
        let publisher_balance = publisher.balance + article.price;
        update_balance(&self.publishers, publisher_balance, &publisher.email)?;
        // Add article to reader.
        self.add_article_to_reader(&reader.email, article_guid)
    }

    /// Increase the view count of the article
    /// by one and updates article object in publisher's
    /// collection
    fn increment_article_views(
        &self,
        publisher: &Publisher,
        article: &Article,
        article_guid: &ArticleGuid,
    ) -> Result<Status, ApiError> {
        let document = email_filter(&publisher.email);
        let new_views = article.views + 1;
        let field_to_update = format!("articles.{}.views", article_guid);
        let update = doc! { "$set":  { field_to_update: new_views} };
        let update_query = self.publishers.update_one(document, update, None);

        match update_query {
            Ok(_) => Ok(Status::Ok),
            Err(_) => Err(ApiError::MongoDBError),
        }
    }
}
