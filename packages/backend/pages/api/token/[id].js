import { fetchPageById } from "../../../utils/query";

export default (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req.query.id) {
    res.status(400);
    res.send(`{error: You need to specify a token id}`);
    return;
  }
  fetchPageById(req.query.id).then(response => {
    if (!response) {
      // TODO(odd-amphora) handle not found case?
      res.status(404).send(`{error: Page not found}`);
      return;
    }
    res.status(200).send({
      name: response.pageId,
      image: response.imageUrl,
      description: response.pageTitle,
    });
  });
};
