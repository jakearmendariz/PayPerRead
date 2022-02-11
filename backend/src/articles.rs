/// articles.rs
/// Very incomplete. Just posting for skelaton code.
/// Not included in main module so its errors don't break code
use crate::common::{Balance, ArticleGuid, Article};
use mongodb::bson::DateTime;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
struct BuyArticle {
    publisher_email: String,
    article_guid: ArticleGuid,
}

fn get_article(
    publishers: Collection<Publisher>,
    article_to_buy: BuyArticle,
) -> Result<Article, ApiError> {
    // TODO
    // retrieves article from mongoDB publishers collection
}

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

#[post("/articles/register", data = "<article>")]
/// Add function that accepts an article
/// Daniel's job. 201 for created, 200 for exists.

#[get("/articles/own/<article_guid>")]
fn owns_article(
    mongo_db: State<MongoDB>,
    article_guid: String,
    session: Session,
) -> Result<Status, ApiError> {
    /// Does the current user own the article?
    /// If so return 200, otherwise 404
}
