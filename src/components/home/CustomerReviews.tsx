import { Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Abhimanyou Tiwari",
    location: "Ahmedabad",
    rating: 5,
    text: "The quality of Sharbati Atta is exactly like what we used to get from the village chakki. Rotlis stay soft all day long. Very happy with Devam!",
  },
  {
    id: 2,
    name: "Akhil Jain",
    location: "Surat",
    rating: 5,
    text: "I ordered their Turmeric and Chilli powder. The color and aroma are so pure and authentic. It really elevated my cooking.",
  },
  {
    id: 3,
    name: "Devanshi Varia",
    location: "Vadodara",
    rating: 5,
    text: "Excellent packaging and fast delivery. The spices are very fresh. You can tell they don't mix anything. Highly recommended.",
  }
];

export function CustomerReviews() {
  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-[var(--color-devam-red)] mb-4 uppercase tracking-wider">
            Customer Reviews
          </h2>
          <div className="w-24 h-1 bg-[var(--color-devam-gold)] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
              <div className="flex text-[var(--color-devam-gold)] mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">
                "{review.text}"
              </p>
              <div>
                <h4 className="font-bold text-gray-900">{review.name}</h4>
                <p className="text-sm text-gray-500">{review.location}</p>
              </div>
              {/* Quote Mark Decoration */}
              <div className="absolute top-6 right-8 text-6xl text-gray-100 font-serif leading-none pointer-events-none">
                "
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
