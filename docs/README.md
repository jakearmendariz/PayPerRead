
# How to use PayPerRead in your site

First, create a publisher account on our website. Add your domain and email, and then register the article you want to have behind our paywall.

Then, implement our iframe into your site so that our service can ask for approval with the following line of code.

`<iframe src='http://<payperread.com>/<your_email>/<article_id>' />`

Replace the bracketed items with your information.

Then our iframe will post a message through the `Window.postMessage` api. You will need to verify that the message's origin is from our domain and that the response is a success.

The response will be a js object that looks like the following:

`{ message: "success" }`

After you have recieved this information, you can be sure that the reader has paid for the article and you can show the article contents.
