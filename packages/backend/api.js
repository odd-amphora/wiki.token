const express = require("express");
const app = express();
const port = 5000;

app.listen(port, () => {
  console.log(`Server is booming on port 5000 Visit http://localhost:5000`);
});

app.get(`/api`, async function (req, res) {
  if (!req.query.page) {
    res.status(400).send(`You need to specify a page`);
  }
  res.status(301).redirect(`https://www.wikipedia.com/wiki/${req.query.page}`);
});
