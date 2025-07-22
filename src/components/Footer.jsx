import React from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';
const Footer = () => {
  const healthCheckHandle = async (e) => {
    e.preventDefault();
    try { const res = await axios.get('http://localhost:8080/api/public/healthcheck'); alert(res.data); }
    catch (err) { console.error('Healthcheck failed:', err); }
  };
  const sections = [
    { title: 'AVSwasthya', content: (<><p className="text-[#F5F5F5]/80">Experience personalized medical care from the comfort of your home.</p><p className="mt-4 text-[var(--accent-color)]">9144-784-724</p><a href="mailto:info@avswasthya.com" className="text-[var(--accent-color)] hover:opacity-80 transition-opacity">info@avswasthya.com</a></>) },
    { title: 'AVSwasthya', links: ['home', 'about', 'blog', 'contact'].map(link => ({ href: `/${link}`, label: link.charAt(0).toUpperCase() + link.slice(1).replace('contact', 'ContactUs').replace('about', 'AboutUs') })) },
    { title: 'User Services', links: ['healthcard', 'consultation', 'ecommerce', 'doctors', 'hospitals', 'clinics', 'lab-tests', 'pharmacies'].map(link => ({ href: `/${link}`, label: link.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') })) },
    { title: 'Support', links: ['faqs', 'report', 'helpdesk'].map(link => ({ href: `/${link}`, label: link === 'faqs' ? 'FAQs' : link.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') })) },
    { title: 'Legal', links: ['terms', 'privacy', 'cookies', 'trust'].map(link => ({ href: `/${link}`, label: link.charAt(0).toUpperCase() + link.slice(1).replace('terms', 'Terms & Conditions').replace('privacy', 'Privacy Policy').replace('cookies', 'Cookie Preferences').replace('trust', 'Trust Center') })) }
  ];
  return (
    <motion.footer initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' }} className="bg-[var(--primary-color)] text-[#F5F5F5] px-1 py-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        {sections.map((section, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: idx * 0.25, ease: 'easeOut' }} viewport={{ once: true }}>
            <h3 className="font-semibold text-[var(--accent-color)] text-lg mb-4">{section.title}</h3>
            {section.content}
            {section.links && <ul className="space-y-2">{section.links.map((link, i) => (<li key={i}><a href={link.href} className="hover:text-[var(--accent-color)] hover:underline transition-colors duration-200">{link.label}</a></li>))}</ul>}
          </motion.div>
        ))}
      </div>
      <div className="border-t border-[#F5F5F5]/10 mt-6 pt-4 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto">
        <div className="flex space-x-6 mb-6 md:mb-0">
          {[{ icon: FaFacebookF, url: "https://facebook.com" }, { icon: FaTwitter, url: "https://twitter.com" }, { icon: FaInstagram, url: "https://instagram.com" }, { icon: FaLinkedinIn, url: "https://linkedin.com" }]
            .map(({ icon: Icon, url }, i) => (
              <motion.a key={i} href={url} target="_blank" rel="noopener noreferrer"
                className="text-[#F5F5F5] hover:text-[var(--accent-color)]"
                whileInView={{ x: 0, opacity: 1 }} initial={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }} viewport={{ once: false, amount: 0.5 }}>
                <Icon size={22} />
              </motion.a>
            ))}
        </div>
        <div className="text-center md:text-right">
          <span className="text-[var(--accent-color)] font-semibold">AVSwasthya</span>
          <p className="text-[#F5F5F5]/60 text-sm mt-1">Copyright © 2025, AVSwasthya. All rights reserved.</p>
          <li><a href="/healthcheck" onClick={healthCheckHandle} className="text-slate-400 hover:underline text-sm">HealthCheck @Testing</a></li>
        </div>
      </div>
    </motion.footer>
  );
};
export default Footer;
