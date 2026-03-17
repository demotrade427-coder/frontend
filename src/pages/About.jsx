import { motion } from 'framer-motion';
import { HiShieldCheck, HiGlobe, HiTrendingUp, HiUserGroup, HiArrowRight, HiStar, HiCheck, HiCurrencyDollar, HiUserGroup as HiUsers, HiClock, HiChartBar } from 'react-icons/hi';

function About() {
  const stats = [
    { value: '$250M+', label: 'Assets Managed', icon: HiCurrencyDollar },
    { value: '50K+', label: 'Active Investors', icon: HiUsers },
    { value: '8+', label: 'Years Experience', icon: HiClock },
    { value: '99.9%', label: 'Uptime', icon: HiChartBar },
  ];

  const values = [
    { icon: HiShieldCheck, title: 'Security First', desc: 'Your funds are protected with industry-leading security measures and encryption.', color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400' },
    { icon: HiGlobe, title: 'Global Reach', desc: 'Access investment opportunities from markets around the world.', color: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400' },
    { icon: HiTrendingUp, title: 'Proven Results', desc: 'Consistent returns that outperform traditional investment options.', color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400' },
    { icon: HiUserGroup, title: 'Community', desc: 'Join a network of successful investors sharing insights and strategies.', color: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400' },
  ];

  const timeline = [
    { year: '2014', title: 'Founded', desc: 'Started with a vision to democratize investing for everyone.', milestone: true },
    { year: '2016', title: '10K Users', desc: 'Reached our first major milestone of 10,000 active users.', milestone: false },
    { year: '2019', title: 'Global Expansion', desc: 'Expanded operations to 50+ countries worldwide.', milestone: false },
    { year: '2022', title: '$1B Managed', desc: 'Crossed $1 billion in assets under management.', milestone: true },
    { year: '2024', title: 'Industry Leader', desc: 'Recognized as one of the top investment platforms globally.', milestone: true },
    { year: '2025', title: 'AI Integration', desc: 'Launched AI-powered trading algorithms for better returns.', milestone: true },
  ];

  const team = [
    { name: 'James Wilson', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', linkedin: '#', twitter: '#' },
    { name: 'Sarah Martinez', role: 'CTO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face', linkedin: '#', twitter: '#' },
    { name: 'David Chen', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', linkedin: '#', twitter: '#' },
    { name: 'Emily Brown', role: 'Head of Compliance', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', linkedin: '#', twitter: '#' },
    { name: 'Michael Lee', role: 'Head of Trading', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', linkedin: '#', twitter: '#' },
  ];

  return (
    <div className="bg-black min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-gray-300 text-sm font-medium">Trusted by 50,000+ Investors</span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              About <span className="text-white">InvestPro</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to make quality investment opportunities accessible to everyone, 
              everywhere. Our platform combines cutting-edge technology with financial expertise 
              to deliver exceptional results.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-5 lg:p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <Icon className="w-6 lg:w-8 h-6 lg:h-8 text-white mx-auto mb-3" />
                  <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Our Core Values</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">The principles that guide everything we do.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-b ${item.color.split(' ')[0]} ${item.color.split(' ')[1]} border ${item.color.split(' ')[2]} rounded-2xl p-6 hover:border-white/40 transition-all duration-300 group`}
              >
                <div className={`w-12 h-12 rounded-xl ${item.color.split(' ')[0].replace('from-', 'bg-').replace('/20', '/30')} border ${item.color.split(' ')[2]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-6 h-6 ${item.color.split(' ')[3]}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Our Journey</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">From a small startup to an industry leader.</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'} pl-12`}>
                    <div className={`bg-white/5 border ${item.milestone ? 'border-amber-500/50' : 'border-white/10'} rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 ${i % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.milestone ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-400'}`}>
                          {item.year}
                        </span>
                        {item.milestone && (
                          <HiStar className="w-4 h-4 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                  <div className={`absolute left-0 ${i % 2 === 0 ? 'md:left-1/2' : 'md:left-1/2'} -translate-x-1/2 w-3 h-3 rounded-full ${item.milestone ? 'bg-amber-400 shadow-lg shadow-amber-400/50' : 'bg-white/30'}`}></div>
                  <div className="hidden md:block flex-1"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Meet Our Leadership</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Expert professionals dedicated to your financial success.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/30 transition-all duration-300 group"
              >
                <div className="relative mb-5">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white/10 group-hover:border-white/30 transition-all"
                  />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-black">
                    <HiCheck className="w-4 h-4 text-black" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-white font-bold">{member.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{member.role}</p>
                  <div className="flex justify-center gap-3">
                    <a href={member.linkedin} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                    <a href={member.twitter} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/20 rounded-3xl p-8 lg:p-12 text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">Join thousands of investors who are already growing their wealth with InvestPro.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/register" className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">
                <span>Get Started</span>
                <HiArrowRight className="w-5 h-5" />
              </a>
              <a href="/contact" className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all">
                <span>Contact Us</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default About;
