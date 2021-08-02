const axios = require("axios");

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

const buildPageIdQuery = id => {
  return buildBaseWikipediaQuery().concat(`&pageids=${id}`);
};

const buildTitleQuery = title => {
  return buildBaseWikipediaQuery().concat(`&titles=${title}`);
};

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

export const fetchPageByTitle = title => {
  return axios.get(buildTitleQuery(title)).then(response => {
    return formatQueryResponse(response);
  });
};

export const fetchPageById = id => {
  return axios.get(buildPageIdQuery(id)).then(response => {
    return formatQueryResponse(response);
  });
};
