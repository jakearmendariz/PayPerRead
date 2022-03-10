# PayPerRead

PayPerRead is a website and service that provides an API/iframe that if added to a website will help block access to users until they pay a small fee to "own" access to that page. Enabling microtransactions for any website in exchange for its articles, artwork or premium material.

## How to run
#### Backend
First install rust (nightly addition) and **add a `.env` file** with proper configuration for mongodb and google api keys
Then run
```
cd backend
cargo run
```

#### Front end
```
npm i
npm start
```

#### Dummy site
```
npm i
npm start
```

## Adding PayPerRead to Your Site
**Display iframe**
For now, you can copy the boiler plate from our dummy website in the PayPerRead.jsx file. This will create
a react.js component that handles the iframe logic. After this you only need to pass in props to identify the article
and its publisher email.

**Register Article:** Before using any of the articles, you must register the article with PayPerRead via our `/articles/register` endpoint. In the JSON body of the payload, it should have this payload.
```
{
    article_uid: String,
    publisher_email: String,
    article_name: String,
    price: {
        dollars: u32,
        cents: u32,
    },
}
```


## Tech Stack
- Rust & Rocket backend connected to mongodb
- React JS

## Provided Services
- Creates and logs in two different types of users.
    - Readers
    - Publishers
- Both users can manage their account and check their balance.
- Allows publishers to register new articles.
- Checks reader access to articles.
- Allows reader to purchase articles.
- Reader's can add funds to their account via credit card (not yet authenticated with stripe).
- Reader's can view payment history.
- Publishers can view statistics on their articles. Including how many views and how much they made off the article.
