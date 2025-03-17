import { Button } from "@radix-ui/themes";

import useMatchMedia from "../hooks/useMatchMedia";
import { tabletScreenWidth } from "../utility";

function HomeNavButtons({ intent, security }) {
  const isTabletResolution = useMatchMedia(`${tabletScreenWidth}`, true);

  function scrollTo(e, id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }
  return (
    <div
      className={`flex ${isTabletResolution && "flex-col"} ${
        isTabletResolution ? "gap-4" : "gap-20"
      }`}
    >
      <Button
        style={{
          backgroundColor: "#1665c0",
          color: "white",
        }}
        className={`hover:!bg-sky-700 ${
          intent === "projects-for-org" && "border-4 border-double"
        }`}
        radius="full"
        size="4"
        onClick={(e) => scrollTo(e, "projects-for-org")}
      >
        Projects for your Organisation
      </Button>
      <Button
        style={{
          backgroundColor: "#2196f3",
          color: "white",
        }}
        className={`hover:!bg-sky-700 ${
          intent === "projects-security" && "border-4 border-double"
        }`}
        radius="full"
        size="4"
        onClick={(e) => scrollTo(e, "projects-security")}
      >
        Projects Security
      </Button>
      <Button
        style={{
          backgroundColor: "#ffa726",
          color: "white",
        }}
        className={`hover:!bg-sky-700 ${
          intent === "projects-in-action" && "border-4 border-double"
        }`}
        radius="full"
        size="4"
        onClick={(e) => scrollTo(e, "projects-in-action")}
      >
        Projects in Action
      </Button>
      {security && (
        <a href="https://res.cloudinary.com/dm3g0oh2q/image/upload/v1741772784/Projects_application_security_schematic.drawio_white_f02pke.svg">
          <img
            width="100px"
            src="https://res.cloudinary.com/dm3g0oh2q/image/upload/v1741772784/Projects_application_security_schematic.drawio_white_f02pke.svg"
            alt=""
          />
        </a>
      )}
    </div>
  );
}

export default HomeNavButtons;
