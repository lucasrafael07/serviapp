// components/Layout.js
import {
  Box, Container, Flex, Heading, Image, Text, Button,
  Menu, MenuButton, MenuList, MenuItem
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getAuth, signOut } from 'firebase/auth';

const Header = () => {
  const { user, userServiceId, openAuthModal } = useAuth();
  const auth = getAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <Box as="header" bg="gray.900" color="white" py={2} boxShadow="md" w="100%">
      <Container maxW="container.xl">
        <Flex align="center" justify="space-between">
          <Link href="/" passHref>
            <Flex as="a" align="center" _hover={{ cursor: 'pointer' }}>
              <Image src="/logo.png" alt="Logo SERVIAPP" boxSize="60px" objectFit="contain" mr={4} />
              <Heading as="h1" size="lg">SERVIAPP</Heading>
            </Flex>
          </Link>
          <Flex gap={4} align="center">
            {router.pathname !== '/consulta' && (
              <Link href="/consulta" passHref>
                <Button as="a" colorScheme="brand" variant="outline" size="sm">Consultar Serviços</Button>
              </Link>
            )}
            
            {user ? (
              <Menu>
                <MenuButton as={Button} size="sm" colorScheme="brand" color="gray.900">
                  Olá, {user.email?.split('@')[0] || 'Usuário'}
                </MenuButton>
                <MenuList bg="gray.700" borderColor="gray.600">
                  {userServiceId ? (
                    <Link href={`/editar/${userServiceId}`} passHref>
                      <MenuItem as="a" _hover={{ bg: 'gray.600' }} _focus={{ bg: 'gray.600' }}>Editar meu Cadastro</MenuItem>
                    </Link>
                  ) : (
                    <Link href={`/cadastro`} passHref>
                      <MenuItem as="a" _hover={{ bg: 'gray.600' }} _focus={{ bg: 'gray.600' }}>Cadastrar meu Serviço</MenuItem>
                    </Link>
                  )}
                  <MenuItem onClick={handleLogout} _hover={{ bg: 'gray.600' }} _focus={{ bg: 'gray.600' }}>Sair (Logout)</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button onClick={() => openAuthModal('login')} colorScheme="brand" color="gray.900" size="sm">Login / Criar Conta</Button>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

const Footer = () => (
    <Box as="footer" bg="gray.900" color="gray.400" py={6} w="100%">
      <Container maxW="container.xl" textAlign="center">
        <Text fontSize="sm">© {new Date().getFullYear()} SERVIAPP - Guia de Prestadores de Serviço Cristão.</Text>
      </Container>
    </Box>
);

export const Layout = ({ children }) => {
  return (
    <Flex direction="column" minH="100vh" bg="gray.800">
      <Header />
      <Box as="main" flex="1">{children}</Box>
      <Footer />
    </Flex>
  );
};
