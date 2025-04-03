import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import '@/styles/globals.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    // Log session changes for debugging
    console.log('App session:', session);
  }, [session]);

  return (
    <SessionProvider session={session} refetchInterval={0}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
} 