import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <div className="flex flex-row p-2 bg-slate-400">
      <NavItem title="Home" path="/" />
      <NavItem title="Login" path="/login" />
    </div>
  );
};

const NavItem = ({ title, path }) => {
  return (
    <Link
      to={path}
      className="py-1 px-3 bg-white mx-1 rounded-sm cursor-pointer"
    >
      {title}
    </Link>
  );
};

export default NavBar;
