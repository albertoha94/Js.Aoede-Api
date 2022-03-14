var express = require('express');
var router = express.Router();

router.get("/", function (req, res, next) {
  res.send('Aqui mandaria todas las civilizaciones.');
    
});

module.exports = router;
