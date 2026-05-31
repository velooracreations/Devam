import { ShieldCheck, Leaf, Clock, ThumbsUp } from "lucide-react";

const features = [
  {
    name: "100% Pure",
    description: "Sourced directly from the finest farms.",
    icon: Leaf,
  },
  {
    name: "Premium Quality",
    description: "Stringent quality checks at every step.",
    icon: ShieldCheck,
  },
  {
    name: "Freshly Ground",
    description: "Processed traditionally to retain aroma.",
    icon: Clock,
  },
  {
    name: "Trusted by Millions",
    description: "The choice of Indian households.",
    icon: ThumbsUp,
  },
];

export function TrustBadges() {
  return (
    <section className="bg-white py-16 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col items-center text-center group">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-devam-cream)] text-[var(--color-devam-red)] mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-[var(--color-devam-brown)] mb-2">
                {feature.name}
              </h3>
              <p className="text-sm text-[var(--color-devam-brown)] font-body font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
