"use client";

import Script from "next/script";

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

export function OneSignalProvider() {
  if (!APP_ID) return null;
  return (
    <>
      <Script
        id="onesignal-sdk"
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="afterInteractive"
        defer
      />
      <Script
        id="onesignal-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "${APP_ID}",
                allowLocalhostAsSecureOrigin: true,
                serviceWorkerPath: "/OneSignalSDKWorker.js",
                notifyButton: { enable: false },
              });
            });
          `,
        }}
      />
    </>
  );
}
