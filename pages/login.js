// pages/login.js

import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase/config';
import {
  Box, Button, Container, FormControl, FormLabel, Input, VStack, Heading,
  useToast, Flex, Tab, TabList, TabPanel, TabPanels, Tabs
} from '@chakra-ui/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleAuth = async (isLogin = true) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Login bem-sucedido!", status: "success", duration: 3000, isClosable: true });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Cadastro realizado com sucesso!", status: "success", duration: 3000, isClosable: true });
      }
      router.push('/'); // Redireciona para a página inicial após o sucesso
    } catch (error) {
      toast({
        title: "Erro na autenticação.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.900">
      <Container maxW="md">
        <Box p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="gray.800" borderColor="gray.700">
          <VStack spacing={4}>
            <Heading color="whiteAlpha.900">SERVIAPP</Heading>
            <Tabs isFitted variant="enclosed" w="100%">
              <TabList mb="1em">
                <Tab _selected={{ color: 'white', bg: 'brand.500' }}>Login</Tab>
                <Tab _selected={{ color: 'white', bg: 'brand.500' }}>Registrar</Tab>
              </TabList>
              <TabPanels>
                {/* Painel de Login */}
                <TabPanel>
                  <VStack as="form" spacing={4} onSubmit={(e) => { e.preventDefault(); handleAuth(true); }}>
                    <FormControl isRequired>
                      <FormLabel color="whiteAlpha.900">E-mail</FormLabel>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} bg="white" color="gray.800" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel color="whiteAlpha.900">Senha</FormLabel>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} bg="white" color="gray.800" />
                    </FormControl>
                    <Button type="submit" colorScheme="brand" size="lg" width="full" isLoading={isLoading} color="gray.900">
                      Entrar
                    </Button>
                  </VStack>
                </TabPanel>
                {/* Painel de Registro */}
                <TabPanel>
                  <VStack as="form" spacing={4} onSubmit={(e) => { e.preventDefault(); handleAuth(false); }}>
                    <FormControl isRequired>
                      <FormLabel color="whiteAlpha.900">E-mail</FormLabel>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} bg="white" color="gray.800" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel color="whiteAlpha.900">Senha</FormLabel>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} bg="white" color="gray.800" />
                    </FormControl>
                    <Button type="submit" colorScheme="brand" size="lg" width="full" isLoading={isLoading} color="gray.900">
                      Criar Conta
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Box>
      </Container>
    </Flex>
  );
}