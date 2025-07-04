// pages/editar/[id].js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../firebase/config';
import { Layout } from '../../components/Layout';
import CadastroForm from '../../components/CadastroForm';
import { Container, VStack, Box, Text, Spinner } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

export default function EditarPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading, isAdmin, openAuthModal } = useAuth();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      alert("Você precisa estar logado para editar.");
      router.push('/');
      openAuthModal('login');
      return;
    }

    if (id) {
      const fetchServico = async () => {
        try {
          const docRef = doc(db, "servicos", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.userId === user.uid || isAdmin) {
              setInitialData({ id: docSnap.id, ...data });
            } else {
              setError("Você não tem permissão para editar este anúncio.");
            }
          } else {
            setError("Anúncio não encontrado.");
          }
        } catch (err) {
          setError("Erro ao carregar os dados do anúncio.");
        } finally {
          setLoading(false);
        }
      };
      fetchServico();
    }
  }, [id, user, authLoading, router, isAdmin, openAuthModal]);

  if (loading || authLoading) {
    return (
      <Layout>
        <Container centerContent py={40}><Spinner size="xl" /></Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Editar Anúncio - SERVIAPP</title>
      </Head>
      <Container as="main" maxW="container.xl" py={10}>
        <VStack spacing={8}>
          <Box w="100%" maxW="container.md" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="gray.700" borderColor="gray.600">
            {error ? (
              <Text color="red.400" textAlign="center">{error}</Text>
            ) : initialData ? (
              <CadastroForm initialData={initialData} isEditMode={true} />
            ) : (
              <Text textAlign="center">Carregando dados do anúncio...</Text>
            )}
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
}
