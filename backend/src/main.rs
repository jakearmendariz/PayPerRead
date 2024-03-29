#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
#[macro_use]
extern crate dotenv_codegen;
extern crate time;
mod articles;
mod common;
mod email;
mod mongo;
mod publisher;
mod reader;
mod session;
use rocket::http::Method;
use rocket::{get, routes};

#[get("/")]
fn index() -> String {
    "PayPerRead".to_string()
}

use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::{Header, Status};
use rocket::{Request, Response};
use std::io::Cursor;

pub struct CORS;

#[rocket::async_trait]
impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS headers to responses",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new(
            "Access-Control-Allow-Origin",
            "http://localhost:3000",
        ));
        response.set_header(Header::new(
            "Access-Control-Allow-Methods",
            "POST, GET, PATCH, OPTIONS",
        ));
        response.set_header(Header::new(
            "Access-Control-Allow-Headers",
            "authorization, session, Content-Type",
        ));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
        if request.method() == Method::Options {
            response.set_sized_body(0, Cursor::new(""));
            response.set_status(Status::Ok);
        }
    }
}

#[launch]
fn rocket() -> _ {
    let mongo_db = mongo::connect_to_mongo()
        .expect("Could not connect to mongoDB, try adding your IP address to allowlist.");
    rocket::build().manage(mongo_db).attach(CORS).mount(
        "/",
        routes![
            index,
            reader::add_reader,
            reader::delete_reader,
            reader::reader_exists,
            reader::add_to_balance,
            publisher::publisher_exists,
            publisher::add_publisher,
            publisher::delete_publisher,
            publisher::deposit_publisher_balance,
            session::login_reader,
            session::login_publisher,
            session::check_cookies,
            session::logout,
            articles::owns_article,
            articles::get_article,
            articles::register_article,
            articles::purchase_article,
            // FOR DEBUGGING
            publisher::scan_publishers,
            publisher::get_account,
            reader::scan_readers,
            reader::get_account,
            email::email,
        ],
    )
}
