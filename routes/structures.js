var express = require('express');
var router = express.Router();
const fs = require('fs');
const csv = require('csv-parser');
const results = [];

const fileRoute = 'data/structures.csv';
const fileHeaders = [
    'name',
    'expansion',
    'age',
    'cost',
    'build_time',
    'hit_points',
    'line_of_sight',
    'armor',
    'range',
    'reload_time',
    'attack',
    'special'
];
const valueMapper = function ({ header, index, value }) {
    // Replace the //c with a comma (,).
    var mValue = String(value).replace('//c', ",");

    //Skip headers.
    if (header === value) {
        return value;
    }
    // Costs are json that need to be parsed.
    else if (index == 3 && header == 'cost') {
        var mParsedData = JSON.parse(mValue);
        return mParsedData;
    }
    // Special is an array.
    else if (index == 11 && header == 'special') {
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
        return results;
    } else {
        var parsedId = parseInt(itemId);
        if (isNaN(parsedId)) {
            return { 'error': 'Id not valid.' };
        } else {
            if (parsedId >= results.length) {
                return { 'error': 'Id not found.' };
            } else {
                var item = results.at(parsedId);
                return item;
            }
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
            res.send(response);
        });
});

module.exports = router;
