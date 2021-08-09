// TODO: Address all instances of `eslint-disable-next-line react-hooks/exhaustive-deps`

import React, { useEffect, useState } from "react";
import { Switch, Route, Link } from "react-router-dom";
import { Alert, Menu } from "antd";
import {
  GlobalOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";
import "./styles/App.scss";
import { Layout } from "./components";
import { About, DiscoverTokens, Sponser, TokensOfAddress } from "./views";

function App() {
  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  return (
    <div className="App">
      <Alert
        message="Wiki Token is still in development and is not yet deployed. Follow us on Twitter for updates."
        type="warning"
      />
      <Layout>
        <Menu style={{ marginBottom: 24 }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/sponser" icon={<SearchOutlined />}>
            <Link onClick={() => setRoute("/sponser")} to="/sponser" className="menu-link">
              Sponser
            </Link>
          </Menu.Item>
          <Menu.Item key="/tokens" icon={<TrophyOutlined />}>
            <Link onClick={() => setRoute("/tokens")} to="/tokens" className="menu-link">
              My Tokens
            </Link>
          </Menu.Item>
          <Menu.Item key="/discover" icon={<GlobalOutlined />}>
            <Link onClick={() => setRoute("/discover")} to="/discover" className="menu-link">
              Discover
            </Link>
          </Menu.Item>
          <Menu.Item key="/about" icon={<QuestionCircleOutlined />}>
            <Link onClick={() => setRoute("/about")} to="/about" className="menu-link" />
            About
          </Menu.Item>
        </Menu>
        <Switch>
          <Route exact path={["/about", "/"]}>
            <About />
          </Route>
          <Route exact path="/sponser">
            <Sponser />
          </Route>
          <Route path="/tokens">
            <TokensOfAddress />
          </Route>
          <Route path="/discover">
            <DiscoverTokens />
          </Route>
        </Switch>
      </Layout>
    </div>
  );
}

export default App;
