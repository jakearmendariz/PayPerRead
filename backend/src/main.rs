#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
#[macro_use]
extern crate dotenv_codegen;
mod common;
mod mongo;
mod reader;
use rocket::http::Method;
use rocket::{get, routes};
use rocket_cors::{AllowedHeaders, AllowedOrigins};

#[get("/")]
fn index() -> String {
    "PayPerRead".to_string()
}

fn main() {
    let allowed_origins = AllowedOrigins::some_exact(&["http://localhost:3000/"]);

    let cors = rocket_cors::CorsOptions {
        allowed_origins,
        allowed_methods: vec![Method::Get].into_iter().map(From::from).collect(),
        allowed_headers: AllowedHeaders::some(&["Authorization", "Accept"]),
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors()
    .expect("CORS failure");

    let mongo_db = mongo::connect_to_mongo()
        .expect("Could not connect to mongoDB, try adding your IP address to allowlist.");
    rocket::ignite()
        .manage(mongo_db)
        .attach(cors)
        .mount(
            "/",
            routes![
                index,
                reader::scan_readers,
                reader::add_reader,
                reader::get_reader,
                reader::delete_reader,
                reader::add_to_balance,
                reader::sub_from_balance,
            ],
        )
        .launch();
}
