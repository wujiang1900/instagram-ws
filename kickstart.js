var kickstart = (function () {

	var childProcess = require("child_process"),
			spawn = childProcess.spawn,
			path = require("path"),
			fs = require("fs"),
			error;

	var utils = {

		info: function (msg, type) {
			if (type === "check") {
				console.log("\033\[0;36m\[BeanStack]:\033[0m\033[0;32m\ " + msg + " √\033[0m");
			} else if (type === "info") {
				console.log("\033\[0;36m\[BeanStack]:\033[0m " + msg);
			} else if (type === "err") {
				console.log("\033\[0;31m\[BeanStack]: " + msg +"\033[0m");
			} else {
				console.log("\033\[0;36m\[BeanStack]: " + msg +"\033[0m");
			}
		},

		breakMarker: function () {
			console.log(">>>>>><<<<<<");
		}
	}

	return {

		init: function () {
			utils.info("Setting up your project!");
			utils.breakMarker();
			utils.info("Installing node modules, go grab a beer", "info");

			this.npm();
		},

		npm: function () {
			error = false;

			var nodeModules = spawn("npm", ["install"]);

			nodeModules.stdout.on('data', function (data) {
			  console.log(data.toString());
			});

			nodeModules.on("exit", function (code) {

				if (code !== 0) {
					utils.info("Error, try to run: sudo npm install.", "err");
					error = true;
				};
			});

			nodeModules.on("close", function () {

				if (!error) {
					utils.info("Node Modules Installed", "check");
				};

				this.bower();
			}.bind(this));
		},

		bower: function () {

			utils.breakMarker();
			utils.info("installing bower packages, grab more beer", "info");
			utils.breakMarker();

			var bowerInstall = spawn("bower", ["install"]);

			bowerInstall.stdout.on("data", function (data) {
				console.log(data.toString());
			});

			bowerInstall.on("close", function () {
				utils.info("Bower Packages installed", "check");
				utils.breakMarker();
				this.cleanUpRemoval();
			}.bind(this));

		},

		cleanUpRemoval: function () {
			utils.info("Cleaning up packages", "info");
			utils.breakMarker();

			var cleanJQ = spawn("rm", ["-rf", __dirname + "/public/lib/jquery/"]);
			this.bsClean();

			cleanJQ.on("close", function () {
				utils.info("jQuery cleaned!", "check");
			});	
		},

		bsClean: function () {
				var cleanFolders = [
				"grunt",
				"js",
				"less",
				"test-infra",
				"fonts",
				"dist/js"
				],

			cleanFiles = [
				".bower.json", 
				"bower.json", 
				"Gruntfile.js",
				"LICENSE",
				"package.json",
				"README.md"
			],

			counters = {
				folder: 0,
				file: 0
			},

			cleanBootFiles;

			cleanFolders.forEach(function (folder) {
				var cleanBoot = spawn("rm", ["-rf", __dirname + "/public/lib/bootstrap/" + folder +"/"]);
				counters.folder += 1;
			});


			cleanFiles.forEach(function (file) {
				cleanBootFiles = spawn("rm", [__dirname + "/public/lib/bootstrap/" + file]);
				counters.file += 1;
			});

			cleanBootFiles.on("close", function () {
				if (counters.folder === cleanFolders.length && counters.file === cleanFiles.length) {
					utils.info("Bootstrap cleaned!", "check");
					this.angularClean();
				};
			}.bind(this));

		},

		angularClean: function () {
			var files = [
				".bower.json",
				"angular.min.js.gzip",
				"README.md",
				"bower.json",
				"angular-csp.css"
			],

			cleanAngFiles,

			counter = 0;

			files.forEach(function (file) {
				cleanAngFiles = spawn("rm", [__dirname + "/public/lib/angular/" + file]);
				counter++;
			});

			cleanAngFiles.on("close", function () {
				if (counter === files.length) {
					utils.info("Angular cleaned!", "check");
					this.finished();
				};
			}.bind(this));
		},

		finished: function () {
			utils.breakMarker();
			if (!error){
				utils.info("Your all good to go, to start the server run: grunt. Your site will be at localhost:9778");
			} else {
				utils.info("Error, try to run: sudo npm install. Then run: grunt. Your site will be at localhost:9778", "err");
			}
			utils.breakMarker();
		}

	} // end return

})();

// run this tish!
kickstart.init();


