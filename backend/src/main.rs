#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
#[macro_use]
extern crate dotenv_codegen;
extern crate lazy_static;
mod common;
mod mongo;
mod reader;
mod session;
use rocket::http::Method;
use rocket::{get, routes};
use rocket_cors::{AllowedHeaders, AllowedOrigins};

#[get("/")]
fn index() -> String {
    "PayPerRead".to_string()
}

fn create_cors() -> rocket_cors::Cors {
    let allowed_origins = AllowedOrigins::some_exact(&["http://localhost:3000/"]);

    rocket_cors::CorsOptions {
        allowed_origins,
        allowed_methods: vec![Method::Get, Method::Post, Method::Options].into_iter().map(From::from).collect(),
        allowed_headers: AllowedHeaders::some(&["*"]),
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors()
    .expect("cors failure")
}

// use rocket::http::Header;
// use rocket::{Request, Response};
// use rocket::fairing::{Fairing, Info, Kind};

// pub struct CORS;

// impl Fairing for CORS {
//     fn info(&self) -> Info {
//         Info {
//             name: "Add CORS headers to responses",
//             kind: Kind::Response
//         }
//     }

//     fn on_response(&self, request: &Request, response: &mut Response) {
//         response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
//         response.set_header(Header::new("Access-Control-Allow-Methods", "POST, GET, PATCH, OPTIONS"));
//         response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
//         response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
//     }
// }

fn rocket(mongo_db: mongo::MongoDB, cors: rocket_cors::Cors) -> rocket::Rocket {
    rocket::ignite().manage(mongo_db).attach(cors).mount(
        "/",
        routes![
            index,
            reader::scan_readers,
            reader::add_reader,
            // reader::new_reader_preflight,
            reader::get_reader,
            reader::delete_reader,
            reader::add_to_balance,
            reader::sub_from_balance,
            session::login,
            session::check_cookies,
        ],
    )
}

fn main() {
    let mongo_db = mongo::connect_to_mongo()
        .expect("Could not connect to mongoDB, try adding your IP address to allowlist.");
    let cors = create_cors();
    rocket(mongo_db, cors).launch();
}
