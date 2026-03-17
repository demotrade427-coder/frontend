import { motion } from 'framer-motion';
import { HiGlobe, HiShieldCheck, HiChartBar, HiCreditCard, HiPhone, HiCog } from 'react-icons/hi';

function Services() {
  const services = [
    {
      icon: HiGlobe,
      title: 'Global Markets',
      description: 'Access to international markets with real-time trading capabilities and currency conversion.',
      features: ['150+ Countries', '50+ Currencies', '24/7 Trading']
    },
    {
      icon: HiShieldCheck,
      title: 'Bank-Grade Security',
      description: 'Your assets are protected by advanced encryption and multi-factor authentication.',
      features: ['256-bit Encryption', 'Two-Factor Auth', 'Cold Storage']
    },
    {
      icon: HiChartBar,
      title: 'Advanced Analytics',
      description: 'Powerful tools to track performance, analyze trends, and optimize your portfolio.',
      features: ['Real-time Charts', 'Portfolio Analysis', 'Risk Assessment']
    },
    {
      icon: HiCreditCard,
      title: 'Easy Payments',
      description: 'Multiple funding options including bank transfers, cards, and crypto deposits.',
      features: ['Instant Deposits', 'Fast Withdrawals', 'Low Fees']
    },
    {
      icon: HiPhone,
      title: 'Mobile Trading',
      description: 'Trade anywhere with our fully featured mobile applications for iOS and Android.',
      features: ['iOS App', 'Android App', 'Push Notifications']
    },
    {
      icon: HiCog,
      title: 'Automated Investing',
      description: 'Set up recurring investments and let our algorithms manage your portfolio.',
      features: ['Auto-rebalancing', 'Recurring Buys', 'Goal Tracking']
    },
  ];

  return (
    <div className="pt-24 pb-16">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-white mb-6">Our Services</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive investment solutions designed to help you achieve your financial goals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-xl p-8 hover:scale-105 transition-transform"
              >
                <service.icon className="w-12 h-12 text-primary-500 mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-center">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Premium Features</h2>
            <p className="text-gray-400">Everything you need to succeed in your investment journey.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'VIP Support', desc: 'Dedicated account manager for premium users.' },
              { title: 'Lower Fees', desc: 'Reduced transaction fees for active investors.' },
              { title: 'Early Access', desc: 'Get early access to new investment opportunities.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-xl p-6 text-center"
              >
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Services;