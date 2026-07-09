import {
  BookOpen,
  FileText,
  Github,
  Home,
  Layers3,
  Mail,
  MapPin,
  ScrollText
} from "lucide-react";

export const SITE = {
  name: "魏佳桐 / Jiatong Wei",
  shortName: "Jiatong Wei",
  title: "Jiatong Wei | Personal Wiki",
  description:
    "一个连接具身智能、机器人系统、工程项目与学术探索的个人知识站。",
  basePath: "/profile",
  email: "weijiatong@mail.nwpu.edu.cn",
  github: "https://github.com/Jiatong-Wei",
  location: "Xi'an, China",
  institution: "Northwestern Polytechnical University",
  avatar: "/profile/selfish/beger.png",
  cvPdf: "/cv/WeiJiatong-Resume.pdf",
  githubUser: "Jiatong-Wei"
};

export const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/wiki", label: "Wiki", icon: BookOpen },
  { href: "/papers", label: "Papers", icon: ScrollText },
  { href: "/projects", label: "Projects", icon: Layers3 },
  { href: SITE.cvPdf, label: "CV", icon: FileText, download: true }
];

export const contactItems = [
  { href: `mailto:${SITE.email}`, label: SITE.email, icon: Mail },
  { href: SITE.github, label: "GitHub", icon: Github },
  { href: "https://maps.google.com/?q=Northwestern+Polytechnical+University+Xi'an", label: SITE.location, icon: MapPin }
];

export const focusAreas = [
  "具身智能",
  "强化学习",
  "机器人全栈开发",
  "智能无人系统"
];

export function withBasePath(pathname: string): string {
  if (pathname.startsWith("http") || pathname.startsWith("mailto:")) {
    return pathname;
  }

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE.basePath}${normalized}`;
}
