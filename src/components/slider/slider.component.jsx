import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";

const Slider = ({ images }) => {
  const slideImages = images.map((imgUrl, idx) => {
    return {
      url: imgUrl,
      caption: "",
    };
  });
  return (
    <div className="slide-container">
      <Slide>
        {slideImages.map((slideImage, index) => (
          <div className="each-slide" key={index}>
            <img className="swiperSlideImg" src={`${slideImage.url}`} alt="" />
          </div>
        ))}
      </Slide>
    </div>
  );
};

export default Slider;
