import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  Line,
  ResponsiveContainer,
} from "recharts";

// hooks
import useMatchMedia from "../hooks/useMatchMedia";

// import { format, parseISO } from "date-fns";

const TaskPercentageCompleteGUI = ({ task }) => {
  const isTabletResolution = useMatchMedia("(max-width:800px)", true);
  const isMobileResolution = useMatchMedia("(max-width:440px)", true);

  const height = isMobileResolution ? 300 : isTabletResolution ? 400 : 500;

  let percentageCompleteHistoryArray = [];
  for (let stamp in task?.percentageCompleteHistory) {
    percentageCompleteHistoryArray.push([
      stamp,
      task?.percentageCompleteHistory[stamp],
    ]);
  }
  // console.log(percentageCompleteHistoryArray);
  // const singlePercentChangePerDay = percentageCompleteHistoryArray
  //   .reverse()
  //   .filter((el1, i, ar) => {
  //     return (
  //       ar.map((el2) => el2[0].split(",")[0]).indexOf(el1[0].split(",")[0]) ===
  //       i
  //     );
  //   });
  // console.log(singlePercentChangePerDay);

  const graphData = percentageCompleteHistoryArray.map((stamp) => {
    // console.log(stamp[0].split(",")[0]);
    const dateString = stamp[0];
    const percentage = Number(stamp[1]);
    // const percentage = Number(stamp[1].split(",")[0]);
    console.log(dateString);
    return {
      date: new Date(dateString).getTime(),
      percentage,
    };
  });

  const renderCustomAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#666"
          transform="rotate(-35)"
        >
          {new Date(payload.value).toLocaleDateString()}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer height={height}>
      <LineChart
        width={730}
        height={450}
        data={graphData}
        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          type="number"
          domain={[
            new Date(task?.startDate).getTime(),
            new Date(task?.deadline).getTime(),
          ]}
          tick={renderCustomAxisTick}
        >
          <Label value="Task timeline" offset={-55} position="insideBottom" />
        </XAxis>
        <YAxis
          type="number"
          domain={[0, 100]}
          label={{ value: "Percentage %", angle: -90, position: "insideLeft" }}
        />
        {/* <Tooltip /> */}
        {/* <Legend /> */}
        <Line type="monotone" dataKey="percentage" stroke="#8884d8" />
        {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TaskPercentageCompleteGUI;
