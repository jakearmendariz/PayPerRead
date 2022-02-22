/// articles.rs
/// Manage article creation
use crate::common::{email_filter, mongo_error, update_balance, ApiError, ApiResult, Balance};
use crate::mongo::MongoDB;
use crate::publisher::Publisher;
use crate::reader::Reader;
use crate::session::Session;
use mongodb::bson::doc;
use mongodb::bson::DateTime;
use rocket::{http::Status, State};
use rocket_contrib::json::Json;
use serde::{Deserialize, Serialize};

/// Seperate type so we can abstract this later on.
/// Should probably be a set number of characters and enforce as unique.
pub type ArticleGuid = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Article {
    guid: ArticleGuid,
    article_name: String,
    created_at: DateTime,
    price: Balance,
    views: u32,
}

impl Article {
    pub fn new(article_name: String, price: Balance, guid: String) -> Self {
        Article {
            article_name,
            guid,
            created_at: DateTime::now(),
            price,
            views: 0,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BuyArticle {
    publisher_email: String,
    article_uid: ArticleGuid,
}

/// Buy article if reader doesn't own it.
/// Subtract balance from reader
/// Pay publisher.
#[post("/articles/purchase", data = "<article_to_buy>")]
pub fn purchase_article(
    mongo_db: State<MongoDB>,
    article_to_buy: Json<BuyArticle>,
    session: Session,
) -> ApiResult<Status> {
    // Retrieve information
    let BuyArticle {
        article_uid,
        publisher_email,
    } = article_to_buy.into_inner();
    let publisher = mongo_db.find_publisher(&publisher_email)?;
    let reader = mongo_db.find_reader(&session.email)?;
    let guid = build_guid(&publisher_email, &article_uid);
    let article = mongo_db
        .get_article(&guid)?
        .ok_or(ApiError::ArticleNotRegistered)?;
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
    publisher_email: String,
    article_name: String,
    article_uid: ArticleGuid,
    price: Balance,
}

/// Register an article for a publisher.
/// If it already exists 200, else 201
#[post("/articles/register", data = "<article>")]
pub fn register_article(
    mongo_db: State<MongoDB>,
    article: Json<RegisterArticle>,
    // Add an API key later on to verify this request
) -> ApiResult<Status> {
    let article = article.into_inner();
    if mongo_db.article_exists(&article.publisher_email, &article.article_uid)? {
        return Ok(Status::Ok);
    }
    mongo_db.insert_article(article)
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

#[get("/articles/<article_guid>")]
pub fn get_article(
    mongo_db: State<MongoDB>,
    article_guid: ArticleGuid,
) -> ApiResult<Json<Article>> {
    // Retrieve article from guid
    let article = mongo_db
        .get_article(&article_guid)?
        .ok_or(ApiError::ArticleNotRegistered)?;
    Ok(Json(article))
}

fn build_guid(email: &str, uid: &str) -> String {
    email.to_string() + "." + uid
}

impl MongoDB {
    /// Retrieve article from articles collection.
    fn get_article(&self, guid: &str) -> ApiResult<Option<Article>> {
        self.articles
            .find_one(doc! {"guid": guid}, None)
            .or_else(mongo_error)
    }

    /// Check if the article exists in the collection
    fn article_exists(&self, publisher_email: &str, article_uid: &str) -> ApiResult<bool> {
        let guid = build_guid(publisher_email, article_uid);
        Ok(self.get_article(&guid)?.is_some())
    }

    /// Inserts article for a publisher. Only call when article doesn't exist.
    fn insert_article(&self, register_article: RegisterArticle) -> ApiResult<Status> {
        let guid = build_guid(
            &register_article.publisher_email,
            &register_article.article_uid,
        );
        let article = Article::new(register_article.article_name, register_article.price, guid);
        self.articles
            .insert_one(&article, None)
            .or_else(mongo_error)?;
        self.add_article_to_publisher(&register_article.publisher_email, &article.guid)?;
        Ok(Status::Created)
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
        let document = doc! {"guid": &article.guid};
        let update = doc! { "$set":  { "views": article.views + 1} };
        let update_query = self.publishers.update_one(document, update, None);

        match update_query {
            Ok(_) => Ok(Status::Ok),
            Err(_) => Err(ApiError::MongoDBError),
        }
    }
}
