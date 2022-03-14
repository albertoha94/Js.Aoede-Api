var express = require('express');
var router = express.Router();
const fs = require('fs');
const csv = require('csv-parser');
const results = [];

const fileRoute = 'data/civilizations.csv';
const fileHeaders = ['name', 'expansion', 'army_type', 'civilization_bonus'];

router.get("/all", function (req, res, next) {
  fs.createReadStream(fileRoute)
    .pipe(csv({
      headers: fileHeaders,
      skipLines: 1,
      mapValues: function ({ header, index, value }) {

        // Make the civilization bonus a list.
        var mValue = String(value).replace('//c', ",");
        if (index == 3) {
          var mListData = mValue.split(';');
          return mListData;
        } else {
          return mValue;
        }
      },

    }))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log(results);
      res.send(results);
    });
});

module.exports = router;
