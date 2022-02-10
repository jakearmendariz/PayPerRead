# PayPerRead

## Articles

#### Registering Articles
First, when asking PayPerRead for an iframe it provides the
```
publisher_email: String,
article_name: String, // For publisher to identify article
article_guid: String, // For now this is provided by a client and enforced on backend
article_price: { dollars: int, cents: int },
// Maybe a publisher API key to verify this is a valid transatction. 
// For now we can assume valid, but this needs to be verified.
```

If the publisher exists, either create the article and add to publisher, then display to user. Or display to user.

#### Buying
User wants to buy an article with payload
```
publisher_email: String,
article_guid: String,
// USER SESSION TOKEN IS MANDATORY FOR SECURITY
```

Does the publisher exist? Is this their domain? Does the article belong to them?
Does the article exist for the user already? If so, do not buy again. (User obtained from session token)
Does the user have enough money?

IF ALL CHECKS PASS

Add article to reader
Subtract balance from reader
Add balance to publisher.


**Article Database**
Publisher's articles Collection
```
publisher_email: String,
articles: {
    article_guid: {
        // guid to article name
        article_name: String,
        publisher_email: String,
        created_at: Datetime,
        article_price: { dollars: int, cents: int }
    }
}
article_views: {
    // article_guid: views
    guid (String): views (uint)
}

```
Reader's articles Collection
```
reader_email: String,
article_guids: [String], // User bought articles
```
