import { fetchPageByTitle } from "../../../utils/query";

export default async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req.query.title) {
    res.status(400).send({ error: `Title is required` });
    return;
  }
  let queryResponse = await fetchPageByTitle(req.query.title);
  if (!queryResponse) {
    res.status(404).send({ error: `${req.query.title} not found` });
    return;
  }
  res.status(200).send(queryResponse);
};
