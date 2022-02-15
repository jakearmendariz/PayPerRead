/// articles.rs
/// Very incomplete. Just posting for skeleton code.
/// Not included in main module so its errors don't break code
use crate::common::{email_filter, mongo_error, ApiError, Balance};
use crate::mongo::MongoDB;
use crate::publisher::{find_publisher, Publisher};
use crate::reader::find_reader;
use crate::session::Session;
use mongodb::bson::DateTime;
use mongodb::bson::{doc, to_bson};
use mongodb::sync::Collection;
use mongodb::options::UpdateOptions;
use rocket::{http::Status, State};
use rocket_contrib::json::Json;
use serde::{Deserialize, Serialize};

/// Seperate type so we can abstract this later on.
/// Should probably be a set number of characters and enforce as unique.
pub type ArticleGuid = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Article {
    article_name: String,
    created_at: DateTime,
    price: Balance,
}

impl Article {
    pub fn new(article_name: String, price: Balance) -> Self {
        Article {
            article_name,
            created_at: DateTime::now(),
            price,
        }
    }

    // pub fn article_document()
}

// impl TryFrom for Article {

// }
/*

#[post("/articles/purchase", data = "<article_to_buy>")]
fn purchase_article(
    mongo_db: State<MongoDB>,
    article_to_buy: Json<BuyArticle>,
    session: Session,
) -> Result<Status, ApiError> {
    /// Buy article if reader doesn't own it.
    /// Subtract balance from reader
    /// Pay publisher.
}
*/

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterArticle {
    pub publisher_email: String,
    article_name: String,
    pub article_guid: ArticleGuid,
    price: Balance,
}

/// Retrieve article from publisher collection.
fn get_article(
    publishers: Collection<Publisher>,
    publisher_email: String,
    article_guid: ArticleGuid,
) -> Result<Option<Article>, ApiError> {
    let publisher = find_publisher(publishers, publisher_email)?;
    Ok(publisher.lookup_article(article_guid))
}

/// Check if the article exists in the collection
fn article_exists(
    publishers: Collection<Publisher>,
    publisher_email: String,
    article_guid: ArticleGuid,
) -> Result<bool, ApiError> {
    Ok(get_article(publishers, publisher_email, article_guid)?.is_some())
}

/// Inserts article for a publisher. Only call when article doesn't exist.
fn insert_article(
    publishers: Collection<Publisher>,
    register_article: RegisterArticle,
) -> Result<Status, ApiError> {
    let mut publisher =
        find_publisher(publishers.clone(), register_article.publisher_email.clone())?;
    let article = Article::new(register_article.article_name, register_article.price);
    publisher.insert_article(register_article.article_guid, article)?;
    let update = doc! { "$push":  { "articles": &to_bson(&publisher.articles).unwrap() } };
    let options = UpdateOptions::builder()
        .upsert(true) // should create the field if there are no matches
        .build();
    publishers
        .update_one(email_filter(register_article.publisher_email), update, Some(options))
        .or_else(mongo_error)?;
    Ok(Status::Created)
}

/// Register an article for a publisher.
/// If it already exists 200, else 201
#[post("/articles/register", data = "<article>")]
pub fn register_article(
    mongo_db: State<MongoDB>,
    article: Json<RegisterArticle>,
    // Add an API key later on to verify this request
) -> Result<Status, ApiError> {
    let publishers = mongo_db.get_publishers_collection();
    let article = article.into_inner();
    let (publisher_email, guid) = (
        article.publisher_email.clone(),
        article.article_guid.clone(),
    );
    if article_exists(publishers, publisher_email, guid)? {
        return Ok(Status::Ok);
    }
    insert_article(mongo_db.get_publishers_collection(), article)
}

#[get("/articles/own/<article_guid>")]
pub fn owns_article(
    mongo_db: State<MongoDB>,
    article_guid: String,
    session: Session,
) -> Result<Status, ApiError> {
    // Does the current user own the article?
    // If so return 200, otherwise 404
    let readers = mongo_db.get_readers_collection();
    let reader = find_reader(readers, session.email)?;
    if reader.owns_article(article_guid) {
        Ok(Status::Ok)
    } else {
        Ok(Status::NotFound)
    }
}
