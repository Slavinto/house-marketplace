import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db } from "../firebase.config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/spinner/spinner.component";
import { toast } from "react-toastify";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const CreateListings = () => {
  // eslint-disable-next-line
  const [geoEnabled, setGeoEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: true,
    address: "",
    offer: false,
    "regular price": 0,
    "discounted price": 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    "regular price": regularPrice,
    "discounted price": discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;
  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate("/sign-in");
        }
      });
    }
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line
  }, [isMounted]);

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (discountedPrice >= regularPrice) {
      toast.error("Error. Check price.");
      setLoading(false);
      return;
    }

    if (images.length > 6) {
      setLoading(false);
      toast.error("Error. Too many images.");
      return;
    }

    let geolocation = {};
    let location;

    if (geoEnabled) {
      const options = {
        method: "GET",
        url: "https://forward-reverse-geocoding.p.rapidapi.com/v1/forward",
        params: {
          street: "336 N Windham Rd",
          city: "North Windham",
          state: "CT",
          postalcode: "06256",
          country: "USA",
          "accept-language": "en",
          polygon_threshold: "0.0",
        },
        headers: {
          "X-RapidAPI-Key": process.env.REACT_APP_GEOCODE_API_KEY,
          "X-RapidAPI-Host": "forward-reverse-geocoding.p.rapidapi.com",
        },
      };
      try {
        const { data } = await axios.request(options);
        geolocation.lat = data[0]?.lat ?? 0;
        geolocation.lng = data[0]?.lon ?? 0;
        location = data[0]?.display_name;
        if (data[0] === undefined) {
          console.log(data[0]);
          toast.error("Error. Incorrect address");
        }
      } catch (error) {
        toast.error("Error making remote request");
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
      // eslint-disable-next-line
      location = address;
    }

    // Store images in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${uuidv4()}-${image.name}`;
        const storageRef = ref(storage, "images/" + fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);
        console.log(fileName);
        uploadTask.on(
          "state_changed",
          (snapshot) => {},
          (error) => {
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };
    const imageUrls = await Promise.all(
      [...images].map((img) => storeImage(img))
    ).catch((error) => {
      console.log(error);
      setLoading(false);
      toast.error("Error uploading image");
    });

    const formDataCopy = {
      ...formData,
      geolocation,
      imageUrls,
      timestamp: serverTimestamp(),
    };

    formDataCopy.location = address;
    delete formDataCopy.images;
    delete formDataCopy.address;

    !formDataCopy.offer && delete formDataCopy["discounted price"];

    const docRef = await addDoc(collection(db, "listings"), formDataCopy);

    setLoading(false);

    toast.success("Listing successfully created");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  const onMutate = (e) => {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }

    // files
    if (e.target.files) {
      setFormData((prevState) => {
        return {
          ...prevState,
          images: e.target.files,
        };
      });
    }

    // bool, number, text
    if (!e.target.files) {
      setFormData((prevState) => {
        return {
          ...prevState,
          [e.target.id]: boolean ?? e.target.value,
        };
      });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Create a listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Sell/Rent</label>
          <div className="formButtons">
            <button
              className={type === "sale" ? "formButtonActive" : "formButton"}
              id="type"
              value="sale"
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              className={type === "rent" ? "formButtonActive" : "formButton"}
              id="type"
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>
          <label className="formLabel">Name</label>
          <input
            id="name"
            value={name}
            type="text"
            className="formInputName"
            onChange={onMutate}
            maxLength="32"
            minLength="10"
            required
          />

          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                type="number"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                className="formInputSmall"
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                type="number"
                id="bathrooms"
                value={bathrooms}
                onChange={onMutate}
                className="formInputSmall"
                min="1"
                max="50"
                required
              />
            </div>
          </div>
          <label className="formLabel">Parking spot</label>
          <div className="formButtons">
            <button
              className={parking ? "formButtonActive" : "formButton"}
              type="button"
              id="parking"
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="parking"
              value={false}
              onClick={onMutate}
            >
              {" "}
              No
            </button>
          </div>
          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              className={furnished ? "formButtonActive" : "formButton"}
              type="button"
              id="furnished"
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="furnished"
              value={false}
              onClick={onMutate}
            >
              {" "}
              No
            </button>
          </div>
          <label className="formLabel">Address</label>
          <textarea
            className="formInputAddress"
            type="text"
            id="address"
            value={address}
            onChange={onMutate}
            required
          ></textarea>
          {!geoEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  type="number"
                  className="formInputSmall"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  type="number"
                  className="formInputSmall"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}
          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={offer ? "formButtonActive" : "formButton"}
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              type="number"
              id="regular price"
              value={regularPrice}
              onChange={onMutate}
              min="50"
              max="750000000"
              className="formInputSmall"
              required
            />
            {type === "rent" && <p className="formPriceText">$ / Month</p>}
          </div>
          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input
                type="number"
                id="discounted price"
                value={discountedPrice}
                onChange={onMutate}
                min="50"
                max="750000000"
                className="formInputSmall"
                required={offer}
              />
            </>
          )}

          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first image will be the cover (max. 6).
          </p>
          <input
            type="file"
            className="formInputFile"
            id="images"
            onChange={onMutate}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />
          <button type="submit" className="primaryButton createListingButton">
            Create Listing
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateListings;
