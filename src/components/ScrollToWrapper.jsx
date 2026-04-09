
import { Outlet } from "react-router-dom";
import ScrollToTop from "./scroll";

export default function ScrollToTopWrapper() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}