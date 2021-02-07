const axios = require("axios");
const cors = require("cors");
const express = require("express");

const app = express();
app.use(cors());
app.options("*", cors());

const port = 5000;

const WIKIPEDIA_API_BASE_URL = `https://en.wikipedia.org/w/api.php`;
const WIKIPEDIA_ARTICLE_QUERY = `${WIKIPEDIA_API_BASE_URL}?action=query&prop=pageprops|pageimages&ppprop=wikibase_item&redirects=1&format=json&pithumbsize=1000&titles=`;

app.listen(port, () => {
  console.log(`Server is booming on port 5000 Visit http://localhost:5000`);
});

app.get(`/token`, async function (req, res) {
  // TODO(teddywilson)
  res.status(200).send();
});

app.get(`/article`, async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  if (!req.query.name) {
    res.status(400);
    res.send(`{error: You need to specify an article name}`);
    return;
  }
  const response = await axios.get(`${WIKIPEDIA_ARTICLE_QUERY}${req.query.name}`);
  if (response.data && response.data.query && response.data.query.pages) {
    const page = response.data.query.pages[Object.keys(response.data.query.pages)[0]];
    console.log(page);
    if (page.pageprops) {
      res.status(200);
      res.send(page);
      return;
    }
  }
  res.status(404);
  res.send(`{error: No article found}`);
});
