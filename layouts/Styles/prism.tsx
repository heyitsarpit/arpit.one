import styled from '@emotion/styled';

const Prism = styled.article`
  code[class*='language-'],
  pre[class*='language-'] {
    color: var(--syntax-pink);

    background: none;
    font-family: 'Fira Code', monospace;
    font-size: 0.85em;

    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;
    tab-size: 4;
    hyphens: none;
  }

  pre[class*='language-']::selection,
  pre[class*='language-'] ::selection,
  code[class*='language-']::selection,
  code[class*='language-'] ::selection {
    color: var(--color-background);
    background: var(--color-text);
  }

  @media print {
    code[class*='language-'],
    pre[class*='language-'] {
      text-shadow: none;
    }
  }
  /* Code blocks */
  pre[class*='language-'] {
    position: relative;

    padding: 1em;
    overflow: auto;
    margin: 1.5em 0;
    border-radius: 6px;

    transition: 500ms;
    transition-property: background, color;

    :hover .code_copy {
      visibility: visible;
      opacity: 0.5;
    }

    .code_copy {
      visibility: hidden;
      position: absolute;
      right: 0.5rem;
      top: 0.5rem;
      background: transparent;
      border: none;
      padding: 10px;

      cursor: pointer;

      opacity: 0;
      transition: opacity 500ms;
      :hover {
        opacity: 1;
      }
      :active {
        opacity: 0;
      }
      svg {
        width: 1.2rem;
        pointer-events: none;
      }
    }

    @media screen and (max-width: 700px) {
      margin: 0.5em 0;
      border-radius: 0;
      position: relative;
      width: 100%; /*Fallback for older browsers*/
      width: 100vw; /*Percentage of full screen viewing width*/
      left: calc(-50vw + 50%); /*Centres div*/
    }
  }

  :not(pre) > code[class*='language-'],
  pre[class*='language-'] {
    background: var(--syntax-background);
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
    white-space: normal;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: var(--syntax-muted);
  }

  .token.punctuation {
    color: var(--syntax-purple);
    font-weight: 500;
  }

  .token.plain-text {
    color: var(--syntax-white);
  }

  .token.selector,
  .token.tag {
    color: var(--syntax-red);
  }

  .token.property {
    color: var(--syntax-cyan);
  }

  .token.number {
    color: var(--syntax-orange);
  }

  .token.boolean {
    color: var(--syntax-yellow);
  }

  .token.constant,
  .token.symbol,
  .token.attr-name,
  .token.deleted {
    color: var(--syntax-orange);
    font-style: italic;
  }

  .token.string,
  .token.char,
  .token.attr-value,
  .token.builtin,
  .token.inserted {
    color: var(--syntax-green);
  }

  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: var(--syntax-cyan);
  }

  .token.operator {
    font-weight: 500;
  }

  .token.atrule,
  .token.keyword {
    color: var(--syntax-purple);
    font-weight: 500;
  }

  .token.function {
    color: var(--syntax-cyan);
    font-weight: bold;
  }

  .token.regex,
  .token.important,
  .token.variable {
    color: var(--syntax-purple);
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.italic {
    font-style: italic;
  }

  .token.entity {
    cursor: help;
  }

  .mdx-marker {
    background: #303240;
    border-left: 3px solid var(--syntax-cyan);
    margin-left: calc(-1em - 0.149%);
    margin-right: calc(-1em - 2%);
  }

  pre.line-numbers {
    position: relative;
    padding-left: 3.8em;
    counter-reset: linenumber;
  }

  pre.line-numbers > code {
    position: relative;
  }

  .line-numbers .line-numbers-rows {
    position: absolute;
    pointer-events: none;
    top: 0;
    font-size: 100%;
    left: -3.8em;
    width: 3em; /* works for line-numbers below 1000 lines */
    letter-spacing: -1px;
    border-right: 0;

    user-select: none;
  }

  .line-numbers-rows > span {
    pointer-events: none;
    display: block;
    counter-increment: linenumber;
  }

  .line-numbers-rows > span:before {
    content: counter(linenumber);
    color: var(--syntax-muted);
    display: block;
    padding-right: 0.8em;
    text-align: right;
  }
`;

export default Prism;
