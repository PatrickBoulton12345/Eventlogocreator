import type { PostData } from "@/lib/types";
import { HackathonPoster } from "./posters/HackathonPoster";
import { LitterPickPoster } from "./posters/LitterPickPoster";
import { PubSocialPoster } from "./posters/PubSocialPoster";
import { CustomPoster } from "./posters/CustomPoster";

export function Poster({ data }: { data: PostData }) {
  switch (data.eventType) {
    case "hackathon":
      return <HackathonPoster data={data} />;
    case "litter-pick":
      return <LitterPickPoster data={data} />;
    case "pub-social":
      return <PubSocialPoster data={data} />;
    case "custom":
      return <CustomPoster data={data} />;
  }
}
