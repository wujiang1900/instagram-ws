This is a web app to make web api calls to Instagram endpoints, and display results on webpages. It is implemented using [AngularJS](http://angularjs.org/) and [Express](http://expressjs.com/), a flavor of [NodeJS](http://www.nodejs.org/).

The boilerplate javaScript code was generated with [BEAN Stack generator](https://www.npmjs.com/package/generator-bean-stack).

A summary of tech stack:
* **Client**: AngularJS and Twitter Bootstrap with pure html partials (no server side rendering so it's fully static and CDN ready). Bower packages are located at `public/lib`.
* **Server**: [Express](http://expressjs.com/), a flavor of [NodeJS](http://www.nodejs.org/).
* Key dependencies: Q, request (handling http requests), simpler-config (handling property config loading).
* Grunt tasks are used to facilitate development and testing.
* Web app server
## Getting Started
Make sure that you have [**Node.js**](http://expressjs.com/) installed on your computer. To start the app, do following:

```bash
git clone https://github.com/wujiang1900/instagram-ws.git
cd instagram-ws
npm install
bower install
grunt
```

You need to have Ruby and Sass installed and in your PATH for this task to work.  If you're on OS X or Linux you probably already have Ruby installed; test with ruby -v in your terminal. To install Ruby on Windows, visit http://rubyinstaller.org/downloads/. 


When you've confirmed you have Ruby installed, run gem install sass to install Sass. 

Your application should run on the default 9778 port, so in your browser just go to [http://localhost:9778/instagram/CapitalOne?count=20](http://localhost:9778/instagram/CapitalOne?count=20). 

AlchemyAPI Sentiment Analysis free service to determine the sentiment towards CapitalOne in the media. Need to register with AlchemyAPI (http://www.alchemyapi.com/api/register.html) for an AlchemyAPI key.

If you want to run tests, simply type:

```bash
npm test
```

## Configuration
Apps and envs are configured in versions.js. App servers are configured in servers.json.
