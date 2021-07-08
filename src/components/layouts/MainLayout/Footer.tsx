import { css } from "@emotion/react";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Flex, Text } from "theme-ui";
import { socialLink, socialLinks } from "./SocialLinks";

export const Footer: React.FC = () => {
  return (
    <Flex
      sx={{
        width: "100%",
        px: [3, 3],
        py: [3, 3],
        flexDirection: "row",
      }}
    >
      {socialLinks.map((element: socialLink, index) => {
        return (
          <Flex sx={{ mx: 2 }} key={index}>
            <a href={element.link} target="_blank">
              <Image
                src={element.imageSource}
                width={20}
                height={20}
                alt={element.alt}
              />
            </a>
          </Flex>
        );
      })}
    </Flex>
  );
};
