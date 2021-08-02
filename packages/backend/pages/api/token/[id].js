import { fetchPageById } from "../../../utils/query";

export default async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req.query.id) {
    res.status(400).send({ error: `Token id is required` });
    return;
  }
  let queryResponse = await fetchPageById(req.query.id);
  if (!queryResponse) {
    res.status(404).send({ error: `${req.query.id} not found` });
    return;
  }
  res.status(200).send({
    name: queryResponse.pageId,
    image: `${process.env.BASE_URL}/api/image/${queryResponse.pageId}`,
    description: queryResponse.pageTitle,
    meta: queryResponse.imageUrl,
    external_url: `https://en.wikipedia.org/?curid=${queryResponse.pageId}`,
    background_color: `f8f9fa`, // wikipedia card blue
  });
};
