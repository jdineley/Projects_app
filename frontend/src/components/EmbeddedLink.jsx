import * as cheerio from "cheerio";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import {
  FaExternalLinkSquareAlt,
  FaLinkedin,
  FaYoutube,
  FaMediumM,
} from "react-icons/fa";
import { SiLoom } from "react-icons/si";

import { Box, Card, Text, Flex, Link } from "@radix-ui/themes";

const EmbeddedLink = ({ url }) => {
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [siteUrl, setSiteUrl] = useState("");

  useEffect(() => {
    const fetchOGData = async () => {
      try {
        const response = await fetch(url, {
          headers: {
            method: "GET",
            // mode: "cors",
            origin: `http://localhost:5173${location.pathname}`,
          },
        });
        const html = await response.text();

        const $ = cheerio.load(html);
        const siteName = $('meta[property="og:site_name"]').attr("content");
        const ogTitle = $('meta[property="og:title"]').attr("content");
        const ogUrl = $('meta[property="og:url"]').attr("content");
        setTitle(ogTitle || "");
        setSiteName(siteName || "");
        setSiteUrl(ogUrl || "");
        setLoading(false);
      } catch (error) {
        console.log("error", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchOGData();
  }, [url]);

  // select icon
  const linkRegex = /youtube|linkedin|loom|medium/i;
  let specificLink = null;
  if (siteName) {
    specificLink = siteName.match(linkRegex)[0].toLowerCase() || null;
  }
  console.log("specificLink", specificLink);
  let linkIcon;
  switch (specificLink) {
    case "youtube":
      linkIcon = <FaYoutube />;
      break;
    case "linkedin":
      linkIcon = <FaLinkedin />;
      break;
    case "loom":
      linkIcon = <SiLoom style={{ width: "100%", height: "100%" }} />;
      break;
    case "medium":
      linkIcon = <FaMediumM style={{ width: "100%", height: "100%" }} />;
      break;
    default:
      linkIcon = (
        <FaExternalLinkSquareAlt style={{ width: "100%", height: "100%" }} />
      );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <Box maxWidth="50%">
      <Card>
        <Flex gap="3" align="center">
          <Box width="8">{linkIcon}</Box>
          <Flex direction="column">
            <Link href={url} target="_blank">
              {title ? title.slice(0, 30) + "..." : url.slice(0, 30) + "..."}
            </Link>
            <Text size="1">{siteUrl}</Text>
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
};

export default EmbeddedLink;
