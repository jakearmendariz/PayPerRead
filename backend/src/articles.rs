/// articles.rs
/// Very incomplete. Just posting for skeleton code.
/// Not included in main module so its errors don't break code
use crate::common::{email_filter, mongo_error, ApiError, Article, ArticleGuid, Balance};
use crate::mongo::MongoDB;
use crate::publisher::Publisher;
use crate::session::Session;
use mongodb::bson::{doc, DateTime};
use mongodb::sync::Collection;
use rocket::{http::Status, State};
use rocket_contrib::json::Json;
use serde::{Deserialize, Serialize};

// fn get_article(
//     publishers: Collection<Publisher>,
//     article_to_buy: BuyArticle,
// ) -> Result<Article, ApiError> {
//     // TODO
//     // retrieves article from mongoDB publishers collection
// }

// #[post("/articles/purchase", data = "<article_to_buy>")]
// fn purchase_article(
//     mongo_db: State<MongoDB>,
//     article_to_buy: Json<BuyArticle>,
//     session: Session,
// ) -> Result<Status, ApiError> {
//     /// Buy article if reader doesn't own it.
//     /// Subtract balance from reader
//     /// Pay publisher.
// }

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterArticle {
    pub publisher_email: String,
    article_name: String,
    pub article_guid: ArticleGuid,
    price: Balance,
}

/// Check if the article exists in the collection
fn article_exists(
    publishers: Collection<Publisher>,
    publisher_email: String,
    article_guid: ArticleGuid,
) -> Result<bool, ApiError> {
    let publisher = publishers
        .find_one(email_filter(publisher_email), None)
        .or_else(mongo_error)?
        .ok_or_else(|| ApiError::NotFound)?;
    Ok(publisher.lookup_article(article_guid).is_some())
}

/// Inserts article for a publisher. Only call when article doesn't exist.
fn insert_article(
    publishers: Collection<Publisher>,
    register_article: RegisterArticle,
) -> Result<Status, ApiError> {
    let mut publisher = publishers
        .find_one(email_filter(register_article.publisher_email), None)
        .or_else(mongo_error)?
        .ok_or(ApiError::NotFound)?;
    let article = Article::new(register_article.article_name, register_article.price);
    publisher.insert_article(register_article.article_guid, article)?;
    Ok(Status::Ok)
}

#[post("/articles/register", data = "<article>")]
pub fn register_article(
    mongo_db: State<MongoDB>,
    article: Json<RegisterArticle>,
) -> Result<Status, ApiError> {
    let publishers = mongo_db.get_publishers_collection();
    let article = article.into_inner();
    let (email, guid) = (
        article.publisher_email.clone(),
        article.article_guid.clone(),
    );
    if article_exists(publishers, email, guid)? {
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
    let email = session.email;

    let result = readers
        .find_one(email_filter(email), None)
        .or_else(mongo_error)?;

    match result {
        Some(reader) => {
            if reader.owns_article(article_guid) {
                Ok(Status::Ok)
            } else {
                Ok(Status::NotFound)
            }
        }
        None => Ok(Status::NotFound),
    }
}
