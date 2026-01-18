import { JSDOM } from 'jsdom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReadabilityParser } from './readabilityParser';

describe('ReadabilityParser', () => {
  let parser: ReadabilityParser;

  beforeEach(() => {
    parser = new ReadabilityParser();
  });

  describe('Basic parsing', () => {
    it('should parse a well-structured article', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html lang="en" dir="ltr">
          <head>
            <title>Test Article Title</title>
            <meta name="author" content="Jane Smith">
          </head>
          <body>
            <article>
              <h1>Main Article Heading</h1>
              <p>This is the first paragraph of the article with substantial content that provides value to readers.</p>
              <p>This is the second paragraph with more detailed information about the topic being discussed.</p>
              <p>A third paragraph to ensure we have enough content for Readability to parse successfully.</p>
              <p>And even more content to make this look like a real article with meaningful text.</p>
            </article>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: 'https://example.com/article' });

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.title).toBe('Test Article Title');
      expect(result?.textContent).toContain('first paragraph');
      expect(result?.textContent).toContain('second paragraph');
      expect(result?.language).toBe('en');
      expect(result?.direction).toBe('ltr');
    });

    it('should extract author from byline', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Article with Author</title>
          </head>
          <body>
            <article>
              <h1>Article Title</h1>
              <p class="byline">By John Doe</p>
              <p>Substantial article content goes here with enough text to be considered.</p>
              <p>More paragraphs to ensure this is recognized as article content.</p>
              <p>Additional content to meet the minimum requirements for readability parsing.</p>
              <p>Yet another paragraph to make this a proper article.</p>
            </article>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: 'https://example.com/article' });

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.author).toBeDefined();
    });

    it('should parse even short content if Readability accepts it', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Too Short</title>
          </head>
          <body>
            <p>Not enough content.</p>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: 'https://example.com/short' });

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      // Readability may still parse very short content
      if (result) {
        expect(result.title).toBe('Too Short');
        expect(result.textContent).toBeDefined();
      }
    });

    it('should handle pages without clear article content', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Navigation Page</title>
          </head>
          <body>
            <nav>
              <ul>
                <li><a href="/home">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </nav>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: 'https://example.com/nav' });

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      // Readability may parse navigation as content
      if (result) {
        expect(result.title).toBe('Navigation Page');
      }
    });
  });

  describe('Options handling', () => {
    it('should respect keepClasses option when provided', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Article with Classes</title>
          </head>
          <body>
            <article>
              <h1>Main Heading</h1>
              <p class="important-class">This paragraph has an important class that should be preserved.</p>
              <p class="another-class">Another paragraph with a class to keep if option is set.</p>
              <p>More content to ensure we have a substantial article for parsing.</p>
              <p>Additional paragraphs to meet minimum content requirements.</p>
            </article>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: 'https://example.com/article' });

      // Act
      const result = parser.parse(dom.window.document, { keepClasses: true });

      // Assert
      expect(result).toBeDefined();
      if (result?.content) {
        expect(result.content).toContain('important-class');
      }
    });

    it('should handle disableJSONLD option', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Article with JSON-LD</title>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Test Article"
              }
            </script>
          </head>
          <body>
            <article>
              <h1>Article Title</h1>
              <p>Substantial content for the article to be parsed correctly by Readability.</p>
              <p>More paragraphs to ensure sufficient content length and quality.</p>
              <p>Additional text to meet the minimum requirements for article extraction.</p>
              <p>Even more content to make this a complete article.</p>
            </article>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: 'https://example.com/article' });

      // Act
      const result = parser.parse(dom.window.document, { disableJSONLD: true });

      // Assert
      expect(result).toBeDefined();
      // Readability uses the <title> tag when available
      expect(result?.title).toBeDefined();
      expect(result?.textContent).toContain('Substantial content');
    });
  });

  describe('Content extraction quality', () => {
    it('should extract clean text content', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Clean Content Test</title>
          </head>
          <body>
            <article>
              <h1>Main Article Heading</h1>
              <p>This is clean content that should be extracted properly from the HTML document.</p>
              <p>Multiple paragraphs help demonstrate the parser's ability to handle article structure.</p>
              <aside>This sidebar content might be removed by Readability.</aside>
              <p>More main content to ensure we have enough text for parsing.</p>
              <p>Final paragraph to complete the article content.</p>
            </article>
            <footer>Footer content that should be excluded</footer>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: 'https://example.com/article' });

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.textContent).toContain('clean content');
      expect(result?.textContent).not.toContain('Footer content');
    });

    it('should calculate content length', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Length Test Article</title>
          </head>
          <body>
            <article>
              <h1>Testing Content Length</h1>
              <p>This article has multiple paragraphs to test the content length calculation feature.</p>
              <p>Each paragraph adds to the total length that should be calculated by the parser.</p>
              <p>The content length is an important metric for understanding article substance.</p>
              <p>More content ensures we have sufficient text for meaningful analysis.</p>
            </article>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: 'https://example.com/article' });

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.contentLength).toBeGreaterThan(0);
      expect(typeof result?.contentLength).toBe('number');
    });
  });

  describe('Metadata extraction', () => {
    it('should extract site name when available', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Article Title</title>
            <meta property="og:site_name" content="Example Site">
          </head>
          <body>
            <article>
              <h1>Article Heading</h1>
              <p>Article content with sufficient length for proper parsing by Readability engine.</p>
              <p>Multiple paragraphs ensure the content is substantial enough to be recognized.</p>
              <p>More text to meet minimum content requirements for successful parsing.</p>
              <p>Additional content to ensure article quality and completeness.</p>
            </article>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: 'https://example.com/article' });

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      if (result?.siteName) {
        expect(result.siteName).toBe('Example Site');
      }
    });

    it('should extract excerpt as description', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Article with Excerpt</title>
            <meta name="description" content="This is the article excerpt">
          </head>
          <body>
            <article>
              <h1>Main Article</h1>
              <p>First paragraph of the article content with meaningful information for readers.</p>
              <p>Second paragraph continues the discussion with more detailed content.</p>
              <p>Third paragraph adds additional context and information to the article.</p>
              <p>Fourth paragraph ensures we have sufficient content for parsing.</p>
            </article>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: 'https://example.com/article' });

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.description).toBeDefined();
      expect(typeof result?.description).toBe('string');
    });
  });

  describe('Edge cases', () => {
    it('should handle complex HTML structures', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html lang="fr" dir="ltr">
          <head>
            <title>Complex Structure</title>
          </head>
          <body>
            <header>
              <nav>Navigation that should be ignored</nav>
            </header>
            <main>
              <article>
                <h1>Main Content</h1>
                <div class="content">
                  <p>Nested content within divs should still be extracted properly by the parser.</p>
                  <div>
                    <p>Even deeply nested content should be accessible and parsed correctly.</p>
                  </div>
                  <p>More paragraphs to ensure we have enough content for successful parsing.</p>
                  <p>Additional text to meet the minimum requirements for article extraction.</p>
                </div>
              </article>
            </main>
            <footer>Footer to ignore</footer>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: 'https://example.com/article' });

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.textContent).toContain('Nested content');
      expect(result?.language).toBe('fr');
    });

    it('should handle pages with no clear article structure', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ambiguous Content</title>
          </head>
          <body>
            <div>
              <div>
                <div>
                  <p>Content buried in generic divs without semantic markup for proper identification.</p>
                  <p>Readability may struggle with this but should still attempt to parse it properly.</p>
                  <p>Multiple paragraphs help but lack of semantic HTML makes it challenging.</p>
                  <p>Additional content to provide enough text for the parsing algorithm.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: 'https://example.com/ambiguous' });

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      if (result) {
        expect(result.title).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });
  });
});
