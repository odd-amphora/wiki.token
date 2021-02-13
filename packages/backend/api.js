const axios = require("axios");
const cors = require("cors");
const express = require("express");

const app = express();
app.use(cors());
app.options("*", cors());

const port = 5000;

const WIKIPEDIA_API_BASE_URL = `https://en.wikipedia.org/w/api.php`;

const buildWikipediaArticleQuery = articleName => {
  return `${WIKIPEDIA_API_BASE_URL}?action=query`
    .concat(`&prop=pageprops|pageimages|extracts`)
    .concat(`&exintro=`)
    .concat(`&rvprop=content`)
    .concat(`&ppprop=wikibase_item`)
    .concat(`&redirects=1`)
    .concat(`&format=json`)
    .concat(`&pithumbsize=1000`)
    .concat(`&titles=${articleName}`);
};

// Maybe return validation error instead?
const formatArticleQueryResponse = response => {
  if (!response.data || !response.data.query || !response.data.query.pages) {
    return null;
  }
  const page = response.data.query.pages[Object.keys(response.data.query.pages)[0]];
  if (!page.pageprops) {
    return null;
  }
  const wikidataId = page.pageprops.wikibase_item;
  if (!wikidataId.startsWith(`Q`)) {
    return null;
  }
  return {
    extract: page.extract,
    imageUrl: page.thumbnail ? page.thumbnail.source : "",
    wikidataId: wikidataId.substring(1),
  };
};

app.listen(port, () => {
  console.log(`Server is booming on port 5000 Visit http://localhost:5000`);
});

app.use(function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});

app.get(`/token`, async function (req, res) {
  if (!req.query.id) {
    res.status(400);
    res.send(`{error: You need to specify a token id}`);
    return;
  }
  const mockResponse = {
    title: "Asset Metadata",
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Identifies the asset to which this NFT represents",
      },
      description: {
        type: "string",
        description: "Describes the asset to which this NFT represents",
      },
      image: {
        type: "string",
        description:
          "https://www.thesprucepets.com/thmb/rD9vUV_ALr9TgRf3jHbBi_yB7xs=/960x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/beagle-RolfKopfle-Photolibrary-Getty-135631212-56a26b1d3df78cf772756667.jpg",
      },
    },
  };
  res.status(200).send(mockResponse);
});

app.get(`/article`, async function (req, res) {
  if (!req.query.name) {
    res.status(400);
    res.send(`{error: You need to specify an article name}`);
    return;
  }
  const queryResponse = await axios.get(buildWikipediaArticleQuery(req.query.name));
  const formattedResponse = formatArticleQueryResponse(queryResponse);
  if (!formattedResponse) {
    res.status(404);
    res.send(`{error: No article found}`);
    return;
  }
  res.status(200);
  res.send(formattedResponse);
});
