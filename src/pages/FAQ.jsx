import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I get started with InvestPro?',
      answer: 'Simply create an account, complete verification, and choose an investment plan that suits your goals. You can start investing with as little as $50.'
    },
    {
      question: 'What is the minimum investment amount?',
      answer: 'The minimum investment varies by plan, starting from $50 for our Starter plan. You can choose plans that fit your budget and investment goals.'
    },
    {
      question: 'How are returns calculated?',
      answer: 'Returns are calculated based on the ROI percentage of your chosen plan. For example, a 10% ROI plan will give you 10% profit on your investment after the plan duration.'
    },
    {
      question: 'When can I withdraw my funds?',
      answer: 'You can request withdrawals anytime. Processing typically takes 24-48 hours. Note that profits from active investments become available after the investment period completes.'
    },
    {
      question: 'Is my investment secure?',
      answer: 'Yes, we use bank-grade encryption and security measures. Your funds are stored in secure cold wallets and we maintain regulatory compliance.'
    },
    {
      question: 'What happens if I need to cancel my investment?',
      answer: 'Investments can be cancelled during the initial 24-hour period. After this period, the investment is locked until the plan duration completes.'
    },
    {
      question: 'Do you offer referral bonuses?',
      answer: 'Yes, we offer a 5% referral bonus on any investments made by your referred friends. You can share your referral link from your dashboard.'
    },
    {
      question: 'How can I contact support?',
      answer: 'You can reach our support team through email at support@investpro.com, live chat on our platform, or by calling +1 (555) 123-4567.'
    },
  ];

  return (
    <div className="pt-24 pb-16">
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-white mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-400">
              Find answers to common questions about investing with InvestPro.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="text-white font-medium">{faq.question}</span>
                  <HiChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-gray-400">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default FAQ;