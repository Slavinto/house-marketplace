import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase.config";
import Spinner from "../components/spinner/spinner.component";
import shareIcon from "../assets/svg/shareIcon.svg";
import Slider from "../components/slider/slider.component";

const Listing = () => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    const requestListing = async () => {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // console.log(docSnap.data());
        setListing(docSnap.data());
        setLoading(false);
      }
    };
    requestListing();
  }, [params.listingId]);
  if (loading) return <Spinner />;

  const toFormattedStr = (data) => {
    return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  console.log(listing);

  return (
    <main>
      <Slider images={listing.imageUrls} />
      <div
        className="shareIconDiv"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <img src={shareIcon} alt="share icon" />
      </div>
      {shareLinkCopied && <p className="linkCopied">Link copied!</p>}

      <div className="listingDetails">
        <p className="listingName">
          {listing.name} - ${" "}
          {listing.offer
            ? toFormattedStr(listing["discounted price"])
            : toFormattedStr(listing["regular price"])}
        </p>
        <p className="listingLocation">{listing.location}</p>
        <p className="listingType">
          For {listing.type === "sale" ? "Sale" : "Rent"}
        </p>
        {listing.offer && (
          <p className="discountPrice">
            $ {listing["regular price"] - listing["discounted price"]} discount
          </p>
        )}
        <ul className="listingDetailsList">
          <li>
            {listing.bedrooms > 1
              ? `${listing.bedrooms} Bedrooms`
              : `${listing.bedrooms} Bedroom`}
          </li>
          <li>
            {listing.bathrooms > 1
              ? `${listing.bathrooms} Bathrooms`
              : `${listing.bathrooms} Bathroom`}
          </li>
          <li>{listing.parking && "Parking Spot"}</li>
          <li>{listing.furnished && "Furnished"}</li>
        </ul>
        <p className="listingLocationTitle">Location</p>
        <div className="leafletContainer">
          <MapContainer
            style={{ height: "100%", width: "100%" }}
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
            />
            <Marker
              position={[listing.geolocation.lat, listing.geolocation.lng]}
            >
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
            className="primaryButton"
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  );
};

export default Listing;
