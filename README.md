# PayPerRead

PayPerRead is a website and service that provides an API/iframe that if added to a website will help block access to users until they pay a small fee to "own" access to that page. Enabling microtransactions for any website in exchange for its articles, artwork or hidden material.

## Tech Stack
- Rust & Rocket backend connected to mongodb
- React JS

## Provided Services
- Creates and logs in two different types of users.
    - Readers
    - Publishers
- Allows publishers to dynamically register new articles
- Checks reader access to articles
- Allows reader to purchase articles

## Articles API

#### Registering Articles
When asking PayPerRead for an iframe each website should provide a post request with the following information.
```
publisher_email: String,
article_name: String, // For publisher to identify article
article_guid: String, // For now this is provided by a client and enforced on backend
article_price: { dollars: int, cents: int },
// Maybe a publisher API key to verify this is a valid transatction. 
// For now we can assume valid, but this needs to be verified.
```

If the publisher exists and requests comes from expected domain.
- If article is Unique
    - Create the article on our backend.
- Return iframe with relevant information.

#### Buying
User wants to buy an article with payload
```
publisher_email: String,
article_guid: String,
// USER SESSION TOKEN IS MANDATORY FOR SECURITY
```
First check and handle the following cases.
- Does the reader already own the article?
- Does the publisher exist? 
- Is this their domain? 
- Does the article belong to the publisher?
- Does the user have enough money?

If all checks pass do the following.
- Add article to reader
- Subtract balance from reader
- Add balance to publisher.
