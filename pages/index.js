// pages/index.js

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, auth } from '../firebase/config'; // <-- IMPORTE 'auth'
import { onAuthStateChanged, signOut } from "firebase/auth"; // <-- IMPORTE FUNÇÕES DE AUTH
import { useRouter } from 'next/router'; // <-- IMPORTE 'useRouter'
import { CATEGORIAS_PRINCIPAIS } from '../config/appConfig';
import CadastroForm from '../components/CadastroForm';
import ServicoCard from '../components/ServicoCard';
import { Container, Heading, VStack, Box, Text, Flex, Input, Select, SimpleGrid, Divider, Image, Button, Checkbox, Spacer, useToast } from '@chakra-ui/react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// MODIFIQUE O HEADER PARA INCLUIR O BOTÃO DE SAIR
const Header = ({ onLogout }) => (
    <Box as="header" bg="gray.900" color="white" py={2} boxShadow="md">
      <Container maxW="container.xl">
        <Flex align="center" justify="space-between"> {/* Mudado para space-between */}
          <Flex align="center">
            <Image src="/logo.png" alt="Logo SERVIAPP" boxSize="60px" objectFit="contain" mr={4} />
            <Heading as="h1" size="lg">SERVIAPP</Heading>
          </Flex>
          <Button colorScheme="brand" variant="outline" onClick={onLogout}>
            Sair
          </Button>
        </Flex>
      </Container>
    </Box>
);

const Footer = () => (
    <Box as="footer" bg="gray.900" color="gray.400" py={6} mt={20}>
      <Container maxW="container.xl" textAlign="center">
        <Text fontSize="sm">© {new Date().getFullYear()} SERVIAPP - Guia de Prestadores de Serviço Cristão.</Text>
        <Text fontSize="xs" mt={2}>Um projeto para fortalecer a comunidade.</Text>
      </Container>
    </Box>
);

export default function HomePage() {
  const [user, setUser] = useState(null); // <-- ESTADO PARA O USUÁRIO
  const [loading, setLoading] = useState(true); // <-- ESTADO DE CARREGAMENTO
  const router = useRouter(); // <-- HOOK DE ROTEAMENTO
  const toast = useToast(); // <-- HOOK PARA NOTIFICAÇÕES

  const [listaDeServicos, setListaDeServicos] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  // EFEITO PARA VERIFICAR O ESTADO DE AUTENTICAÇÃO
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login'); // Redireciona se não estiver logado
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);


  useEffect(() => {
    if(user) { // Só busca os serviços se o usuário estiver logado
        const fetchServicos = async () => {
          const servicosCollection = collection(db, "servicos");
          const q = query(servicosCollection, orderBy("dataCadastro", "desc"));
          const querySnapshot = await getDocs(q);
          const servicos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setListaDeServicos(servicos);
        };
        fetchServicos();
    }
  }, [user]); // Adicionado 'user' como dependência

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Você saiu.", status: "info", duration: 3000, isClosable: true });
      router.push('/login');
    } catch (error) {
      toast({ title: "Erro ao sair.", description: error.message, status: "error", duration: 5000, isClosable: true });
    }
  };

  const servicosFiltrados = listaDeServicos.filter(prestador => {
    const busca = termoBusca.toLowerCase().trim();
    if (!busca && !filtroCategoria) return true;
    const atendeBusca = !busca || prestador.nome.toLowerCase().includes(busca) || prestador.servico.toLowerCase().includes(busca);
    const atendeCategoria = !filtroCategoria || prestador.categoria === filtroCategoria;
    return atendeBusca && atendeCategoria;
  });

  const handleSelectCard = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allVisibleIds = servicosFiltrados.map(s => s.id);
      setSelectedIds(allVisibleIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleExportToExcel = () => {
    const dataToExport = listaDeServicos
      .filter(servico => selectedIds.includes(servico.id))
      .map(({ nome, servico, categoria, cidade, estado, telefone, email }) => ({
        'Nome ou Razão Social': nome, 'Serviço Específico': servico, 'Categoria': categoria,
        'Cidade': cidade, 'Estado': estado, 'Telefone': telefone, 'Email': email || ''
      }));

    if (dataToExport.length === 0) {
      alert("Por favor, selecione pelo menos um serviço para exportar.");
      return;
    }
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Prestadores");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    saveAs(data, "ServiApp_Contatos.xlsx");
  };
  
  const areAllSelected = servicosFiltrados.length > 0 && selectedIds.length === servicosFiltrados.length;

  // EXIBE UMA MENSAGEM DE CARREGAMENTO OU NADA ENQUANTO VERIFICA O LOGIN
  if (loading || !user) {
    return (
        <Flex minH="100vh" align="center" justify="center" bg="gray.900">
            <Text color="white">Carregando...</Text>
        </Flex>
    );
  }

  return (
    <Box bg="gray.900" color="whiteAlpha.900">
      <Head>
        <title>SERVIAPP - Guia de Prestadores de Serviço Cristão</title>
      </Head>
      <Header onLogout={handleLogout} /> {/* Passa a função de logout para o Header */}
      <Container as="main" maxW="container.xl" py={10}>
        <VStack spacing={12}>
          <Box w="100%" maxW="container.md" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="gray.800" borderColor="gray.700" id="cadastro">
            <CadastroForm />
          </Box>
          <Divider borderColor="gray.700" />
          <VStack w="100%" spacing={8} id="lista-servicos" align="stretch">
            <Heading as="h2" size="xl" textAlign="center">Encontre um Profissional na Comunidade</Heading>
            <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
              <Input placeholder="Buscar por nome ou serviço..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} focusBorderColor="brand.500" bg="white" color="gray.800" />
              <Select placeholder="Clique para escolher a categoria" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} focusBorderColor="brand.500" bg="white" color="gray.800">
                <option value="" style={{ color: "black" }}>Todas as Categorias</option>
                {CATEGORIAS_PRINCIPAIS.map(cat => <option key={cat} value={cat} style={{ color: "black" }}>{cat}</option>)}
              </Select>
            </Flex>
            <Flex align="center" gap={4}>
              <Checkbox isChecked={areAllSelected} onChange={handleSelectAll} colorScheme="brand">Selecionar Todos Visíveis</Checkbox>
              <Spacer />
              <Button colorScheme="brand" color="gray.900" onClick={handleExportToExcel} isDisabled={selectedIds.length === 0}>Exportar ({selectedIds.length}) para Excel</Button>
            </Flex>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
              {servicosFiltrados.map(prestador => (
                <ServicoCard
                  key={prestador.id}
                  id={prestador.id}
                  isSelected={selectedIds.includes(prestador.id)}
                  onSelect={handleSelectCard}
                  nome={prestador.nome}
                  servico={prestador.servico}
                  cidade={prestador.cidade}
                  estado={prestador.estado}
                  logoUrl={prestador.logoUrl}
                  telefone={prestador.telefone}
                  email={prestador.email}
                  categoria={prestador.categoria}
                />
              ))}
            </SimpleGrid>
            {servicosFiltrados.length === 0 && (<Box textAlign="center" py={10}><Text color="gray.400">Nenhum serviço encontrado com estes critérios.</Text></Box>)}
          </VStack>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
}