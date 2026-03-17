import { Link } from 'react-router-dom';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">IP</span>
              </div>
              <span className="text-2xl font-bold text-white">InvestPro</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-lg leading-relaxed">
              A premium investment platform providing secure, high-yield investment opportunities for smart investors worldwide.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: FaTwitter, href: '#' },
                { icon: FaFacebook, href: '#' },
                { icon: FaInstagram, href: '#' },
                { icon: FaLinkedin, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'About', path: '/about' },
                { name: 'Services', path: '/services' },
                { name: 'Plans', path: '/plans' },
                { name: 'FAQ', path: '/faq' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-gray-400">
                <HiMail className="w-5 h-5 mr-3 mt-0.5" />
                <span>support@investpro.com</span>
              </li>
              <li className="flex items-center text-gray-400">
                <HiPhone className="w-5 h-5 mr-3" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start text-gray-400">
                <HiLocationMarker className="w-5 h-5 mr-3 mt-0.5" />
                <span>New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} InvestPro. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
