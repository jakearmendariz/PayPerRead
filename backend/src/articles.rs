/// articles.rs
/// Manage article creation
use crate::common::{
    email_filter, mongo_error, random_string, update_balance, ApiError, ApiResult, Balance,
};
use crate::mongo::MongoDB;
use crate::publisher::Publisher;
use crate::reader::Reader;
use crate::session::Session;
use mongodb::bson::{doc, DateTime};
use rocket::{http::Status, State};
use rocket_contrib::json::Json;
use serde::{Deserialize, Serialize};

/// Seperate type so we can abstract this later on.
/// Should probably be a set number of characters and enforce as unique.
pub type ArticleGuid = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Article {
    guid: ArticleGuid,
    publisher: String,
    domain: String,
    article_name: String,
    created_at: DateTime,
    price: Balance,
    views: u32,
}

impl Article {
    pub fn new(guid: String, publisher: String, domain: String, article_name: String, price: Balance) -> Self {
        Article {
            guid,
            publisher,
            domain,
            article_name,
            created_at: DateTime::now(),
            price,
            views: 0,
        }
    }
}

/// Buy article if reader doesn't own it.
/// Subtract balance from reader
/// Pay publisher.
#[post("/articles/purchase/<article_uid>")]
pub fn purchase_article(
    mongo_db: State<MongoDB>,
    article_uid: String,
    session: Session,
) -> ApiResult<Status> {
    // Retrieve information
    let article = mongo_db
        .get_article(&article_uid)?
        .ok_or(ApiError::ArticleNotRegistered)?;
    let publisher = mongo_db.find_publisher(&article.publisher)?;
    let reader = mongo_db.find_reader(&session.email)?;
    if reader.owns_article(&article.guid) {
        // Already purchased the article.
        return Ok(Status::Ok);
    }

    // Preform the transaction, add the article
    mongo_db.finalize_transaction(&publisher, &reader, &article)?;
    // Increase article view count
    mongo_db.increment_article_views(&article)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterArticle {
    article_uid: ArticleGuid,
    publisher_email: String,
    article_name: String,
    price: Balance,
    api_key: String,
}

/// Register an article for a publisher.
/// If it already exists 200, else 201
#[post("/articles/register", data = "<article>")]
pub fn register_article(
    mongo_db: State<MongoDB>,
    article: Json<RegisterArticle>,
    // Add an API key later on to verify this request
) -> Result<Json<Article>, ApiError> {
    let article = article.into_inner();
    let publisher = mongo_db.find_publisher(&article.publisher_email)?;
    if publisher.api_key != Some(article.api_key.clone()) {
        return Err(ApiError::AuthorizationError);
    }
    let article = mongo_db.create_article(article)?;
    Ok(Json(mongo_db.insert_article(article)?))
}

#[get("/articles/own/<article_guid>")]
pub fn owns_article(
    mongo_db: State<MongoDB>,
    article_guid: ArticleGuid,
    session: Session,
) -> ApiResult<Status> {
    // Does the current user own the article?
    // If so return 200, otherwise 404
    let reader = mongo_db.find_reader(&session.email)?;
    if reader.owns_article(&article_guid) {
        Ok(Status::Ok)
    } else {
        Ok(Status::NotFound)
    }
}

#[get("/articles/<article_id>")]
pub fn get_article(mongo_db: State<MongoDB>, article_id: ArticleGuid) -> ApiResult<Json<Article>> {
    // Retrieve article from guid
    let article = mongo_db
        .get_article(&article_id)?
        .ok_or(ApiError::ArticleNotRegistered)?;
    Ok(Json(article))
}

impl MongoDB {
    /// Retrieve article from articles collection.
    fn get_article(&self, guid: &str) -> ApiResult<Option<Article>> {
        self.articles
            .find_one(doc! {"guid": guid}, None)
            .or_else(mongo_error)
    }

    /// Build the article, using the publisher collection to get the domain.
    fn create_article(&self, register_article: RegisterArticle) -> ApiResult<Article> {
        let guid = random_string(18);
        let publisher = self.find_publisher(&register_article.publisher_email)?;
        Ok(Article::new(
            guid,
            publisher.email,
            publisher.domain,
            register_article.article_name,
            register_article.price,
        ))
    }

    /// Inserts article for a publisher. Only call when article doesn't exist.
    fn insert_article(&self, article: Article) -> ApiResult<Article> {
        self.articles
            .insert_one(&article, None)
            .or_else(mongo_error)?;
        self.add_article_to_publisher(&article.publisher, &article.guid)?;
        Ok(article)
    }

    /// Adds article guid for the publisher
    fn add_article_to_publisher(&self, publisher_email: &str, article_guid: &str) -> ApiResult<()> {
        let document = email_filter(publisher_email);
        let update = doc! { "$push":  { "articles": article_guid } };
        self.publishers
            .update_one(document, update, None)
            .or_else(mongo_error)?;
        Ok(())
    }

    // Register an article for a reader.
    // might need to modify the slug
    fn add_article_to_reader(&self, reader_email: &str, article_guid: &str) -> ApiResult<Status> {
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
        article: &Article,
    ) -> ApiResult<Status> {
        // Subtract balance from reader.
        let reader_balance = reader.balance.try_subtracting(article.price)?;
        update_balance(&self.readers, reader_balance, &reader.email)?;
        // Add balance to writer.
        let publisher_balance = publisher.balance + article.price;
        update_balance(&self.publishers, publisher_balance, &publisher.email)?;
        // Add article to reader.
        self.add_article_to_reader(&reader.email, &article.guid)
    }

    /// Increase the view count of the article
    /// by one and updates article object in publisher's
    /// collection
    fn increment_article_views(&self, article: &Article) -> ApiResult<Status> {
        println!("Update article views");
        let document = doc! {"guid": &article.guid};
        let update = doc! { "$inc":  { "views": 1} };
        let update_query = self.articles.update_one(document, update, None);

        match update_query {
            Ok(_) => Ok(Status::Ok),
            Err(_) => Err(ApiError::MongoDBError),
        }
    }
}
