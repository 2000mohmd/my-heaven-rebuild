import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import storyHero from "@/assets/story-hero.jpg.asset.json";
import storyBerries from "@/assets/story-berries.jpg.asset.json";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "Our Story — Heaven Beauty" },
      {
        name: "description",
        content:
          "Founded by Lebanese beauty influencer Sarah Hammoud, Heaven Beauty was born from years of testing to enhance your natural glow.",
      },
      { property: "og:title", content: "Our Story — Heaven Beauty" },
      {
        property: "og:description",
        content:
          "The story behind Heaven Beauty — soft, radiant tints designed to enhance your natural beauty.",
      },
      { property: "og:image", content: storyHero.url },
      { property: "og:type", content: "article" },
    ],
  }),
  component: OurStoryPage,
});

const HEAD_STYLE = { fontFamily: "var(--font-mattone)", fontWeight: 300 } as const;

function OurStoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Section 1 — Welcome */}
      <section className="pt-28 md:pt-36">
        <Reveal direction="up">
          <h1
            className="mx-auto max-w-4xl px-6 text-center text-primary text-4xl leading-[1.1] md:px-8 md:text-6xl lg:text-7xl"
            style={HEAD_STYLE}
          >
            Welcome To<br />Heaven Beauty
          </h1>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-6xl gap-12 px-6 pb-4 md:grid-cols-2 md:gap-16 md:px-8">
          <Reveal direction="up">
            <div>
              <h2 className="text-primary text-2xl md:text-3xl" style={HEAD_STYLE}>
                The story
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-foreground/80 md:text-[15px]">
                Founded by Lebanese beauty influencer Sarah Hammoud, the brand
                was born from years of testing, reviewing, and understanding
                what truly works — and what doesn't. With a deep connection to
                her audience, Sarah set out to create products that deliver
                flawless results while meeting the expectations of a modern,
                mindful generation.
              </p>
            </div>
          </Reveal>
          <div />
        </div>
      </section>

      {/* Section 2 — Model image + Heavenly Difference */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-24 md:grid-cols-2 md:gap-16 md:px-8">
        <Reveal direction="left">
          <div className="overflow-hidden">
            <img
              src={storyHero.url}
              alt="Model with soft pink Heaven Beauty blush and tint"
              className="h-[520px] w-full object-cover md:h-[640px]"
            />
          </div>
        </Reveal>
        <Reveal direction="right" delay={150}>
          <div className="flex h-full items-end md:pb-4">
            <div>
              <h3 className="text-primary text-xl md:text-2xl" style={HEAD_STYLE}>
                The Heavenly Difference
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/80 md:text-[15px]">
                Each product is designed as a one-step essential — simple,
                effective, and refined. From weightless textures to
                long-lasting, luminous shades, everything we create is made to
                elevate your everyday routine with ease.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Section 3 — The Beginning */}
      <section className="pb-28">
        <Reveal direction="up">
          <div className="mx-auto max-w-3xl px-6 text-center md:px-8">
            <h2 className="text-primary text-4xl md:text-5xl" style={HEAD_STYLE}>
              The Beginnning
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-foreground/80 md:text-[15px]">
              We started with tints for lips and cheeks. Since then, we have
              crafted each formula to enhance your natural radiance effortlessly.
            </p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={120}>
          <div className="mx-auto mt-14 max-w-5xl px-6 md:px-8">
            <img
              src={storyBerries.url}
              alt="Heaven Beauty tint bottles with fresh berries"
              className="w-full object-cover"
            />
          </div>
        </Reveal>

        {/* Pillars */}
        <Reveal direction="up" delay={200}>
          <ul className="mx-auto mt-16 flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-primary md:px-8 md:text-xs">
            <li>Cruelty Free</li>
            <li>Lightweight Feel</li>
            <li>Vegan and Conscious</li>
            <li>Self-Love Infused</li>
          </ul>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
