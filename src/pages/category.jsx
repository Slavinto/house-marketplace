import { useParams } from "react-router-dom";

const Category = () => {
  const params = useParams();
  console.log(params);
  return <div>Category</div>;
};

export default Category;
