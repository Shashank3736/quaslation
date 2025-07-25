"use client";

import React, { useEffect } from 'react';

interface DisqusProps {
  shortname: string;
  identifier: string;
  title: string;
  url: string;
  theme: string;
}

const DisqusComponent: React.FC<DisqusProps> = ({ shortname, identifier, title, url, theme }) => {
  useEffect(() => {
    const disqus_config = function (this: any) {
      this.page.url = url;
      this.page.identifier = identifier;
      this.page.title = title;
    };

    (window as any).disqus_config = disqus_config;

    if ((window as any).DISQUS) {
      (window as any).DISQUS.reset({
        reload: true,
        config: function (this: any) {
          this.page.url = url;
          this.page.identifier = identifier;
          this.page.title = title;
        }
      });
    } else {
      const d = document, s = d.createElement('script');
      s.src = `https://${shortname}.disqus.com/embed.js`;
      s.setAttribute('data-timestamp', String(+new Date()));
      (d.head || d.body).appendChild(s);
    }

    return () => {
      // Cleanup the script and reset Disqus
      const disqusThread = document.getElementById('disqus_thread');
      if (disqusThread) {
        disqusThread.innerHTML = '';
      }
      const disqusScript = document.querySelector(`script[src="https://${shortname}.disqus.com/embed.js"]`);
      if (disqusScript) {
        disqusScript.remove();
      }
      delete (window as any).DISQUS;
    };
  }, [shortname, identifier, title, url, theme]);

  return <div id="disqus_thread"></div>;
};

export default DisqusComponent;