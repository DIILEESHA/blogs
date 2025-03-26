import React, { Children } from "react";
import Nav from "../component/nav/Nav";

const MainLayout = () => {
  return (
    <div>
      {/* <Nav /> */}
      <main>{Children}</main>
    </div>
  );
};

export default MainLayout;
