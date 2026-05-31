import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Shreeji Gruh Udhyog for Devam products.",
};

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">Contact Us</h1>
          <div className="w-24 h-1 bg-[var(--color-devam-red)] mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto font-body">
            Have questions about our premium spices, flours, or grains? Whether you're a customer or a distributor, we'd love to hear from you.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Contact Information */}
            <div className="p-8 md:p-12 bg-gray-900 text-white">
              <h3 className="text-2xl font-bold font-heading mb-8 text-[var(--color-devam-gold)]">Get In Touch</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-[var(--color-devam-red)] mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold mb-1">Shreeji Gruh Udhyog</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Godown Plot No. 5,6, City survey no. 3354,<br />
                      Block no. 1/12, Nr. Market Yard,<br />
                      Jhalod, Dahod, Gujarat - 389 170, IN
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="w-6 h-6 text-[var(--color-devam-red)] mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold mb-1">Phone</h4>
                    <p className="text-gray-300 text-sm">
                      <a href="tel:+919979640900" className="hover:text-white transition-colors">+91 99796 40900</a><br/>
                      <a href="tel:+919979540900" className="hover:text-white transition-colors">+91 99795 40900</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-[var(--color-devam-red)] mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold mb-1">Email</h4>
                    <p className="text-gray-300 text-sm">
                      <a href="mailto:info@thedevam.com" className="hover:text-white transition-colors">info@thedevam.com</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-[var(--color-devam-red)] mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold mb-1">Business Hours</h4>
                    <p className="text-gray-300 text-sm">
                      Monday - Saturday<br />
                      9:00 AM - 6:00 PM IST
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold font-heading mb-8 text-gray-900">Send us a Message</h3>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" id="name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-all" placeholder="John Doe" />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input type="text" id="subject" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-all" placeholder="How can we help you?" />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea id="message" rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-all resize-none" placeholder="Your message here..."></textarea>
                </div>
                
                <button type="button" className="w-full bg-[var(--color-devam-red)] text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors shadow-md">
                  Send Message
                </button>
              </form>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
