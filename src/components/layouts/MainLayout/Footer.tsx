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
        maxWidth: 150,
        justifyContent: "space-between",
        alignItems: "center",
      }}
      pt={[4, 3]}
      mb={4}
    >
      {socialLinks.map((element: socialLink, index) => {
        return (
          <Flex key={index}>
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
