import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Feature {
  id: string;
  heading: string;
  description: string;
  image: string;
  url: string;
}

interface FeatureProps {
  title: string;
  description?: string;
  buttonUrl?: string;
  buttonText?: string;
  features?: Feature[];
  className?: string;
  badge?: string;
}

const Feature = ({
  title = "Key Features",
  description = "Discover the powerful features that make our platform stand out from the rest. Built with the latest technology and designed for maximum productivity.",
  buttonUrl = "https://shadcnblocks.com",
  buttonText = "Book a demo",
  badge = "Our Services",
  features = [
    {
      id: "feature-1",
      heading: "Modern Design",
      description:
        "Clean and intuitive interface built with the latest design principles. Optimized for the best user experience.",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
      url: "https://shadcnblocks.com",
    },
    {
      id: "feature-2",
      heading: "Responsive Layout",
      description:
        "Fully responsive design that works seamlessly across all devices and screen sizes. Perfect for any platform.",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg",
      url: "https://shadcnblocks.com",
    },
    {
      id: "feature-3",
      heading: "Easy Integration",
      description:
        "Simple integration process with comprehensive documentation and dedicated support team.",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg",
      url: "https://shadcnblocks.com",
    },
  ],
  className,
}: FeatureProps) => {
  return (
    <section className={cn("py-24 bg-white dark:bg-background", className)}>
      <div className="container text-center flex flex-col justify-center items-center">
        <div className="mb-12 max-w-3xl">
          <span className="inline-block px-4 py-1.5 mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
            {badge}
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-300 dark:to-white bg-clip-text text-transparent">
            {title}
          </h2>
          {description && (
            <p className="mb-8 text-muted-foreground lg:text-lg max-w-2xl mx-auto">
              {description}
            </p>
          )}
          {buttonUrl && (
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
            >
              <a
                href={buttonUrl}
                className="group flex items-center gap-2 font-medium"
              >
                {buttonText}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          )}
        </div>
        <div className="grid gap-8 md:grid-cols-3 w-full max-w-6xl">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <a href={feature.url} className="overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.heading}
                  className="aspect-16/9 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
              </a>
              <div className="px-6 py-8 md:px-8 md:py-10 text-left">
                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white md:text-2xl">
                  {feature.heading}
                </h3>
                <p className="text-muted-foreground lg:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Feature };
