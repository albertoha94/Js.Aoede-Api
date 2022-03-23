const functions = require("firebase-functions");
const aoedeApp = require("aoede-net-api");

exports.api = functions.https.onRequest(aoedeApp);
