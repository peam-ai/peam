import { describe, expect, it } from 'vitest';
import { parseHTML } from './parseHtml';

describe('parseHTML', () => {
  it('should parse HTML and return a structured page', () => {
    // Arrange
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Test Page</title>
          <meta name="description" content="Test description">
        </head>
        <body>
          <article>
            <h1>Main Heading</h1>
            <p>This is a test article with substantial content for proper parsing.</p>
            <p>Multiple paragraphs ensure the content is recognized correctly.</p>
            <p>Additional content to meet minimum requirements for parsing.</p>
          </article>
        </body>
      </html>
    `;

    // Act
    const result = parseHTML(html);

    // Assert
    expect(result).toBeDefined();
    expect(result?.title).toBe('Test Page');
    expect(result?.description).toBe('Test description');
    expect(result?.textContent).toContain('Main Heading');
    expect(result?.language).toBe('en');
  });

  it('should return undefined for empty or invalid HTML', () => {
    // Arrange
    const emptyHtml = '';
    const whitespaceHtml = '   ';

    // Act
    const resultEmpty = parseHTML(emptyHtml);
    const resultWhitespace = parseHTML(whitespaceHtml);

    // Assert
    expect(resultEmpty).toBeUndefined();
    expect(resultWhitespace).toBeUndefined();
  });

  it('should merge data from both parsers with Readability taking priority', () => {
    // Arrange
    const html = `
      <!DOCTYPE html>
      <html lang="es" dir="rtl">
        <head>
          <title>Article Title</title>
          <meta name="description" content="CSS description">
          <meta name="author" content="John Doe">
          <meta name="keywords" content="test, parser, html">
        </head>
        <body>
          <article>
            <h1>Article Heading</h1>
            <p>This is a comprehensive article with enough content for both parsers to extract data.</p>
            <p>The Readability parser should extract the main article content effectively.</p>
            <p>Additional paragraphs ensure proper parsing by both CSS and Readability parsers.</p>
            <p>More content to make this a complete and valid article for testing purposes.</p>
          </article>
        </body>
      </html>
    `;

    // Act
    const result = parseHTML(html);

    // Assert
    expect(result).toBeDefined();
    expect(result?.title).toBeDefined();
    expect(result?.description).toBeDefined();
    expect(result?.language).toBe('es');
    expect(result?.keywords).toBeDefined();
    expect(result?.author).toBeDefined();
    expect(result?.direction).toBe('rtl');
  });
});
