import { fetchPageById } from "../../../utils/query";

const request = require("request");

export default async (req, res) => {
  let queryResponse = await fetchPageById(req.query.id);
  if (!queryResponse) {
    res.status(404).send(`${req.query.id} not found`);
    return;
  }
  request.get(queryResponse.imageUrl, { encoding: "binary" }, function (_, response) {
    res.writeHead(200, { "Content-Type": "image/jpeg", "Cache-Control": "no-cache" });
    res.end(response.body, "binary");
  });
};
