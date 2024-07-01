import { useLocation, useNavigate } from "react-router-dom";

const useResetQueryParams = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPathNoQuery = location.pathname.split("?")[0];

  function resetQueryParams() {
    navigate(currentPathNoQuery);
  }

  return resetQueryParams;
};

export default useResetQueryParams;
