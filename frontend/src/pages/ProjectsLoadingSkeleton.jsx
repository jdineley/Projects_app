import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import projects from "../../dummyData";

function TableRow() {
  return (
    <tr>
      <td>
        <Skeleton width={200} height={20} />
      </td>
      <td>
        <Skeleton width={200} height={20} />
      </td>
    </tr>
  );
}

export default function Loading() {
  return (
    <SkeletonTheme
      baseColor="#5294e0"
      highlightColor="#96c7ff"
      borderRadius="0.5rem"
      duration={4}
    >
      <table className="table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Active tasks</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <TableRow key={p.title} />
          ))}
        </tbody>
      </table>
    </SkeletonTheme>
  );
}
