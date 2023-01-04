import { useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as OfferIcon } from "../../assets/svg/localOfferIcon.svg";
import { ReactComponent as ExploreIcon } from "../../assets/svg/exploreIcon.svg";
import { ReactComponent as PersonOutlineIcon } from "../../assets/svg/personOutlineIcon.svg";

const Navbar = () => {
  const path = window.location.pathname;

  const navigate = useNavigate();
  const location = useLocation();

  const matchRoutePath = (route) => {
    return {
      fill: route === location.pathname ? "#2c2c2c" : "#777",
      width: "36px",
      height: "36px",
    };
  };

  const toggleClass = (route) => {
    return route === location.pathname
      ? "navbarListItemNameActive"
      : "navbarListItemName";
  };

  console.log(path);
  return (
    <footer className="navbar">
      <nav className="navbarNav">
        <ul className="navbarListItems">
          <li className="navbarListItem">
            <ExploreIcon
              style={matchRoutePath("/")}
              onClick={() => navigate("/")}
            />
            <p className={toggleClass("/")}>Explore</p>
          </li>
          <li className="navbarListItem">
            <OfferIcon
              style={matchRoutePath("/offers")}
              onClick={() => navigate("/offers")}
            />
            <p className={toggleClass("/offers")}>Offers</p>
          </li>
          <li className="navbarListItem">
            <PersonOutlineIcon
              style={matchRoutePath("/profile")}
              onClick={() => navigate("profile")}
            />
            <p className={toggleClass("/profile")}>Profile</p>
          </li>
        </ul>
      </nav>
    </footer>
  );
};

export default Navbar;
