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
  const svg = `
  <svg width="286" height="270" viewBox="0 0 286 270" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="286" height="270" rx="24" fill="url(#paint0_linear)"/>
    <g transform="translate(30,30)">
      <path d="M6.03972 19.0875C6.50123 20.0841 7.64346 22.0541 7.64346 22.0541L20.8484 0L7.96075 9.09205C7.19283 9.60962 6.5628 10.3102 6.12625 11.1319C5.53928 12.3716 5.22742 13.7259 5.21248 15.1C5.19753 16.4742 5.47986 17.8351 6.03972 19.0875Z" fill="white"/>
      <path d="M0.152014 27.1672C0.302413 29.2771 0.912202 31.3312 1.94055 33.1919C2.96889 35.0527 4.39206 36.6772 6.11475 37.9567L20.8487 48C20.8487 48 11.6303 35.013 3.85487 22.0902C3.06769 20.7249 2.5385 19.2322 2.29263 17.6835C2.1838 16.9822 2.1838 16.2689 2.29263 15.5676C2.0899 15.9348 1.69636 16.6867 1.69636 16.6867C0.907964 18.2586 0.371029 19.9394 0.104312 21.6705C-0.0492081 23.5004 -0.0332426 25.3401 0.152014 27.1672Z" fill="white"/>
      <path d="M38.1927 28.9125C37.6928 27.9159 36.4555 25.946 36.4555 25.946L22.1514 48L36.1118 38.9138C36.9436 38.3962 37.6261 37.6956 38.099 36.8739C38.7358 35.6334 39.0741 34.2781 39.0903 32.9029C39.1065 31.5277 38.8001 30.1657 38.1927 28.9125Z" fill="white"/>
      <path d="M42.8512 20.8328C42.7008 18.7229 42.0909 16.6688 41.0624 14.8081C40.0339 12.9473 38.6105 11.3228 36.8876 10.0433L22.1514 0C22.1514 0 31.3652 12.987 39.1478 25.9098C39.933 27.2755 40.4603 28.7682 40.7043 30.3165C40.8132 31.0178 40.8132 31.7311 40.7043 32.4324C40.9071 32.0652 41.3007 31.3133 41.3007 31.3133C42.0892 29.7414 42.6262 28.0606 42.893 26.3295C43.0485 24.4998 43.0345 22.66 42.8512 20.8328Z" fill="white"/>
    </g>
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="269.553" y2="285.527" gradientUnits="userSpaceOnUse">
        <stop stop-color="#2EE6CF"/>
        <stop offset="1" stop-color="#5B51D1"/>
      </linearGradient>
    </defs>
  </svg>
  `;
  try {
    return "data:image/svg+xml;base64," + b64EncodeUnicode(svg);
  } catch (e) {
    console.log("err: ", e);
    return "";
  }
}

export default (req, res) => {
  //const { name } = req.params;
  const image = getImage();
  const body = `
    <html>
      <object data=${image} type="image/svg+xml">
        <img src=${image} />
      </object>
    </html>
  `;
  res.send(body);
};
