import { fetchPageByTitle } from "../../../utils/query";

export default (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req.query.title) {
    res.status(400);
    res.send(`{error: You need to specify an article title}`);
    return;
  }
  fetchPageByTitle(req.query.title).then(response => {
    if (!response) {
      res.status(404);
      res.send(`{error: No article found}`);
      return;
    }
    res.status(200);
    res.send(response);
  });
};
