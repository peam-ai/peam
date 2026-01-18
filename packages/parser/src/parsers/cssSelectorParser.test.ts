import { JSDOM } from 'jsdom';
import { beforeEach, describe, expect, it } from 'vitest';
import { CssSelectorParser } from './cssSelectorParser';

describe('CssSelectorParser', () => {
  let parser: CssSelectorParser;

  beforeEach(() => {
    parser = new CssSelectorParser();
  });

  describe('Basic parsing', () => {
    it('should parse a simple HTML page with all required fields', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html lang="en" dir="ltr">
          <head>
            <title>Test Page Title</title>
            <meta name="description" content="This is a test description">
          </head>
          <body>
            <h1>Main Heading</h1>
            <p>This is the main content of the page.</p>
          </body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.title).toBe('Test Page Title');
      expect(result?.description).toBe('This is a test description');
      expect(result?.textContent).toContain('Main Heading');
      expect(result?.textContent).toContain('This is the main content');
      expect(result?.language).toBe('en');
      expect(result?.direction).toBe('ltr');
    });

    it('should return undefined when title is missing', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="description" content="Description without title">
          </head>
          <body>
            <p>Content here</p>
          </body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined when description is missing', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Title without description</title>
          </head>
          <body>
            <p>Content here</p>
          </body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined when body content is empty', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Empty Page</title>
            <meta name="description" content="Description">
          </head>
          <body></body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('Metadata extraction', () => {
    it('should extract Open Graph metadata', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="Test description">
            <meta property="og:title" content="OG Title">
            <meta property="og:description" content="OG Description">
            <meta property="og:image" content="https://example.com/image.jpg">
            <meta property="og:site_name" content="Test Site">
          </head>
          <body>
            <p>Content here</p>
          </body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.ogTitle).toBe('OG Title');
      expect(result?.ogDescription).toBe('OG Description');
      expect(result?.ogImage).toBe('https://example.com/image.jpg');
      expect(result?.siteName).toBe('Test Site');
    });

    it('should not set ogTitle if it matches the title', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Same Title</title>
            <meta name="description" content="Test description">
            <meta property="og:title" content="Same Title">
          </head>
          <body>
            <p>Content here</p>
          </body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.ogTitle).toBeUndefined();
    });

    it('should extract author and keywords', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="Test description">
            <meta name="author" content="John Doe">
            <meta name="keywords" content="test, vitest, parser, html">
          </head>
          <body>
            <p>Content here</p>
          </body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.author).toBe('John Doe');
      expect(result?.keywords).toEqual(['test', 'vitest', 'parser', 'html']);
    });

    it('should extract published time', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="Test description">
            <meta property="article:published_time" content="2026-01-18T10:00:00Z">
          </head>
          <body>
            <p>Content here</p>
          </body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.publishedTime).toBe('2026-01-18T10:00:00Z');
    });
  });

  describe('Content extraction', () => {
    it('should remove scripts and styles from text content', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="Test description">
            <style>.hidden { display: none; }</style>
          </head>
          <body>
            <h1>Visible Content</h1>
            <script>console.log('This should not appear');</script>
            <p>Paragraph text</p>
            <style>.another { color: red; }</style>
          </body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.textContent).toContain('Visible Content');
      expect(result?.textContent).toContain('Paragraph text');
      expect(result?.textContent).not.toContain('console.log');
      expect(result?.textContent).not.toContain('.hidden');
    });

    it('should extract headings', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="Test description">
          </head>
          <body>
            <h1>Main Heading</h1>
            <h2>Sub Heading 1</h2>
            <h3>Sub Sub Heading</h3>
            <p>Some content</p>
            <h2>Sub Heading 2</h2>
          </body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.headings).toEqual(['Main Heading', 'Sub Heading 1', 'Sub Sub Heading', 'Sub Heading 2']);
    });

    it('should normalize whitespace in text content', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="Test description">
          </head>
          <body>
            <p>Text    with     multiple     spaces</p>
            <p>
              Text
              with
              newlines
            </p>
          </body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.textContent).not.toContain('    ');
      expect(result?.textContent).toContain('Text with multiple spaces');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty title gracefully', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>   </title>
            <meta name="description" content="Test description">
          </head>
          <body>
            <p>Content here</p>
          </body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should handle missing html attributes', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="Test description">
          </head>
          <body>
            <p>Content without lang or dir attributes</p>
          </body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.language).toBeUndefined();
      expect(result?.direction).toBeUndefined();
    });

    it('should filter empty keywords', () => {
      // Arrange
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="Test description">
            <meta name="keywords" content="keyword1,  , keyword2,   ,keyword3">
          </head>
          <body>
            <p>Content here</p>
          </body>
        </html>
      `;
      const dom = new JSDOM(html);

      // Act
      const result = parser.parse(dom.window.document);

      // Assert
      expect(result).toBeDefined();
      expect(result?.keywords).toEqual(['keyword1', 'keyword2', 'keyword3']);
    });
  });
});
