// pages/consulta.js
import Head from 'next/head';
import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/config';
import { CATEGORIAS_PRINCIPAIS } from '../config/appConfig';
import ServicoCard from '../components/ServicoCard';
import { Container, Heading, VStack, Box, Text, Flex, Input, Select, SimpleGrid, Button, Checkbox, Spacer, Spinner } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function ConsultaPage() {
  const [listaDeServicos, setListaDeServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [groupingKey, setGroupingKey] = useState('');

  const fetchServicos = async () => {
    setLoading(true);
    setError(null);
    try {
      const servicosCollection = collection(db, "servicos");
      const q = query(servicosCollection, orderBy("dataCadastro", "desc"));
      const querySnapshot = await getDocs(q);
      const servicos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListaDeServicos(servicos);
    } catch (err) {
      console.error("Erro ao buscar serviços:", err);
      setError("Não foi possível carregar os serviços. Tente recarregar a página.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const servicosFiltrados = useMemo(() => 
    listaDeServicos.filter(prestador => {
      const busca = termoBusca.toLowerCase().trim();
      const atendeBusca = !busca || prestador.nome.toLowerCase().includes(busca) || prestador.servico.toLowerCase().includes(busca);
      const atendeCategoria = !filtroCategoria || prestador.categoria === filtroCategoria;
      return atendeBusca && atendeCategoria;
    }), [listaDeServicos, termoBusca, filtroCategoria]);

  const groupedData = useMemo(() => {
    if (!groupingKey) return null;
    return servicosFiltrados.reduce((acc, prestador) => {
      const key = prestador[groupingKey] || 'Não especificado';
      if (!acc[key]) { acc[key] = []; }
      acc[key].push(prestador);
      return acc;
    }, {});
  }, [servicosFiltrados, groupingKey]);

  const handleSelectCard = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    const allVisibleIds = servicosFiltrados.map(s => s.id);
    if (e.target.checked) {
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

  const handleDelete = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja apagar o serviço de ${nome}?`)) {
      try {
        await deleteDoc(doc(db, "servicos", id));
        alert("Serviço apagado com sucesso.");
        fetchServicos();
      } catch (error) {
        console.error("Erro ao apagar o serviço: ", error);
        alert("Ocorreu um erro ao apagar o serviço.");
      }
    }
  };
  
  const areAllSelected = servicosFiltrados.length > 0 && selectedIds.length === servicosFiltrados.length;

  const renderCards = (list) => {
    return list.map(prestador => (
      <ServicoCard
        key={prestador.id}
        onSelect={handleSelectCard}
        onDelete={handleDelete}
        isSelected={selectedIds.includes(prestador.id)}
        {...prestador}
      />
    ));
  };

  return (
    <Layout>
      <Head>
        <title>Consulta - SERVIAPP</title>
        <meta name="description" content="Encontre prestadores de serviço de confiança na sua comunidade." />
      </Head>
      <Container as="main" maxW="container.xl" py={10}>
        <VStack w="100%" spacing={8} id="lista-servicos" align="stretch">
          <Heading as="h2" size="xl" textAlign="center">Encontre um Profissional na Comunidade</Heading>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <Input placeholder="Buscar por nome ou serviço..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} focusBorderColor="brand.500" bg="white" color="gray.800" _placeholder={{ color: 'gray.500' }} />
            <Select placeholder="Filtrar por Categoria" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} focusBorderColor="brand.500" bg="white" color="gray.800" _placeholder={{ color: 'gray.500' }}>
              <option value="">Todas as Categorias</option>
              {CATEGORIAS_PRINCIPAIS.map(cat => <option key={cat} value={cat} style={{ color: "black" }}>{cat}</option>)}
            </Select>
            <Select placeholder="Agrupar por..." value={groupingKey} onChange={(e) => setGroupingKey(e.target.value)} focusBorderColor="brand.500" bg="white" color="gray.800" _placeholder={{ color: 'gray.500' }}>
              <option value="" style={{ color: "black" }}>Sem Agrupamento</option>
              <option value="categoria" style={{ color: "black" }}>Categoria</option>
              <option value="estado" style={{ color: "black" }}>Estado</option>
              <option value="cidade" style={{ color: "black" }}>Cidade</option>
            </Select>
          </Flex>
          <Flex align="center" gap={4}>
            <Checkbox isChecked={areAllSelected} onChange={handleSelectAll} colorScheme="brand">Selecionar Todos Visíveis</Checkbox>
            <Spacer />
            <Button colorScheme="brand" color="gray.900" onClick={handleExportToExcel} isDisabled={selectedIds.length === 0}>Exportar ({selectedIds.length}) para Excel</Button>
          </Flex>
          {loading && <Container centerContent py={10}><Spinner size="xl" /></Container>}
          {error && <Text color="red.400" textAlign="center">{error}</Text>}
          {!loading && !error && (
            <>
              {groupedData ? (
                <VStack align="stretch" spacing={10}>
                  {Object.keys(groupedData).sort().map(groupName => (
                    <Box key={groupName}>
                      <Heading size="lg" mb={4} borderBottomWidth="2px" borderColor="brand.500" pb={2}>{groupName} ({groupedData[groupName].length})</Heading>
                      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
                        {renderCards(groupedData[groupName])}
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
                  {renderCards(servicosFiltrados)}
                </SimpleGrid>
              )}
            </>
          )}
          {!loading && !error && servicosFiltrados.length === 0 && (<Box textAlign="center" py={10}><Text color="gray.400">Nenhum serviço encontrado.</Text></Box>)}
        </VStack>
      </Container>
    </Layout>
  );
}
