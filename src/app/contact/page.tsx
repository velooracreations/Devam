import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata = {
  title: "Contact Us | Devam Foods",
  description: "Get in touch with Devam Foods for inquiries, bulk orders, or distributor opportunities.",
};

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      {/* Page Header */}
      <div className="bg-[var(--color-devam-brown)] text-white py-16 px-4 mb-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-[var(--color-devam-gold)] uppercase tracking-wider">
            Contact Us
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-body">
            We'd love to hear from you. Whether you have a question about our products, need help with an order, or want to partner with us.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-heading font-bold text-[var(--color-devam-red)] mb-8">
              Get In Touch
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="bg-white p-3 rounded-full shadow-sm mr-4">
                  <MapPin className="w-6 h-6 text-[var(--color-devam-gold)]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Our Headquarters</h3>
                  <p className="text-gray-600 font-body leading-relaxed">
                    SHREEJI GRUH UDHYOG<br />
                    Godown Plot No. 5,6, City survey no. 3354,<br />
                    Block no. 1/12, Nr. Market Yard,<br />
                    Jhalod, Dahod, Gujarat - 389 170, IN
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white p-3 rounded-full shadow-sm mr-4">
                  <Phone className="w-6 h-6 text-[var(--color-devam-gold)]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Phone Numbers</h3>
                  <p className="text-gray-600 font-body">
                    +91 99796 40900 / +91 99795 40900
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white p-3 rounded-full shadow-sm mr-4">
                  <Mail className="w-6 h-6 text-[var(--color-devam-gold)]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Email Address</h3>
                  <p className="text-gray-600 font-body">
                    info@thedevam.com
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white p-3 rounded-full shadow-sm mr-4">
                  <Clock className="w-6 h-6 text-[var(--color-devam-gold)]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Business Hours</h3>
                  <p className="text-gray-600 font-body">
                    Monday - Saturday: 9:00 AM - 7:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
              Send us a Message
            </h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input type="text" id="firstName" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-shadow" required />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input type="text" id="lastName" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-shadow" required />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input type="email" id="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-shadow" required />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input type="tel" id="phone" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-shadow" />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Your Message *</label>
                <textarea id="message" rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-shadow resize-none" required></textarea>
              </div>
              
              <button type="submit" className="w-full py-4 bg-[var(--color-devam-red)] text-white font-bold rounded-lg hover:bg-red-800 transition-colors shadow-md">
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
