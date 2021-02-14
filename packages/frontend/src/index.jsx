import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.scss";
import App from "./App";
import { Footer } from "./components";

ReactDOM.render([<App key="1" />, <Footer key="2" />], document.getElementById("root"));
