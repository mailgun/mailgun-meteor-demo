# Mailgun & Meteor Demo

This sample app demonstrates how to build a simple IP-based geolocation and user-agent detection app on top of Meteor using the Mailgun API. You can read a description of how the app was created at: http://blog.mailgun.net/post/demo-meteor-based-emailer-with-geolocation-and-UA-tracking

### Receiving Mailgun tracking webhooks with Meteor

---

#### Clone

    git clone https://github.com/mailgun/mailgun-meteor-demo.git
    cd mailgun-meteor-demo

---

#### Configure

Required: you'll want to open */server/server.js* and update the API credentials/paths with your domain name, API key, etc. Otherwise the call to Mailgun API will fail. 

---

#### Run
    meteor run


