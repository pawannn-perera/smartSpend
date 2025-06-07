const About = () => {
  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-indigo-900 tracking-tight sm:text-5xl">
            About SmartSpend
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Your trusted partner in personal finance management
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <div className="space-y-8">
            {/* Description */}
            <div>
              <p className="text-slate-600 leading-relaxed">
                SmartSpend is a powerful personal finance management
                application designed to simplify your financial life.
                Whether you're tracking expenses, managing bills, or
                keeping tabs on warranties, SmartSpend has you covered.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Our mission is to empower you with the tools and insights
                needed to make informed financial decisions and achieve
                your goals with confidence.
              </p>
            </div>

            {/* Key Features */}
            <div>
              <h2 className="text-2xl font-semibold text-indigo-900 mb-4">
                Key Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Expense Tracking", color: "text-indigo-600" },
                  { name: "Bill Management", color: "text-emerald-600" },
                  { name: "Warranty Tracking", color: "text-indigo-600" },
                  {
                    name: "Profile Management",
                    color: "text-emerald-600",
                  },
                ].map((feature) => (
                  <div
                    key={feature.name}
                    className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg transition-all hover:bg-slate-100"
                  >
                    <svg
                      className={`w-6 h-6 ${feature.color}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-slate-700 font-medium">
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <h2 className="text-2xl font-semibold text-indigo-900 mb-4">
                Get in Touch
              </h2>
              <p className="text-slate-600 mb-6">
                Have questions or feedback? Reach out to us using the form
                below.
              </p>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                    placeholder="Your message..."
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
