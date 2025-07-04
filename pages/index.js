// pages/index.js
import Head from 'next/head';
import { Box, Container, Heading, VStack, Button, Image, Flex, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';

export default function HomePage() {
  const { openAuthModal } = useAuth();

  return (
    <Layout>
      <Head>
        <title>Bem-vindo ao SERVIAPP</title>
        <meta name="description" content="O seu Guia de Serviços da Comunidade." />
      </Head>
      <Container as="main" maxW="container.md" flex="1" display="flex" alignItems="center" justifyContent="center" textAlign="center" py={10}>
        <VStack spacing={8}>
          <Image src="/logo.png" alt="Logo SERVIAPP" boxSize="325px" objectFit="contain" />
          <Heading as="h2" size="xl">
            O seu Guia de Serviços da Comunidade
          </Heading>
          <Flex direction={{ base: 'column', sm: 'row' }} gap={6} pt={6}>
            <Button onClick={() => openAuthModal('login')} colorScheme="brand" color="gray.900" size="lg" minW="240px">
              LOGIN / CRIAR CONTA
            </Button>
            <Link href="/consulta" passHref>
              <Button as="a" variant="outline" size="lg" minW="240px">
                CONSULTAR SERVIÇOS
              </Button>
            </Link>
          </Flex>
        </VStack>
      </Container>
    </Layout>
  );
}
