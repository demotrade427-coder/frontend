import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiBadgeCheck, HiDocumentText, HiGlobeAlt, HiLockClosed, HiShieldCheck } from 'react-icons/hi';
import { certifications } from '../components/Certifications';

const assurancePillars = [
  {
    title: 'Security Controls',
    description: 'Layered infrastructure protection, account safeguards, and routine hardening across customer-facing systems.',
    icon: HiLockClosed,
  },
  {
    title: 'Compliance Process',
    description: 'Identity screening, transaction review, and internal policy controls designed to support responsible operations.',
    icon: HiShieldCheck,
  },
  {
    title: 'Documentation',
    description: 'Clear internal records, process evidence, and operational reporting to support audits and reviews.',
    icon: HiDocumentText,
  },
  {
    title: 'Global Standards',
    description: 'Platform procedures aligned with widely recognized privacy, support, and security expectations.',
    icon: HiGlobeAlt,
  },
];

const trustStats = [
  { label: 'Account Monitoring', value: '24/7' },
  { label: 'Security Reviews', value: 'Routine' },
  { label: 'Service Regions', value: '150+' },
  { label: 'Support Coverage', value: 'Always On' },
];

const reviewSteps = [
  {
    step: '01',
    title: 'Framework Review',
    description: 'Policies, platform controls, and customer handling processes are reviewed against our operating standards.',
  },
  {
    step: '02',
    title: 'Control Verification',
    description: 'Security, privacy, and account-protection procedures are checked for consistency across workflows.',
  },
  {
    step: '03',
    title: 'Ongoing Oversight',
    description: 'Updates, monitoring, and support readiness are maintained as the platform and customer needs evolve.',
  },
];

export default function CertificationsPage() {
  return (
    <div className="bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                Compliance Center
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Certifications, controls, and trust signals built into the platform.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-gray-400 sm:text-lg">
                This page gives visitors a dedicated place to review security posture, customer-protection practices,
                and the standards that shape how InvestPro is operated.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to="/support" className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-200">
                  View Support Options
                </Link>
                <Link to="/contact" className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10">
                  Contact Compliance Team
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {trustStats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Core assurance pillars</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Structured around the same trust-focused presentation used by premium financial sites: clear controls, visible standards, and customer confidence.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {assurancePillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <pillar.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-400">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">Visible trust indicators</h2>
              <p className="mt-4 max-w-2xl text-gray-400">
                A dedicated certification page helps visitors evaluate platform credibility before they sign up or fund an account.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              <HiBadgeCheck className="h-5 w-5" />
              Trust and compliance overview
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-3xl border ${cert.borderColor} bg-gradient-to-br ${cert.color} p-6`}
              >
                <div className={cert.iconColor}>{cert.icon}</div>
                <h3 className="mt-5 text-lg font-semibold text-white">{cert.name}</h3>
                <p className="mt-2 text-sm text-gray-300">{cert.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold sm:text-4xl">How we maintain confidence</h2>
              <p className="mt-4 max-w-xl text-gray-400">
                Visitors usually want more than badge icons. They also want to understand the process behind them. This section gives that extra clarity.
              </p>
            </motion.div>

            <div className="space-y-4">
              {reviewSteps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold text-black">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
