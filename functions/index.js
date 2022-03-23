const functions = require("firebase-functions");
const mApp = require("../app");

exports.api = functions.https.onRequest(mApp);
