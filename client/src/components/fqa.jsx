import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Frequently Asked Questions (FQA) Data Array in Simple English
 * Each object contains: id, fqa (question), answer
 */
export const FAQS = [
  {
    id: 1,
    fqa: 'How early should I book?',
    question: 'How early should I book?',
    answer: 'We recommend booking as early as possible for bridal makeup to secure your date, and at least 1 to 2 weeks in advance for party makeup.'
  },
  {
    id: 2,
    fqa: 'Do you provide home and venue service?',
    question: 'Do you provide home and venue service?',
    answer: 'Yes, we provide on-location, venue, and home services for bridal and party bookings.'
  },
  {
    id: 3,
    fqa: 'Can I reschedule my appointment?',
    question: 'Can I reschedule my appointment?',
    answer: 'Yes, you can reschedule your appointment depending on slot availability.'
  },
  {
    id: 4,
    fqa: 'Which payment methods do you accept?',
    question: 'Which payment methods do you accept?',
    answer: 'We accept UPI (GPay, PhonePe, Paytm), Cards, Net Banking, and Cash.'
  },
  {
    id: 5,
    fqa: 'Do you offer makeup trial sessions?',
    question: 'Do you offer makeup trial sessions?',
    answer: 'Yes, we offer paid trial sessions for brides to test makeup looks before the main event.'
  },
  {
    id: 6,
    fqa: 'Which makeup products do you use?',
    question: 'Which makeup products do you use?',
    answer: 'We use 100% authentic, high-quality makeup brands like MAC, NARS, Charlotte Tilbury, Huda Beauty, and Dior.'
  }
];

/**
 * Reusable Frequently Asked Questions (FQA) Component
 */
const FQA = ({ items = FAQS, title = "Frequently Asked Questions", subtitle = "Common Questions" }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="space-y-6 border-t border-border pt-12">
      {(title || subtitle) && (
        <div className="text-center max-w-2xl mx-auto space-y-2">
          {subtitle && (
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              {subtitle}
            </span>
          )}
          {title && (
            <h2 className="font-playfair text-3xl font-bold text-text">
              {title}
            </h2>
          )}
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((item, index) => {
          const isOpen = openFaqIndex === index;
          const questionText = item.fqa || item.question;
          return (
            <div
              key={item.id || index}
              className="rounded-2xl bg-surface border border-border overflow-hidden shadow-xs transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="flex items-center justify-between w-full p-5 text-left font-playfair font-bold text-sm sm:text-base text-text hover:text-primary transition-colors cursor-pointer"
              >
                <span>{questionText}</span>
                <ChevronDown
                  size={18}
                  className={`text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-text-light leading-relaxed border-t border-border/40 font-light">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FQA;
