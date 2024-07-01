import { useSearchParams } from "react-router-dom";

function DynamicSearchParamFormInputs({ searchParamKey }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsObject = Object.fromEntries(searchParams);
  console.log(searchParamsObject);
  return (
    Object.keys(searchParamsObject).filter((k) => k !== searchParamKey).length >
      0 &&
    Object.entries(searchParamsObject)
      .filter((kv) => kv[0] !== searchParamKey)
      .map((kv) => (
        <input key={kv[0]} type="hidden" name={kv[0]} value={kv[1]} />
      ))
  );
}

export default DynamicSearchParamFormInputs;
