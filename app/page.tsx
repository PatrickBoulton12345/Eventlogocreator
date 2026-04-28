"use client";

import { useState } from "react";
import { EMPTY_POST, type PostData } from "@/lib/types";
import { EventForm } from "@/components/EventForm";
import { PostPreview } from "@/components/PostPreview";
import { LfgWordmark } from "@/components/Wordmark";

export default function Home() {
  const [data, setData] = useState<PostData>(EMPTY_POST);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b-2 border-black/10 bg-[#EBE3D0]">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LfgWordmark color="#000" size={28} />
            <span className="hidden sm:inline-block text-xs text-black/55 font-body uppercase tracking-[0.2em]">
              Event Post Creator
            </span>
          </div>
          <div className="text-xs text-black/55 font-body">
            1080 × 1350 px · Instagram portrait
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight leading-none mb-2">
            create an event post
          </h1>
          <p className="font-body text-black/65 max-w-2xl">
            Pick an event type, fill in the details, and download an on-brand
            Instagram post for your chapter.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(380px,_1fr)_minmax(420px,_540px)] gap-10">
          <section>
            <EventForm data={data} onChange={setData} />
          </section>
          <section className="lg:sticky lg:top-6 lg:self-start">
            <PostPreview data={data} />
          </section>
        </div>
      </div>

      <footer className="border-t-2 border-black/10 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-4 text-xs text-black/55 font-body flex items-center justify-between">
          <span>LFG Event Post Creator · built for chapter organisers</span>
          <span>Brand colours and fonts per LFG Brand Bible</span>
        </div>
      </footer>
    </main>
  );
}
