"use client";

import { useState } from "react";
import { User, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
    agreedToPrivacy: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      message: "",
      agreedToPrivacy: false,
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="py-24 bg-gradient-to-b dark:from-background dark:to-slate-900">
      <div className="container">
        <div className="mb-12 flex flex-col items-center text-center gap-4 mx-auto max-w-3xl">
          <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
            Get In Touch
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-300 dark:to-white bg-clip-text text-transparent">
            Start Your DNA Journey Today
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Have questions about our DNA testing services? Our expert team is
            here to guide you through every step of the process.
          </p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2 max-w-6xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <User className="text-blue-500 absolute top-3.5 left-3 h-5 w-5" />
                  <Input
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 pl-10 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="relative">
                  <User className="text-blue-500 absolute top-3.5 left-3 h-5 w-5" />
                  <Input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 pl-10 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <Phone className="text-blue-500 absolute top-3.5 left-3 h-5 w-5" />
                <Input
                  placeholder="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 pl-10 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="text-blue-500 absolute top-3.5 left-3 h-5 w-5" />
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 pl-10 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <Textarea
                  placeholder="Tell us about your DNA testing needs..."
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 min-h-32 resize-none rounded-xl focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="privacy"
                  checked={formData.agreedToPrivacy}
                  onCheckedChange={(checked) =>
                    handleChange("agreedToPrivacy", checked)
                  }
                  className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                  htmlFor="privacy"
                  className="text-muted-foreground text-sm leading-relaxed"
                >
                  I have read and agree to the{" "}
                  <Link
                    to={"#"}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    privacy policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-base font-semibold shadow-lg shadow-blue-500/25"
              >
                Send Your Message
              </Button>
            </form>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700">
              <img
                src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&h=800&fit=crop"
                alt="DNA laboratory testing and genetic research"
                className="h-[500px] lg:h-[580px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Why Choose Bloodline?
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      99.9% accuracy in DNA testing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Results in 3-5 business days
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Secure & confidential handling
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
