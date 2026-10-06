import type { PostData } from "@/lib/types";
import { CityPoster } from "./posters/CityPoster";

// Every event type shares the city-photo layout; the type sets the
// headline words and the colours.
export function Poster({ data }: { data: PostData }) {
  return <CityPoster data={data} />;
}
