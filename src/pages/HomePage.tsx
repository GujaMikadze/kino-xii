import ComingSoon from "../features/home/ComingSoon";
import Hero from "../features/home/Hero";
import NowPlaying from "../features/home/NowPlaying";
import RecentlyViewed from "../features/home/RecentlyViewed";

export default function HomePage() {
  return (
    <>
      <Hero />
      <RecentlyViewed />
      <NowPlaying />
      <ComingSoon />
    </>
  );
}