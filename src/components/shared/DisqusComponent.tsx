"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import Muted from '../typography/muted';

interface DisqusProps {
  shortname: string;
  identifier: string;
  title: string;
  url: string;
  theme: string;
}

type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

const DisqusComponent: React.FC<DisqusProps> = ({ shortname, identifier, title, url, theme }) => {
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('idle');

  const loadDisqus = useCallback(() => {
    setLoadingStatus('loading');

    const disqus_config = function (this: any) {
      this.page.url = url;
      this.page.identifier = identifier;
      this.page.title = title;
    };

    (window as any).disqus_config = disqus_config;

    if ((window as any).DISQUS) {
      (window as any).DISQUS.reset({
        reload: true,
        config: disqus_config
      });
      setLoadingStatus('success');
    } else {
      const script = document.createElement('script');
      script.src = `https://${shortname}.disqus.com/embed.js`;
      script.setAttribute('data-timestamp', String(+new Date()));
      script.async = true;
      script.onload = () => setLoadingStatus('success');
      script.onerror = () => setLoadingStatus('error');
      (document.head || document.body).appendChild(script);
    }
  }, [shortname, identifier, title, url]);

  useEffect(() => {
    loadDisqus();

    return () => {
      const disqusThread = document.getElementById('disqus_thread');
      if (disqusThread) {
        disqusThread.innerHTML = '';
      }
      const disqusScript = document.querySelector(`script[src="https://${shortname}.disqus.com/embed.js"]`);
      if (disqusScript) {
        disqusScript.remove();
      }
      if ((window as any).DISQUS) {
        delete (window as any).DISQUS;
      }
    };
  }, [loadDisqus, shortname]);

  return (
    <div>
      {loadingStatus === 'loading' && <Muted>Loading comments...</Muted>}
      {loadingStatus === 'error' && (
        <div className="text-center">
          <Muted>Failed to load comments. This might be due to an ad blocker.</Muted>
          <Button onClick={loadDisqus} className="mt-2">
            Retry
          </Button>
        </div>
      )}
      <div id="disqus_thread" style={{ display: loadingStatus === 'success' ? 'block' : 'none' }}></div>
    </div>
  );
};

export default DisqusComponent;