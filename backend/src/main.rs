#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
#[macro_use]
extern crate dotenv_codegen;
extern crate time;
mod articles;
mod common;
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

impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS headers to responses",
            kind: Kind::Response,
        }
    }

    fn on_response(&self, request: &Request, response: &mut Response) {
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
            response.set_sized_body(Cursor::new(""));
            response.set_status(Status::Ok);
        }
    }
}

fn rocket(mongo_db: mongo::MongoDB) -> rocket::Rocket {
    rocket::ignite().manage(mongo_db).attach(CORS).mount(
        "/",
        routes![
            index,
            reader::add_reader,
            reader::delete_reader,
            reader::reader_exists,
            publisher::publisher_exists,
            publisher::add_publisher,
            publisher::delete_publisher,
            session::login_reader,
            session::login_publisher,
            session::check_cookies,
            session::logout,
            articles::owns_article,
            articles::register_article,
            articles::purchase_article,
            // FOR DEBUGGING
            publisher::scan_publishers,
            publisher::get_account,
            reader::scan_readers,
            reader::get_account,
        ],
    )
}

fn main() {
    let mongo_db = mongo::connect_to_mongo()
        .expect("Could not connect to mongoDB, try adding your IP address to allowlist.");
    rocket(mongo_db).launch();
}
