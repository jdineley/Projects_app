import { useMatches } from "react-router-dom";
import { MdKeyboardArrowRight } from "react-icons/md";

export default function Breadcrumbs() {
  let matches = useMatches();
  let crumbs = matches
    // first get rid of any matches that don't have handle and crumb
    .filter((match) => Boolean(match.handle?.crumb))
    // now map them into an array of elements, passing the loader
    // data to each one
    .map((match) => match.handle.crumb(match.params));

  return (
    <div className="bread-crumbs">
      {crumbs.map((crumb, index, array) => (
        <span className="bread-crumb-icon" key={index}>
          <span className="crumb">{crumb}</span>
          {index < array.length - 1 && <MdKeyboardArrowRight />}
        </span>
      ))}
    </div>
  );
}
