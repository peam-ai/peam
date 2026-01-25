export { Page };

function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About Us
          </h1>
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We're dedicated to creating simple, efficient, and powerful examples
              that help developers understand how to integrate Peam with their
              React applications.
            </p>
            <p className="text-gray-600 leading-relaxed">
              This example showcases the latest features of Vite, combined
              with the beautiful styling capabilities of Tailwind CSS, all integrated
              with Peam's powerful functionality and Vike's SSR capabilities.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              What We Offer
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600">Clean and maintainable code examples</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600">Modern development practices</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600">Easy-to-understand implementations</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600">Full TypeScript support</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600">Fast development with Vite</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-600">Server-side rendering with Vike</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
