import { fetchPageById } from "../../../utils/query";
import btoa from "btoa";

// TODO: copied from ENS - implement for wiki

function b64EncodeUnicode(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    }),
  );
}

export function getImage() {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
    '<path d="M50,3l12,36h38l-30,22l11,36l-31-21l-31,21l11-36l-30-22h38z" ' +
    'fill="#FF0" stroke="#FC0" stroke-width="2"/>' +
    "</svg>";
  try {
    return svg;
  } catch (e) {
    console.log("err: ", e);
    return "";
  }
}

export default (req, res) => {
  res.setHeader("Content-Type", "image/svg+xml");
  const image = getImage();
  const body = image;
  res.send(body);
};
