
## Getting Started

Make sure that you have [**Node.js**](http://expressjs.com/) installed on your computer. You also need to have grunt-cli installed to run grunt in command line.

To start the app, do following:

```bash

cd instagram-ws

npm install

grunt

```

You need to have Ruby and Sass installed and in your PATH for this task to work. If you're on OS X or Linux you probably already have Ruby installed; test with ruby -v in your terminal. To install Ruby on Windows, visit http://rubyinstaller.org/downloads/.

When you've confirmed you have Ruby installed, run gem install sass to install Sass.

Your application should run on the default 9778 port, so in your browser just go to [http://localhost:9778/instagram/CapitalOne?count=20](http://localhost:9778/instagram/CapitalOne?count=20).

AlchemyAPI Sentiment Analysis free service to determine the sentiment towards CapitalOne in the media. Need to register with AlchemyAPI (http://www.alchemyapi.com/api/register.html) for an AlchemyAPI key.

## Configuration

please substitute your own client_id and client_secret in instagram.json (under root directory)


## Explanation of my output

My output is a json response to the browser like the following (a screenshot is also attached for output when getting 30 recent posts):

{"mediaAndUserInfo":
	[{"type":"image",
	"created_time":"1446246385",
	"link":"https://instagram.com/p/9esThEIOqq/",
	"likeCount":2,
	"user":
		{"username":"ketelsen78","profile_picture":"https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-19/11240380_369286269943042_394066823_a.jpg","id":"55847105","full_name":"Sara Ketelsen",
	  "counts":
	    {"media":801,"followed_by":154,"follows":119}}}
	],
 "sentimentCount":
   {"positive":0,
   "negative":0,
   "neutral":1}
}

"mediaAndUserInfo" is an array that contains my answers to Question #1-3. Its "user" property is my question to Q2. The "counts" propery of mediaAndUserInfo.user is my answer to Q3. 

 "sentimentCount" property of the output json is my answer to Q4. I think I have issues either in using AlchemyAPI, or AlchemyAPI itself, but I ran out of time trying to figure out where went wrong, as well as trying to finding another 3rd party Sentiment Analysis tool for this project.

 Nevertheless, I think I've got the code structure set up right, and can be easily switch to any other 3rd party Sentiment Analysis tool for better performance.


## Explanation of my project coding:

 I constructed my project based on a simple javascript stack called BEAN stack. My code to start NodeJS (ExpressJS) server is in server.js under root directory. You can change the http server port in config.json.

 My code for handling http requests is in routes.js under /app directory.

 Here are my project dependancies:

 "dependencies": {
    "express": "^4.9.4",  		// node server
    "q": "^1.4.0", 				// handle asynch javascript tasks through the use of Promise
    "request": "^2.55.0", 		// hanlde low level http requests in my node server
    "simpler-config": "^0.0.4"	// handle processing of the config files
  }

Here is a quick explanation of the program flow: 

"instagram/CapitalOne" request is handled by function performAction() which can process any action defined in instagram.json config. It is then routed to function doCapitalOne() which changes the action type to "recentByTag" that is defined in instagram.json. Then if the program finds no instagram access_token has been set yet, it will call function getCode() to redirect the request to Instagram service getting code, which will send code back to the redirect_uri which is handled by "/instagram/confirm" route, which will call function getToken(), that will make another request to instagram service to get the token then process the action which is "recentByTag" is this case. Then it will call instagram service ("/tags/{tag-name}/media/recent" endpoint) to get the most recent posts, and extract the userId from returned json and make additional calls ("/users/{user-id}" endpoint) to get the userInfo. At the same time, the links of the user posts are sent to the 
 3rd party Sentiment Analysis API to get their sentiment value, and once all the results come back, the program will compile all the needed data and send the response back to the browser as the json output.

Due to my heavy school work, thus the time constraint, I couldn't make the sentiment analysis working as I desired, nor could I get the bonus Q4 working. But thanks for this project, which gave me a very good learning experience in server-side javascript programing and web development. I hope I can get into the boot camp in the winter break and have the opportunity to learn more from smart people around the country.

Thank you very much for your consideration! 

Please drop me an email if you have any questions. 