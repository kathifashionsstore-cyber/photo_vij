import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import HeroSection from '../components/HeroSection';
import SEOHead from '../components/SEOHead';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    eventType: "wedding"
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'new'
      });
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        eventType: "wedding"
      });
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setError("Failed to submit message. Please try calling or emailing us directly.");
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    { label: "Phone & WhatsApp", val: "9494387387", link: "tel:9494387387", icon: Phone },
    { label: "Email Address", val: "snaplicaphotography@gmail.com", link: "mailto:snaplicaphotography@gmail.com", icon: Mail },
    { label: "Main Studio Address", val: "Ibrahimpatnam, Vijayawada, Andhra Pradesh", link: "https://maps.google.com/?q=Ibrahimpatnam,Vijayawada", icon: MapPin }
  ];

  return (
    <div className="bg-brand-dark overflow-hidden pb-24">
      <SEOHead 
        title="Contact Sonu & Crew" 
        description="Get in touch with Snaplica Photography based in Ibrahimpatnam, Vijayawada. Call 9494387387 to secure your dates." 
      />

      <HeroSection pageId="contact" />

      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left info panel */}
          <div className="space-y-8">
            <div>
              <span className="text-brand-gold text-xs uppercase tracking-[0.2em] font-semibold">
                Get in Touch
              </span>
              <h2 className="text-3xl md:text-5xl font-serif text-white font-bold mt-2">
                We'd Love to Hear From You
              </h2>
              <p className="text-gray-500 text-sm font-light mt-4 leading-relaxed">
                Have questions about services, availability, or customizable photobooks? Complete the form, or reach out directly to Sonu to coordinate dates.
              </p>
            </div>

            <div className="space-y-6">
              {contactMethods.map((method, idx) => {
                const Icon = method.icon;
                return (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-brand-gold/10 flex items-center justify-center text-brand-gold rounded-xl flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-serif font-bold text-sm">{method.label}</h4>
                      <a 
                        href={method.link} 
                        className="text-gray-400 hover:text-brand-gold text-xs mt-1 transition-colors leading-relaxed font-sans"
                        target={method.label.includes("Address") ? "_blank" : "_self"}
                        rel="noreferrer"
                      >
                        {method.val}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="h-[1px] bg-white/5" />

            {/* Studio Hours */}
            <div className="space-y-2">
              <h4 className="text-white font-serif font-bold text-sm uppercase tracking-wider">Studio Hours</h4>
              <ul className="text-xs text-gray-500 space-y-1 font-sans font-light">
                <li>Monday – Saturday: <span className="text-gray-400">9:30 AM – 8:30 PM</span></li>
                <li>Sunday: <span className="text-gray-400">By Appointment Only</span></li>
              </ul>
            </div>
          </div>

          {/* Right form panel */}
          <div className="glass-card p-8 rounded-3xl border border-white/5 relative">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-6">
              Send a Message
            </h3>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-brand-gold animate-bounce" />
                <h4 className="text-white font-serif font-bold text-lg">Message Sent!</h4>
                <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
                  Thank you for contacting Snaplica. Sonu or our operations manager will call you shortly.
                </p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2 bg-brand-gold text-black text-xs uppercase font-bold tracking-wider rounded-full hover:bg-amber-500 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-900/50 text-red-400 text-xs rounded-xl">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Your Name</label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul"
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none text-white focus:border-brand-gold transition-colors font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9494387387"
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none text-white focus:border-brand-gold transition-colors font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Email Address</label>
                  <input 
                    required
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. rahul@gmail.com"
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none text-white focus:border-brand-gold transition-colors font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Event Photography Type</label>
                  <select 
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="w-full bg-black/90 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none text-white focus:border-brand-gold transition-colors font-sans"
                  >
                    <option value="wedding">Wedding Shoot</option>
                    <option value="pre-wedding">Pre-Wedding Cinematic</option>
                    <option value="birthday">Birthday Ceremony</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="product">Product Commercial</option>
                    <option value="other">Other / Custom</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Your Message</label>
                  <textarea 
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Provide details about dates, venue, or budget expectations..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none text-white focus:border-brand-gold transition-colors font-sans resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-brand-gold hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Message <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Vijayawada Maps Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl h-96 relative">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3824.2882586711585!2d80.49071531535496!3d16.586111088563363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35f13455555555%3A0x82b406ab1cfdb690!2sIbrahimpatnam%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
            title="Snaplica Photography Location Map"
            width="100%" 
            height="100%" 
            frameBorder="0" 
            allowFullScreen="" 
            loading="lazy"
            className="absolute inset-0 grayscale contrast-125 opacity-70"
          />
        </div>
      </section>
    </div>
  );
};

export default Contact;
