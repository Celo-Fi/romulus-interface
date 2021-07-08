export interface socialLink {
  name: string;
  alt: string;
  imageSource: string;
  link: string;
}

export const socialLinks: socialLink[] = [
  {
    name: "GitBook",
    alt: "Link to documentation",
    imageSource: "/assets/gitbook_logo_icon_168173.svg",
    link: "https://docs.romulus.page",
  },
  {
    name: "Git",
    alt: "Link to GitHub source code",
    imageSource: "/assets/GitHub-Mark/PNG/GitHub-Mark-Light-120px-plus.png",
    link: "https://github.com/Celo-Fi",
  },
  // {
  //   name: "Discord",
  //   alt: "Link to Discord discussion forum",
  //   imageSource: "/assets/Discord-Logo-White.png",
  //   link: "https://discord.com/invite/soonTM",
  // },
  // {
  //   name: "Telegram",
  //   alt: "Link to Telegram discussion channel",
  //   imageSource: "/assets/telegram-512.png",
  //   link: "https://t.me/joinchat/soonTM",
  // },
];
