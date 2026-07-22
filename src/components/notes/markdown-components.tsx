import type { Components } from 'react-markdown';

// Shifts every markdown heading one HTML level down (source h1 -> <h2>) so the
// rendered note never introduces a second <h1> into the page.
export const markdownComponents: Components = {
  h1: (props) => <h2 {...props} />,
  h2: (props) => <h3 {...props} />,
  h3: (props) => <h4 {...props} />,
  h4: (props) => <h5 {...props} />,
  h5: (props) => <h6 {...props} />,
  h6: (props) => <h6 {...props} />,
  a: ({ href, ...props }) => (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
  ),
  table: (props) => (
    <div className="table-scroll">
      <table {...props} />
    </div>
  ),
};
