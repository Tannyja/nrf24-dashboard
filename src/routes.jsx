import { HomeIcon } from "@heroicons/react/24/solid";
import { Home } from "@/pages/dashboard";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "home",   // <── แก้ตรงนี้ อย่าใส่ "/" เด็ดขาด
        element: <Home />,
      },
    ],
  },
];

export default routes;
