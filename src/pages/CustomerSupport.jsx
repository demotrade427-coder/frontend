import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiChatAlt2, HiClock, HiDocumentSearch, HiGlobe, HiMail, HiPhone, HiQuestionMarkCircle, HiShieldCheck, HiUserGroup } from 'react-icons/hi';

const supportChannels = [
  {
    title: 'Live Help Desk',
    description: 'Fast guidance for account access, funding questions, and product navigation.',
    detail: 'Best for urgent account assistance',
    icon: HiChatAlt2,
  },
  {
    title: 'Email Support',
    description: 'Detailed replies for verification, compliance review, transaction concerns, and documentation requests.',
    detail: 'Best for case-based requests',
    icon: HiMail,
  },
  {
    title: 'Phone Assistance',
    description: 'Human support for onboarding guidance and account escalation during working hours.',
    detail: 'Best for direct conversation',
    icon: HiPhone,
  },
  {
    title: 'Knowledge & FAQ',
    description: 'Self-service answers for common platform actions, timelines, and support expectations.',
    detail: 'Best for quick self-service',
    icon: HiQuestionMarkCircle,
  },
];

const serviceCommitments = [
  { title: 'Initial Reply', value: '< 24h', icon: HiClock },
  { title: 'Coverage Window', value: '24/7', icon: HiGlobe },
  { title: 'Escalation Path', value: 'Dedicated', icon: HiUserGroup },
  { title: 'Case Review', value: 'Tracked', icon: HiDocumentSearch },
];

const helpTopics = [
  'Account onboarding and access recovery',
  'Deposit and withdrawal guidance',
  'Verification and KYC document help',
  'Trading dashboard navigation',
  'Investment plan clarification',
  'Security and account protection concerns',
];

export default function CustomerSupport() {
  const [formData, setFormData] = useState({ name: '', email: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_38%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                Customer Support
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Support options designed to feel clear, premium, and always available.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-gray-400 sm:text-lg">
                Inspired by the structure of modern finance sites, this page gives customers a central place to understand
                how to get help, what response times to expect, and where each request should go.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to="/contact" className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-200">
                  Contact Support
                </Link>
                <Link to="/faq" className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10">
                  Browse FAQ
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                  <HiShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Support promise</p>
                  <p className="text-lg font-semibold text-white">Responsive, documented, and escalation-ready</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {serviceCommitments.map((item) => (
                  <div key={item.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <item.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm text-gray-300">{item.title}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Choose the right support path</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Different customer questions need different support lanes. This layout makes those choices obvious.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {supportChannels.map((channel, index) => (
              <motion.div
                key={channel.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <channel.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{channel.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-400">{channel.description}</p>
                <p className="mt-5 text-xs uppercase tracking-[0.24em] text-gray-500">{channel.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] py-20">
        <div className="max-w-7xl mx-auto grid gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold sm:text-4xl">What we help with</h2>
            <p className="mt-4 max-w-xl text-gray-400">
              Customer support pages work best when they reassure visitors that common issues are already anticipated and handled by a clear process.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {helpTopics.map((topic, index) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-gray-300"
              >
                {topic}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <h2 className="text-3xl font-bold">Send a support request</h2>
              <p className="mt-4 text-gray-400">
                This gives the public site a focused support page without changing your logged-in support ticket system.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-6 text-emerald-200">
                  Your support request has been staged successfully. You can connect this form to the backend later if needed.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    placeholder="Full name"
                    className="input-field"
                    required
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    placeholder="Email address"
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(event) => setFormData({ ...formData, topic: event.target.value })}
                    placeholder="Topic"
                    className="input-field"
                    required
                  />
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                    placeholder="Tell us how we can help"
                    className="input-field resize-none"
                    required
                  />
                  <button type="submit" className="w-full rounded-xl bg-white px-6 py-4 font-semibold text-black transition-colors hover:bg-gray-200">
                    Submit Request
                  </button>
                </form>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <h3 className="text-2xl font-semibold">Escalation flow</h3>
                <div className="mt-6 space-y-4">
                  {[
                    'Frontline support reviews the issue and confirms the request details.',
                    'Specialist teams handle payment, verification, or account-security cases.',
                    'Complex cases are escalated with documented context and tracked follow-up.',
                  ].map((item, index) => (
                    <div key={item} className="flex gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-black">
                        0{index + 1}
                      </span>
                      <p className="text-sm leading-7 text-gray-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8">
                <h3 className="text-2xl font-semibold">Need immediate help?</h3>
                <p className="mt-4 text-gray-400">
                  For urgent account access or verification questions, direct visitors to your main contact page and FAQ from here.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link to="/contact" className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-black transition-colors hover:bg-gray-200">
                    Open Contact Page
                  </Link>
                  <Link to="/certifications" className="rounded-xl border border-white/15 px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-white/10">
                    Review Certifications
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
