export const SemanticSearch = () => (
  <section className="px-8 sm:px-4 py-12 sm:py-16">
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <h2 className="font-semibold text-2xl sm:text-3xl lg:text-4xl tracking-tight">
          Semantic Search
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Find answers based on meaning, not just keywords.
        </p>
      </div>
      <div className="space-y-4">
        <div className="p-4 rounded-lg border bg-accent/50">
          <div className="flex items-start gap-3">
            <svg
              className="size-6 text-muted-foreground flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <div>
              <h3 className="font-medium mb-1">Understanding Context</h3>
              <p className="text-sm text-muted-foreground">
                Goes beyond exact matches to understand the intent behind queries
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-accent/50">
          <div className="flex items-start gap-3">
            <svg
              className="size-6 text-muted-foreground flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <div>
              <h3 className="font-medium mb-1">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Optimized vector search delivers results in milliseconds
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-accent/50">
          <div className="flex items-start gap-3">
            <svg
              className="size-6 text-muted-foreground flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-medium mb-1">Relevant Results</h3>
              <p className="text-sm text-muted-foreground">
                Ranks content by semantic similarity for accurate answers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
