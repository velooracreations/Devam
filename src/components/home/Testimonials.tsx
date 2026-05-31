import { Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Home Chef",
    content: "The freshness of Devam's Sharbati Atta is unmatched. My rotlis stay soft for hours, and my family can taste the difference.",
  },
  {
    id: 2,
    name: "Rahul Patel",
    role: "Restaurant Owner",
    content: "We switched to Devam spices a year ago, and our customer reviews have skyrocketed. The authentic aroma is exactly what we needed.",
  },
  {
    id: 3,
    name: "Anjali Desai",
    role: "Mother of two",
    content: "I trust Devam because of their purity. No added colors or preservatives. It feels like the spices are freshly ground at home.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-[var(--color-devam-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-[var(--color-devam-brown)] mb-4">
            Loved by Indian Kitchens
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
              <div className="flex text-[var(--color-devam-gold)] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-[var(--color-devam-brown)] font-body mb-6 italic leading-relaxed font-medium">
                "{review.content}"
              </p>
              <div>
                <h4 className="font-heading font-bold text-[var(--color-devam-brown)] text-lg">
                  {review.name}
                </h4>
                <p className="text-sm text-[var(--color-devam-brown)] font-body font-medium">
                  {review.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
