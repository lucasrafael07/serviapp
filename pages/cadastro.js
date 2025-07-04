// pages/cadastro.js
import Head from 'next/head';
import { Container, Heading, VStack, Box, Text, Spinner } from '@chakra-ui/react';
import CadastroForm from '../components/CadastroForm';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function CadastroPage() {
  const { user, loading, userServiceId, openAuthModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        alert("Você precisa estar logado para acessar esta página.");
        router.push('/');
        openAuthModal('login');
      } else if (userServiceId) {
        alert("Você já possui um serviço cadastrado. Estamos te redirecionando para a página de edição.");
        router.push(`/editar/${userServiceId}`);
      }
    }
  }, [user, loading, userServiceId, router, openAuthModal]);

  if (loading || !user || userServiceId) {
    return (
      <Layout>
        <Container centerContent py={40}>
          <Spinner size="xl" />
          <Text mt={4}>Carregando...</Text>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Cadastro de Serviço - SERVIAPP</title>
      </Head>
      <Container as="main" maxW="container.xl" py={10}>
        <VStack spacing={8}>
          <Box w="100%" maxW="container.md" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="gray.700" borderColor="gray.600" id="cadastro">
            <CadastroForm />
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
}
