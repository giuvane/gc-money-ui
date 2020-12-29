const express = require('express');
const app = express();

app.use(express.static(__dirname + '/dist/gc-money'));

app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/dist/gc-money/index.html');
});

app.listen(process.env.PORT || 4200);
