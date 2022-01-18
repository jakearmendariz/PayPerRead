#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
#[macro_use]
extern crate dotenv_codegen;
mod mongo;
mod reader;

#[get("/")]
fn index() -> String {
    "PayPerRead".to_string()
}

fn main() {
    let mongo_db = mongo::connect_to_mongo()
        .expect("Could not connect to mongoDB, try adding your IP address to allowlist.");
    rocket::ignite()
        .manage(mongo_db)
        .mount("/", routes![index, reader::get_readers])
        .launch();
}
