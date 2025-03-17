import { Heading, Button } from "@radix-ui/themes";

import HomeNavButtons from "../components/HomeNavButtons";

import useMatchMedia from "../hooks/useMatchMedia";
import { tabletScreenWidth } from "../utility";

export default function Home() {
  const isTabletResolution = useMatchMedia(`${tabletScreenWidth}`, true);

  return (
    <>
      <div
        style={{ height: "calc(100dvh - 89px)" }}
        className="flex flex-col items-center gap-14"
      >
        <div
          className={`flex ${
            isTabletResolution && "flex-col"
          } items-center gap-8`}
        >
          <Heading
            style={{ color: "#1665c0" }}
            size={`${isTabletResolution ? "6" : "8"}`}
            className="text-center"
          >
            Lift Your Project Management
          </Heading>
          <div
            className={`flex flex-col justify-center ${
              !isTabletResolution && "min-h-[400px]"
            } ${isTabletResolution && "items-center"} ${
              isTabletResolution ? "gap-1" : "gap-3"
            }`}
          >
            <Heading
              style={{ color: "#1665c0" }}
              size={`${isTabletResolution ? "3" : "5"}`}
              className={`${isTabletResolution && "text-center"}`}
            >
              Embedded Project Management Culture
            </Heading>
            <Heading
              style={{ color: "#ffa726" }}
              size={`${isTabletResolution ? "3" : "5"}`}
              className={`${isTabletResolution && "text-center"}`}
            >
              Fast and Accurate Project Scheduling
            </Heading>
            <Heading
              style={{ color: "#2196f3" }}
              size={`${isTabletResolution ? "3" : "5"}`}
              className={`${isTabletResolution && "text-center"}`}
            >
              Broaden the Width of Member Contributions
            </Heading>
            <Heading
              style={{ color: "#607d8b" }}
              size={`${isTabletResolution ? "3" : "5"}`}
              className={`${isTabletResolution && "text-center"}`}
            >
              Contextualised Communincation
            </Heading>
            <Heading
              style={{ color: "#1665c0" }}
              size={`${isTabletResolution ? "3" : "5"}`}
              className={`${isTabletResolution && "text-center"}`}
            >
              Holistic Project Encaptulation
            </Heading>
            <Heading
              style={{ color: "#ffa726" }}
              size={`${isTabletResolution ? "3" : "5"}`}
              className={`${isTabletResolution && "text-center"}`}
            >
              Broaden Workforce Exposure
            </Heading>
            <Heading
              style={{ color: "#2196f3" }}
              size={`${isTabletResolution ? "3" : "5"}`}
              className={`${isTabletResolution && "text-center"}`}
            >
              Enhanced Team Culture
            </Heading>
            <Heading
              style={{ color: "#607d8b" }}
              size={`${isTabletResolution ? "3" : "5"}`}
              className={`${isTabletResolution && "text-center"}`}
            >
              Handle Dynamic Resoure Allocation
            </Heading>
            <Heading
              style={{ color: "#1665c0" }}
              size={`${isTabletResolution ? "3" : "5"}`}
              className={`${isTabletResolution && "text-center"}`}
            >
              Tailored for Fast Paced Multi-Project Organisations
            </Heading>
          </div>
        </div>
        <HomeNavButtons />
      </div>
      <div
        style={{ height: "100dvh", backgroundColor: "#3A4A54" }}
        className="flex flex-col gap-14 items-center pt-10"
        id="projects-for-org"
      >
        <div className="video-container">
          <iframe
            // width="853"
            // height="505"
            src="https://www.youtube.com/embed/v0QK0M5SlDg?si=ukEhIzeJof_rhDW3"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>
        <HomeNavButtons intent={"projects-for-org"} />
      </div>
      <div
        style={{ height: "100dvh" }}
        className="flex flex-col gap-8 items-center pt-10"
        id="projects-security"
      >
        <div className="video-container">
          <iframe
            // width="853"
            // height="505"
            src="https://www.youtube.com/embed/YE5fYvvKQTc?si=S2S-DlhuVYWXGyXZ"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>
        <HomeNavButtons intent={"projects-security"} security={true} />
      </div>
      <div
        style={{ height: "100dvh", backgroundColor: "#3A4A54" }}
        className="flex flex-col gap-14 items-center pt-10"
        id="projects-in-action"
      >
        <div className="video-container">
          <iframe
            // width="853"
            // height="505"
            src="https://www.youtube.com/embed/om2yD_bw2VM?si=Jg9oe7DCxtT5UX_t"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>
        <HomeNavButtons intent={"projects-in-action"} />
      </div>
    </>
  );
}
