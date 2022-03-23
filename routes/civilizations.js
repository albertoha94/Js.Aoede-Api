var express = require('express');
var router = express.Router();
const fs = require('fs');
const csv = require('csv-parser');
var path = require('path');
const results = [];

const fileRoute = path.resolve(__dirname, "../data/civilizations.csv");
const fileHeaders = [
  'name',
  'expansion',
  'army_type',
  'civilization_bonus'
];

const valueMapper = function ({ header, index, value }) {
  // Replace the //c with a comma (,).
  var mValue = String(value).replace('//c', ",");

  //Skip headers.
  if (header === value) {
    return value;
  }
  // Make the civilization bonus a list.
  else if (index == 3) {
    var mListData = mValue.split(';');
    return mListData;
  } else {
    return mValue;
  }
};
const onEndMapper = (itemId) => {
  if (itemId === 'all') {
    return {
      status: 200,
      data: results
    };
  } else {
    var parsedId = parseInt(itemId);
    if (isNaN(parsedId) || parsedId >= results.length) {
      return {
        status: 404,
        data: 'Unable to find element with given Id.'
      };
    } else {
      var item = results.at(parsedId);
      return {
        status: 200,
        data: item
      };
    }
  }
};

router.get("/:id", function (req, res, next) {
  fs.createReadStream(fileRoute)
    .pipe(csv({
      headers: fileHeaders,
      skipLines: 1,
      mapValues: valueMapper
    }))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      var itemId = req.params.id;
      var response = onEndMapper(itemId);
      res.status(response.status).send(response.data);
    });
});

module.exports = router;
