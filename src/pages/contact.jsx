import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const Contact = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [landlord, setLandlord] = useState(null);
  // eslint-disable-next-line
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getLandlord = async () => {
      console.log(params.landlordId);
      const docRef = doc(db, "users", params.landlordId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLoading(false);
        setLandlord(docSnap.data());
        console.log(landlord);
      } else {
        toast.error("Error loading landlord data");
        navigate("/");
      }
    };
    loading && getLandlord();
  }, [params.landlordId, loading, landlord, navigate]);

  const onChange = (e) => setMessage(e.target.value);

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Contact Landlord</p>
      </header>
      {landlord !== null && (
        <main>
          <div className="contactLandlord">
            <p className="landlordName">Contact {landlord?.name}</p>
          </div>
          <form className="messageForm">
            <div className="messageDiv">
              <label htmlFor="message" ClassName="messageLabel">
                Message
              </label>
              <textarea
                name="message"
                id="message"
                className="textarea"
                value={message}
                onChange={onChange}
              ></textarea>
            </div>
            <a
              href={`mailto:${landlord.email}?Subject=${searchParams.get(
                "listingName"
              )}&body=${message}`}
            >
              <button type="button" className="primaryButton">
                Send Message
              </button>
            </a>
          </form>
        </main>
      )}
    </div>
  );
};

export default Contact;
