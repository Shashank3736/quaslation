# Disqus Integration Migration

This document outlines the migration from the default Disqus component to a custom implementation.

## 1. Reason for Migration

The primary reason for migrating to a custom Disqus component was a dependency conflict with **React 19**. The existing third-party Disqus library was not compatible with the latest version of React, causing build failures and runtime errors. To resolve this, we developed a custom component that manually handles the Disqus script injection and lifecycle.

## 2. Custom Solution Implementation

A custom solution was implemented through the `DisqusComponent.tsx` and `comments.tsx` components.

### `comments.tsx`

This component is the entry point for rendering the comments section. It is responsible for:
- Retrieving the current theme (`dark` or `light`) using the `useTheme` hook from `next-themes`.
- Ensuring the component is only rendered on the client-side using a `mounted` state.
- Passing the necessary properties (`id`, `title`, `theme`) to the `DisqusComponent`.

```tsx
// src/components/shared/comments.tsx
"use client"

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes';
import DisqusComponent from './DisqusComponent';

const Comments = ({ id, title }:{ id: string, title: string }) => {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true)
  }, [])

  if(!mounted || !theme) return null;
  return (
    <div>
      <DisqusComponent
        shortname='quaslation'
        identifier={id}
        title={title}
        url={window.location.href}
        theme={theme}
      />
    </div>
  )
}

export default Comments
```

### `DisqusComponent.tsx`

This component handles the core logic of loading and managing the Disqus script.

- **Dynamic Script Loading:** It dynamically creates a `<script>` tag for the Disqus `embed.js` and appends it to the document head.
- **Configuration:** It sets the global `disqus_config` object with the page's `url`, `identifier`, and `title`.
- **Lifecycle Management:** It uses `useEffect` to load the script when the component mounts and to clean up by removing the script and resetting the Disqus thread when the component unmounts.

```tsx
// src/components/shared/DisqusComponent.tsx
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
```

## 3. Theme Synchronization

Theme synchronization is handled by passing the `theme` prop from the `Comments` component to the `DisqusComponent`. While the current implementation of `DisqusComponent` receives the `theme` prop, it does not yet use it to dynamically switch the Disqus theme. Disqus themes are managed in the Disqus admin panel, but this prop is available for future enhancements.

## 4. Error Handling

The component includes error handling for scenarios where the Disqus script fails to load, which is common with ad blockers.

- A `loadingStatus` state (`'idle'`, `'loading'`, `'success'`, `'error'`) tracks the script's status.
- If the script's `onerror` event is triggered, the status is set to `'error'`.
- When an error occurs, a message is displayed to the user, along with a "Retry" button that allows them to attempt to load the comments again.

```tsx
// src/components/shared/DisqusComponent.tsx
{loadingStatus === 'error' && (
  <div className="text-center">
    <Muted>Failed to load comments. This might be due to an ad blocker.</Muted>
    <Button onClick={loadDisqus} className="mt-2">
      Retry
    </Button>
  </div>
)}
```

## 5. Configuration Changes

The configuration is now managed through props passed to the `DisqusComponent`.

- `shortname`: Your Disqus forum shortname.
- `identifier`: A unique identifier for the page.
- `title`: The title of the page.
- `url`: The absolute URL of the page.
- `theme`: The current theme (`'dark'` or `'light'`).

These are set within the `Comments` component, which is then used across the application.

## 6. Troubleshooting

### Comments Not Loading
- **Cause:** This is often caused by an ad blocker or a network issue.
- **Solution:** The component displays a "Retry" button. Clicking it will re-attempt to load the Disqus script. If the issue persists, disabling the ad blocker for the site may be necessary.

### Theme Not Matching
- **Cause:** The Disqus theme is configured in the Disqus admin panel and is not dynamically changed by the component at this time.
- **Solution:** Ensure the theme settings in your Disqus admin panel match your site's design. The `theme` prop is available for future implementation of a dynamic theme switcher.