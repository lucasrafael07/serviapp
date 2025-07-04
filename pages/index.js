// pages/index.js

import React, { useState, useEffect } from 'react'; // <-- CORRIGIDO AQUI
import Head from 'next/head';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from 'next/router';
import { CATEGORIAS_PRINCIPAIS } from '../config/appConfig';
import { ADMIN_EMAILS } from '../config/adminConfig';
import CadastroForm from '../components/CadastroForm';
import ServicoCard from '../components/ServicoCard';
import EditModal from '../components/EditModal';
import {
  Container, Heading, VStack, Box, Text, Flex, Input, Select, SimpleGrid,
  Divider, Image, Button, Checkbox, Spacer, useToast, Spinner
} from '@chakra-ui/react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Header = ({ onLogout }) => (
    <Box as="header" bg="gray.900" color="white" py={2} boxShadow="md" position="sticky" top="0" zIndex="1000">
      <Container maxW="container.xl">
        <Flex align="center" justify="space-between">
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
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  const [listaDeServicos, setListaDeServicos] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [servicoParaEditar, setServicoParaEditar] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAdmin(ADMIN_EMAILS.includes(currentUser.email));
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      const fetchServicos = async () => {
        const servicosCollection = collection(db, "servicos");
        const q = query(servicosCollection, orderBy("dataCadastro", "desc"));
        const querySnapshot = await getDocs(q);
        const servicos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setListaDeServicos(servicos);
      };
      fetchServicos();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Você saiu.", status: "info", duration: 3000, isClosable: true });
      router.push('/login');
    } catch (error) {
      toast({ title: "Erro ao sair.", description: error.message, status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleEditClick = (servico) => {
    setServicoParaEditar(servico);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (servicoId) => {
    if (window.confirm("Tem certeza que deseja deletar este serviço? Esta ação não pode ser desfeita.")) {
      try {
        await deleteDoc(doc(db, "servicos", servicoId));
        setListaDeServicos(prev => prev.filter(s => s.id !== servicoId));
        toast({ title: "Serviço deletado com sucesso!", status: "success", duration: 3000 });
      } catch (error) {
        toast({ title: "Erro ao deletar o serviço.", description: error.message, status: "error" });
      }
    }
  };
  
  const handleUpdateServico = (servicoAtualizado) => {
    setListaDeServicos(prev =>
      prev.map(s => (s.id === servicoAtualizado.id ? servicoAtualizado : s))
    );
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

  if (loading || !user) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.900">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <>
      <Box bg="gray.800" color="whiteAlpha.900">
        <Head>
          <title>SERVIAPP - Guia de Prestadores de Serviço Cristão</title>
        </Head>
        <Header onLogout={handleLogout} />
        <Container as="main" maxW="container.xl" py={10}>
          <VStack spacing={12}>
            <Box w="100%" maxW="container.md" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="gray.700" borderColor="gray.600" id="cadastro">
              <CadastroForm />
            </Box>
            <Divider borderColor="gray.600" />
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
                {servicosFiltrados.map(prestador => {
                  const canEdit = isAdmin || (user && user.uid === prestador.userId);
                  return (
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
                      canEdit={canEdit}
                      onEditClick={() => handleEditClick(prestador)}
                      onDeleteClick={() => handleDeleteClick(prestador.id)}
                    />
                  );
                })}
              </SimpleGrid>
              {servicosFiltrados.length === 0 && (<Box textAlign="center" py={10}><Text color="gray.400">Nenhum serviço encontrado com estes critérios.</Text></Box>)}
            </VStack>
          </VStack>
        </Container>
        <Footer />
      </Box>

      {servicoParaEditar && (
        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          servico={servicoParaEditar}
          onUpdate={handleUpdateServico}
        />
      )}
    </>
  );
}