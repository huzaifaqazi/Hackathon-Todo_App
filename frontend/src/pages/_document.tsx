import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <meta name="theme-color" content="#2563EB" />
          <meta
            name="description"
            content="TodoApp — capture tasks, set priorities and deadlines, and let your AI assistant handle the planning."
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;