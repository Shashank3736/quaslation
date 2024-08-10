import React from 'react';
import parse from 'html-react-parser';

const LimitedContent = ({ htmlContent }: { htmlContent: string }) => {
  const limitToThreeElements = (html: string) => {
    const parsedContent = parse(html);
    
    if (Array.isArray(parsedContent)) {
      // If parsedContent is an array, slice it
      const limitedElements = parsedContent.slice(0, Math.ceil(parsedContent.length / 4));
      return limitedElements.map((element, index) => 
        React.createElement(
          element.type,
          { key: index, ...element.props },
          element.props.children
        )
      );
    } else {
      // If it's a single element, just return it as an array with one element
      return [parsedContent];
    }
  };

  return (
    <div className='space-y-2 prose lg:prose-xl dark:prose-invert'>
      {limitToThreeElements(htmlContent)}
    </div>
  );
};

export default LimitedContent