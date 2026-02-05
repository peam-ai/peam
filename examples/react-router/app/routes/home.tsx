import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "React Router Example - Peam" },
    {
      name: "description",
      content: "A React Router example application demonstrating Peam integration.",
    },
  ];
}

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to Peam</h1>
          <p className="text-xl text-gray-600 mb-8">
            This is a React Router example application demonstrating Peam integration.
          </p>
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h2>
            <p className="text-gray-600 leading-relaxed">
              Explore this simple example to see how Peam works with React Router.
              Navigate through the pages using the menu above to learn more about our
              features and get in touch.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-blue-600 text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Fast</h3>
              <p className="text-gray-600 text-sm">Built with React Router</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-green-600 text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold mb-2">Simple</h3>
              <p className="text-gray-600 text-sm">Clean design with Tailwind CSS</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-purple-600 text-3xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold mb-2">Powerful</h3>
              <p className="text-gray-600 text-sm">Enhanced with Peam features</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
