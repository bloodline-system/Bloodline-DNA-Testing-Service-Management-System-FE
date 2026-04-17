import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  className?: string;
}

interface FaqProps {
  heading?: string;
  items?: FaqItem[];
  columns?: 1 | 2;
  className?: string;
}

const splitFaqItems = (items: FaqItem[], columns: 1 | 2): FaqItem[][] => {
  if (columns === 1) {
    return [items];
  }

  const perColumn = Math.ceil(items.length / columns);
  return Array.from({ length: columns }, (_, idx) =>
    items.slice(idx * perColumn, (idx + 1) * perColumn),
  );
};

const Faq = ({
  heading = "Frequently asked questions",
  columns = 1,
  items = [
    {
      id: "faq-1",
      question: "What is a FAQ?",
      answer:
        "A FAQ is a list of frequently asked questions and answers on a particular topic.",
    },
    {
      id: "faq-2",
      question: "What is the purpose of a FAQ?",
      answer:
        "The purpose of a FAQ is to provide answers to common questions and help users find the information they need quickly and easily.",
    },
    {
      id: "faq-3",
      question: "How do I create a FAQ?",
      answer:
        "To create a FAQ, you need to compile a list of common questions and answers on a particular topic and organize them in a clear and easy-to-navigate format.",
    },
    {
      id: "faq-4",
      question: "What are the benefits of a FAQ?",
      answer:
        "The benefits of a FAQ include providing quick and easy access to information, reducing the number of support requests, and improving the overall user experience.",
    },
    {
      id: "faq-5",
      question: "How should I organize my FAQ?",
      answer:
        "You should organize your FAQ in a logical manner, grouping related questions together and ordering them from most basic to more advanced topics.",
    },
    {
      id: "faq-6",
      question: "How long should FAQ answers be?",
      answer:
        "FAQ answers should be concise and to the point, typically a few sentences or a short paragraph is sufficient for most questions.",
    },
    {
      id: "faq-7",
      question: "Should I include links in my FAQ?",
      answer:
        "Yes, including links to more detailed information or related resources can be very helpful for users who want to learn more about a particular topic.",
    },
  ],
  className,
}: FaqProps) => {
  const itemColumns = splitFaqItems(items, columns);

  return (
    <section className={cn("py-24 bg-white dark:bg-background", className)}>
      <div
        className={cn("container", columns === 2 ? "max-w-6xl" : "max-w-3xl")}
      >
        <div className="mb-12 flex flex-col items-center text-center gap-4">
          <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
            Got Questions?
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-300 dark:to-white bg-clip-text text-transparent">
            {heading}
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Find answers to common questions about our DNA testing services and
            processes.
          </p>
        </div>
        <div className={cn(columns === 2 && "grid gap-8 md:grid-cols-2")}>
          {itemColumns.map((columnItems, columnIndex) => (
            <Accordion
              key={columnIndex}
              type="single"
              collapsible
              className="space-y-3"
            >
              {columnItems.map((item, itemIndex) => (
                <AccordionItem
                  key={item.id}
                  value={`item-${columnIndex}-${itemIndex}`}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl px-6 data-[state=open]:bg-gradient-to-r data-[state=open]:from-blue-50 data-[state=open]:to-white dark:data-[state=open]:from-blue-950/30 dark:data-[state=open]:to-slate-900 data-[state=open]:border-blue-200 dark:data-[state=open]:border-blue-800 transition-all duration-200"
                >
                  <AccordionTrigger className="font-semibold hover:no-underline text-left py-5 text-slate-900 dark:text-white">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Faq };
