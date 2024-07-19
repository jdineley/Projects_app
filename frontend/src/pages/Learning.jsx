import React from "react";

// hooks
import useMatchMedia from "../hooks/useMatchMedia";

// constants
import { tabletScreenWidth } from "../utility";

const Learning = () => {
  const isTabletResolution = useMatchMedia(`${tabletScreenWidth}`, true);

  return (
    <div className="w-10/12 ml-auto mr-auto">
      <div className={!isTabletResolution && "flex gap-3"}>
        <div className={`${!isTabletResolution && "w-5/12"} mb-5`}>
          <a
            href="https://youtu.be/VmMYp2oiDcs"
            target="_blank"
            className="block mb-2"
          >
            1. Beginner's introduction: Users, Projects, Tasks
          </a>
          <a
            href="https://youtu.be/1bXMdWaUqLc"
            target="_blank"
            className="block mb-2"
          >
            2. The basics of collaboration
          </a>
          <a
            href="https://youtu.be/AYxSah6yviY"
            target="_blank"
            className="block mb-2"
          >
            3. Multiple user collaboration & Project Reviews
          </a>
          <a
            href="https://youtu.be/MY3Sb0lJmw4"
            target="_blank"
            className="block mb-2"
          >
            4. Managing user vacations
          </a>
          <a
            href="https://youtu.be/POOGlQWMS8c"
            target="_blank"
            className="block mb-2"
          >
            5. Project Dashboard and archiving projects
          </a>
        </div>
        <div className={`object-contain ${!isTabletResolution && "w-7/12"}`}>
          <img src="/Projects flyer.1.jpeg" className="w-full min-w-96" />
        </div>
      </div>
      <div className="object-contain">
        <img src="/Project short 2_cropped.gif" className="w-full min-w-96" />
      </div>
    </div>
  );
};

export default Learning;
