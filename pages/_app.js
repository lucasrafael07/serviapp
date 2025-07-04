// pages/_app.js

import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../theme'; // <-- 1. IMPORTA nosso tema personalizado

function MyApp({ Component, pageProps }) {
  return (
    // 2. APLICA o tema ao aplicativo inteiro
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;