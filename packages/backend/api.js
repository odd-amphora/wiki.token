// TODO(teddywilson) handle errors properly
const axios = require("axios");
const cors = require("cors");
const express = require("express");

const app = express();
app.use(cors());
app.options("*", cors());

const port = 5000;

const WIKIPEDIA_API_BASE_URL = `https://en.wikipedia.org/w/api.php`;
const DEFAULT_IMAGE_URL = `https://upload.wikimedia.org/wikipedia/en/8/80/Wikipedia-logo-v2.svg`;

const buildBaseWikipediaQuery = () => {
  return `${WIKIPEDIA_API_BASE_URL}?action=query`
    .concat(`&prop=pageprops|pageimages|extracts`)
    .concat(`&exintro=`)
    .concat(`&rvprop=content`)
    .concat(`&ppprop=wikibase_item`)
    .concat(`&redirects=1`)
    .concat(`&format=json`)
    .concat(`&pithumbsize=1000`);
};

const buildPageIdQuery = pageId => {
  return `${WIKIPEDIA_API_BASE_URL}?action=query`
    .concat(`&prop=pageprops|pageimages`)
    .concat(`&exintro=`)
    .concat(`&ppprop=wikibase_item`)
    .concat(`&redirects=1`)
    .concat(`&format=json`)
    .concat(`&pithumbsize=1000`)
    .concat(`&pageids=${pageId}`);
};

const buildTitleQuery = articleName => {
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
const formatQueryResponse = response => {
  if (!response.data || !response.data.query || !response.data.query.pages) {
    return null;
  }
  const pageId = Object.keys(response.data.query.pages)[0];
  const page = response.data.query.pages[Object.keys(response.data.query.pages)[0]];
  if (!page.pageprops) {
    return null;
  }
  return {
    extract: page.extract,
    imageUrl: page.thumbnail ? page.thumbnail.source : DEFAULT_IMAGE_URL,
    pageId: pageId,
    pageTitle: page.title,
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
  const queryResponse = await axios.get(buildPageIdQuery(req.query.id));
  const formattedQueryResponse = formatQueryResponse(queryResponse);
  if (!formattedQueryResponse) {
    // TODO(teddywilson) handle not found case?
    res.status(404).send(`{error: Page not found}`);
    return;
  }
  res.status(200).send({
    title: "Asset Metadata",
    type: "object",
    properties: {
      name: {
        type: "string",
        description: formattedQueryResponse.pageId,
      },
      description: {
        type: "string",
        description: formattedQueryResponse.pageTitle,
      },
      image: {
        type: "string",
        description: formattedQueryResponse.imageUrl,
      },
    },
  });
});

app.get(`/article`, async function (req, res) {
  if (!req.query.name) {
    res.status(400);
    res.send(`{error: You need to specify an article name}`);
    return;
  }
  const queryResponse = await axios.get(buildTitleQuery(req.query.name));
  const formattedQueryResponse = formatQueryResponse(queryResponse);
  if (!formattedQueryResponse) {
    res.status(404);
    res.send(`{error: No article found}`);
    return;
  }
  res.status(200);
  res.send(formattedQueryResponse);
});
