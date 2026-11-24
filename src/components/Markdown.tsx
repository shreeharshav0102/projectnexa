import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { copyText } from '../lib/utils';

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    await copyText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="code-shell">
      <div className="code-head">
        <span className="code-lang">{language}</span>
        <button onClick={onCopy} className="code-copy" type="button">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language === 'jsx' ? 'jsx' : language}
        style={oneDark}
        customStyle={{
          margin: 0,
          background: '#080a14',
          fontSize: '12.5px',
          padding: '14px 16px',
          lineHeight: 1.65,
        }}
        PreTag="div"
        showLineNumbers={code.split('\n').length > 12}
        lineNumberStyle={{
          color: 'rgba(255,255,255,0.22)',
          background: 'transparent',
          fontSize: '10px',
          minWidth: '2.2em',
          paddingRight: '1em',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const components: Record<string, (props: any) => any> = {
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const text = String(children ?? '').replace(/\n$/, '');
    const lang = /language-(\w+)/.exec(className || '')?.[1];
    if (lang || text.includes('\n')) return <CodeBlock language={lang || 'text'} code={text} />;
    return <code className="inline-code">{text}</code>;
  },
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="md-link">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="md-table-wrap">
      <table>{children}</table>
    </div>
  ),
  th: ({ children }) => <th>{children}</th>,
  td: ({ children }) => <td>{children}</td>,
  blockquote: ({ children }) => <blockquote className="md-quote">{children}</blockquote>,
  ul: ({ children }) => <ul className="md-list">{children}</ul>,
  ol: ({ children }) => <ol className="md-list md-list-ol">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  p: ({ children }) => <p className="md-p">{children}</p>,
  strong: ({ children }) => <strong className="md-strong">{children}</strong>,
  h1: ({ children }) => <h3 className="md-h">{children}</h3>,
  h2: ({ children }) => <h3 className="md-h">{children}</h3>,
  h3: ({ children }) => <h4 className="md-h">{children}</h4>,
  hr: () => <hr className="md-hr" />,
};

export const Markdown = memo(function Markdown({ text }: { text: string }) {
  return (
    <div className="md-root">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components as never}>
        {text}
      </ReactMarkdown>
    </div>
  );
});
