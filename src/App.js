import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Explore from "./pages/explore";
import Profile from "./pages/profile";
import PrivateRoute from "./components/private-route/private-route.component";
import SignIn from "./pages/signin";
import SignUp from "./pages/signup";
import Offers from "./pages/offers";
import CreateListings from "./pages/create-listings";
import ForgotPassword from "./pages/forgotpassword";
import Listing from "./pages/listing";
import Category from "./pages/category";
import Contact from "./pages/contact";
import Navbar from "./components/navbar/navbar.component";

function App() {
  const layout = (
    <>
      <Navbar />
      <Outlet />
      <ToastContainer />
    </>
  );

  const router = createBrowserRouter([
    {
      path: "/",
      element: layout,
      children: [
        {
          path: "/",
          element: <Explore />,
        },
        {
          path: "/offers",
          element: <Offers />,
        },
        {
          path: "/contact/:landlordId",
          element: <Contact />,
        },
        {
          path: "/create-listings",
          element: <CreateListings />,
        },
        {
          path: "/category/:categoryName",
          element: <Category />,
        },
        {
          path: "/category/:categoryName/:listingId",
          element: <Listing />,
        },
        {
          path: "/profile",
          element: <PrivateRoute />,
          children: [
            {
              path: "/profile",
              element: <Profile />,
            },
          ],
        },
        {
          path: "/sign-in",
          element: <SignIn />,
        },
        {
          path: "/sign-up",
          element: <SignUp />,
        },
        {
          path: "/forgot-password",
          element: <ForgotPassword />,
        },
      ],
    },
    {
      path: "*",
      element: <Explore />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
