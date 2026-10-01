import type { Metadata } from "next";
import { GlobalHeader } from "@/components/global-header";
import { BrandedText, SpillWordmark } from "@/components/brand-text";
import { CategoryCarousel, type CarouselItem } from "./category-carousel";
import styles from "./album.module.css";

export const metadata: Metadata = {
  title: "Album — A Visual Tour of SPILL",
  description:
    "A quick visual look at the place, people, drinks, and media behind SPILL.",
};

type CategoryName =
  | "SPILL Overview"
  | "SPILL Livestream"
  | "SPILL Podcast"
  | "SPILL Confessional"
  | "SPILL Saigon Menu";

type GalleryItem = CarouselItem & { category: CategoryName };

const galleryItems: GalleryItem[] = [
  { title: "What is SPILL", category: "SPILL Overview", type: "video", src: "/assets/spill/home/what-is-spill.mp4", poster: "/assets/spill/home/what-is-spill-poster.jpg" },
  { title: "Welcome to SPILL", category: "SPILL Overview", type: "video", src: "/assets/spill/home/hero-v2.mp4", poster: "/assets/spill/home/hero-v2-poster.jpg" },
  { title: "Saigon after dark", category: "SPILL Overview", type: "image", src: "/assets/spill/home/venue-night.jpg", alt: "SPILL Saigon glowing at night" },
  { title: "Daylight arrival", category: "SPILL Overview", type: "image", src: "/assets/spill/concept-exterior-day.webp", alt: "SPILL café bar exterior during the day" },
  { title: "The SPILL experience", category: "SPILL Overview", type: "video", src: "/assets/spill/home/about.mp4", poster: "/assets/spill/home/about-poster.jpg" },

  { title: "Live at SPILL", category: "SPILL Livestream", type: "video", src: "/assets/spill/home/livestream-promotion.mp4", poster: "/assets/spill/home/livestream-promotion-poster.jpg" },
  { title: "A live audience", category: "SPILL Livestream", type: "image", src: "/assets/spill/livestream/hero.png", alt: "A SPILL livestream surrounded by a live audience" },
  { title: "Connected reach", category: "SPILL Livestream", type: "image", src: "/assets/spill/livestream/connected-reach.png", alt: "SPILL livestream connected reach" },
  { title: "Founder interviews", category: "SPILL Livestream", type: "image", src: "/assets/spill/livestream/Founder interviews.png", alt: "Founder interview at SPILL" },
  { title: "Panel conversations", category: "SPILL Livestream", type: "image", src: "/assets/spill/livestream/Panel conversations.png", alt: "Panel conversation at SPILL" },
  { title: "Product introductions", category: "SPILL Livestream", type: "image", src: "/assets/spill/livestream/Product introductions.png", alt: "Product introduction at SPILL" },
  { title: "Brand storytelling", category: "SPILL Livestream", type: "image", src: "/assets/spill/livestream/Brand storytelling.png", alt: "Brand storytelling at SPILL" },

  { title: "Long-form conversations", category: "SPILL Podcast", type: "video", src: "/assets/spill/home/podcast.mp4", poster: "/assets/spill/home/podcast-poster.jpg" },
  { title: "Inside the studio", category: "SPILL Podcast", type: "image", src: "/assets/spill/podcast/hero.png", alt: "Guests recording a SPILL podcast" },
  { title: "Podcast production", category: "SPILL Podcast", type: "video", src: "/assets/spill/podcast/production.mp4", poster: "/assets/spill/podcast/hero.png" },
  { title: "Brand formats", category: "SPILL Podcast", type: "image", src: "/assets/spill/podcast/brand-formats.jpg", alt: "SPILL podcast brand formats" },
  { title: "Founders", category: "SPILL Podcast", type: "image", src: "/assets/spill/podcast/featured-founders.jpg", alt: "Founders featured on SPILL Podcast" },
  { title: "People", category: "SPILL Podcast", type: "image", src: "/assets/spill/podcast/featured-people.jpg", alt: "People featured on SPILL Podcast" },
  { title: "Culture", category: "SPILL Podcast", type: "image", src: "/assets/spill/podcast/featured-culture.jpg", alt: "Culture featured on SPILL Podcast" },
  { title: "Batch production", category: "SPILL Podcast", type: "image", src: "/assets/spill/podcast/batch-production.png", alt: "SPILL podcast batch production" },

  { title: "Step inside", category: "SPILL Confessional", type: "video", src: "/assets/spill/confessional/promotion.mp4", poster: "/assets/spill/confessional/promotion-poster.jpg" },
  { title: "The booth", category: "SPILL Confessional", type: "image", src: "/assets/spill/confessional/hero.png", alt: "The SPILL Confessional booth" },
  { title: "Confessional concept", category: "SPILL Confessional", type: "image", src: "/assets/spill/concept-confessional.webp", alt: "SPILL Confessional concept" },
  { title: "Public format", category: "SPILL Confessional", type: "image", src: "/assets/spill/confessional/public-format.png", alt: "SPILL Confessional public format" },
  { title: "Private format", category: "SPILL Confessional", type: "image", src: "/assets/spill/confessional/private-format.png", alt: "SPILL Confessional private format" },
  { title: "Long-form format", category: "SPILL Confessional", type: "image", src: "/assets/spill/confessional/long-form-format.png", alt: "SPILL Confessional long-form format" },
  { title: "Content engine", category: "SPILL Confessional", type: "image", src: "/assets/spill/confessional/content-engine.png", alt: "SPILL Confessional content engine" },
  { title: "Food and beverage integration", category: "SPILL Confessional", type: "image", src: "/assets/spill/confessional/fnb-integration.png", alt: "SPILL Confessional food and beverage integration" },
  { title: "Self-contained and relocatable", category: "SPILL Confessional", type: "image", src: "/assets/spill/confessional/self-contained-relocatable.png", alt: "SPILL Confessional relocatable booth" },

  { title: "Coffee, drinks and bites", category: "SPILL Saigon Menu", type: "video", src: "/assets/spill/menu/hero.mp4", poster: "/assets/spill/menu/hero-poster.jpg" },
  { title: "Menu overview", category: "SPILL Saigon Menu", type: "image", src: "/assets/spill/concept-menu.webp", alt: "SPILL signature menu and drinks" },
  { title: "Coffee at SPILL", category: "SPILL Saigon Menu", type: "image", src: "/assets/spill/home/coffee.jpg", alt: "SPILL coffee packaging" },
  { title: "Coffee", category: "SPILL Saigon Menu", type: "image", src: "/assets/spill/menu/coffee.webp", contain: true },
  { title: "Matcha and tea", category: "SPILL Saigon Menu", type: "image", src: "/assets/spill/menu/matcha-tea.webp", contain: true },
  { title: "Fruit and yogurt", category: "SPILL Saigon Menu", type: "image", src: "/assets/spill/menu/fruit-yogurt.webp", contain: true },
  { title: "Bites and sweets", category: "SPILL Saigon Menu", type: "image", src: "/assets/spill/menu/bite-sweets.webp", contain: true },
  { title: "Beer", category: "SPILL Saigon Menu", type: "image", src: "/assets/spill/menu/beer.webp", contain: true },
  { title: "Wine", category: "SPILL Saigon Menu", type: "image", src: "/assets/spill/menu/wine.webp", contain: true },
  { title: "SPILL signatures", category: "SPILL Saigon Menu", type: "image", src: "/assets/spill/menu/spill-signature.webp", contain: true },
  { title: "Full menu", category: "SPILL Saigon Menu", type: "image", src: "/assets/spill/menu/extra-page.webp", contain: true },
];

const categories: { id: string; name: CategoryName }[] = [
  { id: "overview", name: "SPILL Overview" },
  { id: "livestream", name: "SPILL Livestream" },
  { id: "podcast", name: "SPILL Podcast" },
  { id: "confessional", name: "SPILL Confessional" },
  { id: "saigon-menu", name: "SPILL Saigon Menu" },
];

export default function AlbumPage() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <GlobalHeader />
      </div>

      <section className={styles.intro}>
        <div>
          <p className={styles.eyebrow}><SpillWordmark /> / Visual album</p>
          <h1>Album</h1>
        </div>
        <p className={styles.introCopy}>
          A quick visual look at the place, people, drinks, and media behind <SpillWordmark />.
        </p>
      </section>

      <div className={styles.categories}>
        {categories.map((category, categoryIndex) => {
          const items = galleryItems.filter(
            (item) => item.category === category.name,
          );

          return (
            <section
              className={styles.category}
              id={category.id}
              key={category.id}
              data-section-navigator
              aria-labelledby={`${category.id}-heading`}
            >
              <div className={styles.categoryHeader}>
                <span>0{categoryIndex + 1}</span>
                <h2 id={`${category.id}-heading`}><BrandedText text={category.name} /></h2>
              </div>
              <CategoryCarousel items={items} category={category.name} />
            </section>
          );
        })}
      </div>
    </main>
  );
}
