var express = require('express');
var router = express.Router();
const fs = require('fs');
const csv = require('csv-parser');
const results = [];

const fileRoute = 'data/units.csv';
const fileHeaders = [
  'name',
  'description',
  'expansion',
  'age',
  'created_in',
  'cost',
  'build_time',
  'reload_time',
  'movement_rate',
  'line_of_sight',
  'hit_points',
  'range',
  'attack',
  'armor',
  'attack_bonus'
];

const valueMapper = function ({ header, index, value }) {
  // Replace the //c with a comma (,).
  var mValue = String(value).replace('//c', ",");

  //Skip headers.
  if (header === value) {
    return value;
  }
  // Costs are json that need to be parsed.
  else if (index == 5 && header == 'cost') {
    var mParsedData = JSON.parse(mValue);
    return mParsedData;
  }
  // Special is an array.
  else if (index == 14 && header == 'attack_bonus') {
    if (mValue.length < 1)
      return [];
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