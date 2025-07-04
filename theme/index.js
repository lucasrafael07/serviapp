import { extendTheme } from '@chakra-ui/react';

// 1. Configuração para o modo dark ser o padrão
const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

// 2. Paleta de cores com amarelo como "brand" (marca)
const colors = {
  brand: {
    50: '#fffde7',
    100: '#fff9c4',
    200: '#fff59d',
    300: '#fff176',
    400: '#ffee58',
    500: '#ffeb3b',
    600: '#fdd835',
    700: '#fbc02d',
    800: '#f9a825',
    900: '#f57f17',
  },
};

// 3. Criando e exportando o tema completo
export const theme = extendTheme({ config, colors });