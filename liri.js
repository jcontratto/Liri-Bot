require("dotenv").config();

// NPM module used to access Twitter API.
var Twitter = require("twitter");

// Used to access Twitter keys in local file, keys.js.
var twitterKeysFile = require("./keys.js");

// NPM module used to access Spotify API.
var spotify = require("node-spotify-api");

// NPM module used to access OMDB API.
var request = require("request");

// NPM module used to read the random.txt file.
var fs = require("fs");

// Output file for logs. cant get to work for bonus
var filename = ('./log.txt');

// NPM module used for logging solution.
var log = require('simple-node-logger').createSimpleFileLogger( filename );

// All log information printed to log.txt., still doesnt work
log.setLevel('all');

// Action requested.
var action = process.argv[2];

// Optional argument to request specific information.
var argument = "";

// Controller function 
doSomething(action, argument);

// Switch operation used to determin which action to take.
function doSomething(action, argument) {

	
	argument = getThirdArgument();

	switch (action) {
		
		// Gets list of tweets.
		case "my-tweets": 
		getMyTweets();
		break;

		// Gets song information.
		case "spotify-this-song":
		
		// First gets song title argument.
		var songTitle = argument;

		// If no song title provided, defaults to specific song.
		if (songTitle === "") {
			lookupSpecificSong();

		} else {
			// Get song information from Spotify.
			getSongInfo(songTitle);
		}
		break;

		// Gets movie information.
		case "movie-this":

		var movieTitle = argument;

		// If no movie title provided, defaults to specific movie.
		if (movieTitle === "") {
			getMovieInfo("Mr. Nobody");

		} else {
			getMovieInfo(movieTitle);
		}
		break;

		// Gets text inside file, and uses it to do something.
		case "do-what-it-says": 
		doWhatItSays();
		break;
	}
}

// when requesting song information, include a song title.
function getThirdArgument() {

	// Stores arguments in array
	argumentArray = process.argv;

	for (var i = 3; i < argumentArray.length; i++) {
		argument += argumentArray[i];
	}
	return argument;
}

// Function to show my last 20 tweets.
function getMyTweets() {
	
	var client = new Twitter(twitterKeysFile.twitter);
	//console.log(twitterKeysFile.twitter);
	var params = {q: 'john97301035', count: 20};

	client.get('search/tweets', params, function(error, tweets, response) {
	  if (!error) {
	//	console.log(tweets);
		
	  	for (var i = 0; i < tweets.statuses.length; i++) {
			  var tweetText = tweets.statuses[i].text;
			  
	  		logOutput("Tweet Text: " + tweetText);
	  		var tweetCreationDate = tweets.statuses[i].created_at;
			  logOutput("Tweet Creation Date: " + tweetCreationDate);
			 
	  	}
	  } else {
	  	logOutput(error);
	  }
	});
}

// Calls Spotify API to retrieve song information for song title.
function getSongInfo(songTitle) {

	spotify.search({type: 'track', query: songTitle}, function(err, data) {
		if (err) {
			logOutput.error(err);
			return
		}

		
		var artistsArray = data.tracks.items[0].album.artists;

		// Array to hold artist names
		var artistsNames = [];

		for (var i = 0; i < artistsArray.length; i++) {
			artistsNames.push(artistsArray[i].name);
		}

		var artists = artistsNames.join(", ");

		// Prints the artist(s), track name, preview url, and album name.
		logOutput("Artist(s): " + artists);
		logOutput("Song: " + data.tracks.items[0].name)
		logOutput("Spotify Preview URL: " + data.tracks.items[0].preview_url)
		logOutput("Album Name: " + data.tracks.items[0].album.name);
	});
	
}

// When no song title provided, defaults to specific song, The Sign.
function lookupSpecificSong() {

	spotify.lookup({type: 'track', id: '3DYVWvPh3kGwPasp7yjahc'}, function(err, data) {
		if (err) {
			logOutput.error(err);
			return
		}

		logOutput("Artist: " + data.artists[0].name);
		logOutput("Song: " + data.name);
		logOutput("Spotify Preview URL: " + data.preview_url);
		logOutput("Album Name: " + data.album.name);
	});
}


// If no movie title provided, defaults to the movie, Mr. Nobody.
function getMovieInfo(movieTitle) {

	
	var queryUrl = "http://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&tomatoes=true&r=json";

	//http://www.imdb.com/title/tt0485947/

	request(queryUrl, function(error, response, body) {

	  if (!error && response.statusCode === 200) {
	    
	    
	    var movie = JSON.parse(body);

	    logOutput("Movie Title: " + movie.Title);
	    logOutput("Release Year: " + movie.Year);
	    logOutput("IMDB Rating: " + movie.imdbRating);
	    logOutput("Country Produced In: " + movie.Country);
	    logOutput("Language: " + movie.Language);
	    logOutput("Plot: " + movie.Plot);
	    logOutput("Actors: " + movie.Actors);

	    // that always returns N/A for movie.tomatoRating.
	    logOutput("Rotten Tomatoes Rating: " + movie.Ratings[2].Value);
	    logOutput("Rotten Tomatoes URL: " + movie.tomatoURL);
	  }
	});
}

// Uses fs node package to take the text inside random.txt,
function doWhatItSays() {

	fs.readFile("random.txt", "utf8", function(err, data) {
		if (err) {
			logOutput.error(err);
		} else {

			var randomArray = data.split(",");

			action = randomArray[0];

			argument = randomArray[1];

			doSomething(action, argument);
		}
	});
}

// Logs data to the terminal and output to a text file. still cant get log.text to work
function logOutput(logText) {
	log.info(logText);
	console.log(logText);
}