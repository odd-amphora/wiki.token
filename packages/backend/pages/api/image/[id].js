import { fetchPageById } from "../../../utils/query";

const request = require("request");

export default async (req, res) => {
  let queryResponse = await fetchPageById(req.query.id);
  if (!queryResponse) {
    res.status(404).send(`${req.query.id} not found`);
    return;
  }
  request.get(
    queryResponse.imageUrl,
    {
      encoding: "binary",
      headers: {
        "User-Agent": "WikiToken/0.0 (https://wikitoken.org)",
      },
    },
    function (err, response) {
      if (err) {
        res.status(500).send("error fetching image");
        return;
      }
      res.writeHead(200, { "Content-Type": "image/jpeg", "Cache-Control": "no-cache" });
      res.end(response.body, "binary");
    },
  );
};
