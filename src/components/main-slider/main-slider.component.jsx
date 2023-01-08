import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase.config";
import Spinner from "../spinner/spinner.component";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";

const MainSlider = () => {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const getListings = async () => {
      const listingsRef = collection(db, "listings");
      const q = query(listingsRef, orderBy("timestamp", "desc"), limit(10));
      const querySnap = await getDocs(q);
      let listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      console.log(listings);
      setListings(listings);
      setLoading(false);
    };

    getListings();
  }, []);

  if (loading) return <Spinner />;

  return (
    listings && (
      <>
        <p className="exploreHeading">Recommended</p>
        <Slide>
          {listings.map(({ data, id }) => {
            return (
              <div
                className="swiperSlideDiv"
                key={id}
                onClick={() => navigate(`/category/${data.type}/${id}`)}
              >
                <img className="swiperSlideImg" src={`${data.imageUrls}`} />
                <p className="swiperSlideText">{data.name}</p>
                <p
                  className={
                    data.offer ? "swiperSlidePriceOffer" : "swiperSlidePrice"
                  }
                >
                  ${" "}
                  {data["discounted price"]
                    ? data["discounted price"]
                    : data["regular price"]}
                  {data.type === "rent" && " / Month"}
                </p>
              </div>
            );
          })}
        </Slide>
      </>
    )
  );
};

export default MainSlider;
