/// articles.rs
/// Very incomplete. Just posting for skelaton code.
/// Not included in main module so its errors don't break code
use crate::common::{email_filter, mongo_error, ArticleGuid, Article, ApiError};
use crate::mongo::MongoDB;
use crate::session::{Session};
use mongodb::{bson::doc, sync::Collection};
use rocket::{
    http::{Cookies, Status},
    State,
};


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

// #[post("/articles/register", data = "<article>")]
/// Add function that accepts an article
/// Daniel's job. 201 for created, 200 for exists.

#[get("/articles/own/<article_guid>")]
pub fn owns_article(
    mongo_db: State<MongoDB>,
    article_guid: String,
    session: Session,
) -> Result<Status, ApiError> {
    // Does the current user own the article?
    // If so return 200, otherwise 404
    
    let readers = mongo_db.get_readers_collection();
    let email = session.email.clone();

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
        None => Ok(Status::NotFound)
    }
}   
