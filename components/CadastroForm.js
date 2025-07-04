// components/CadastroForm.js

import { useState, useEffect } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from '../firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { CATEGORIAS_PRINCIPAIS } from '../config/appConfig';
import { 
  Button, FormControl, FormLabel, Input, Select, VStack, Heading, Checkbox, 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, Link, Text, UnorderedList, ListItem
} from '@chakra-ui/react';
import CidadesEstadosData from '../data/estados-cidades.json';

function CadastroForm() {
  const [user] = useAuthState(auth);
  const [uploading, setUploading] = useState(false);
  const [cidades, setCidades] = useState([]);
  const [selectedEstado, setSelectedEstado] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (selectedEstado) {
      const estadoEncontrado = CidadesEstadosData.estados.find(estado => estado.sigla === selectedEstado);
      setCidades(estadoEncontrado ? estadoEncontrado.cidades : []);
    } else {
      setCidades([]);
    }
  }, [selectedEstado]);

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    if (!termsAccepted) {
      alert("Você precisa aceitar os Termos de Uso para se cadastrar.");
      return;
    }
    if (!user) {
      alert("Você precisa estar logado para cadastrar um serviço.");
      return;
    }

    setUploading(true);
    const form = event.target;
    const fileInput = form.logo;
    let logoUrl = null;

    try {
      if (fileInput.files[0]) {
        const file = fileInput.files[0];
        const storageRef = ref(storage, `logos/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        logoUrl = await getDownloadURL(storageRef);
      }
      
      await addDoc(collection(db, "servicos"), {
        nome: form.nome.value,
        categoria: form.categoria.value,
        servico: form.servico.value,
        telefone: form.telefone.value,
        email: form.email.value, 
        estado: form.estado.value,
        cidade: form.cidade.value,
        logoUrl: logoUrl,
        dataCadastro: new Date(),
        userId: user.uid // <-- SALVA O ID DO DONO DO CADASTRO
      });

      alert("Serviço cadastrado com sucesso!");
      form.reset();
      setSelectedEstado("");
      setTermsAccepted(false);
    } catch (e) {
      console.error("Erro no cadastro: ", e);
      alert("Ocorreu um erro ao cadastrar.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <VStack as="form" onSubmit={handleSubmit} spacing={4}>
          <Heading as="h3" size="lg">Cadastre seu Serviço na Comunidade</Heading>
          <FormControl isRequired><FormLabel>Nome ou Razão Social:</FormLabel><Input id="nome" name="nome" /></FormControl>
          <FormControl isRequired><FormLabel>Categoria do Estabelecimento ou Serviço:</FormLabel><Select id="categoria" name="categoria" placeholder="-- Selecione --">{CATEGORIAS_PRINCIPAIS.map(cat => (<option key={cat} value={cat} style={{ color: "black" }}>{cat}</option>))}</Select></FormControl>
          <FormControl isRequired><FormLabel>Serviço Específico:</FormLabel><Input id="servico" name="servico" placeholder="Ex: Eletricista Residencial" /></FormControl>
          <FormControl isRequired>
            <FormLabel>Estado:</FormLabel>
            <Select id="estado" name="estado" placeholder="-- Selecione um estado --" onChange={(e) => setSelectedEstado(e.target.value)} value={selectedEstado}>
              {CidadesEstadosData.estados.map(estado => (<option key={estado.sigla} value={estado.sigla} style={{ color: "black" }}>{estado.nome}</option>))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Cidade:</FormLabel>
            <Select id="cidade" name="cidade" placeholder={selectedEstado ? "Selecione uma cidade" : "-- Primeiro escolha um estado --"} isDisabled={cidades.length === 0}>
              {cidades.map(cidade => (<option key={cidade} value={cidade} style={{ color: "black" }}>{cidade}</option>))}
            </Select>
          </FormControl>
          <FormControl isRequired><FormLabel>Telefone / WhatsApp:</FormLabel><Input id="telefone" name="telefone" type="tel" /></FormControl>
          <FormControl><FormLabel>E-mail (opcional):</FormLabel><Input id="email" name="email" type="email" /></FormControl>
          <FormControl><FormLabel>Logotipo ou sua Foto:</FormLabel><Input id="logo" name="logo" type="file" accept="image/*" p={1.5} sx={{"::file-selector-button": { mr: 4, color: "black", bg: "brand.400", border: "none", borderRadius: "md" }}} /></FormControl>
          
          <FormControl>
            <Checkbox isChecked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}>
              Li e aceito os{" "}
              <Link color="brand.400" onClick={onOpen} _hover={{ textDecoration: "underline" }}>
                Termos de Uso e Privacidade de Dados
              </Link>
              .
            </Checkbox>
          </FormControl>

          <Button type="submit" colorScheme="brand" size="lg" width="full" isLoading={uploading} loadingText="Enviando..." color="gray.900" isDisabled={!termsAccepted || uploading || !user}>
            Salvar Cadastro
          </Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>Termos de Uso e Política de Privacidade</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="start" spacing={4}>
              <Text>Ao se cadastrar no SERVIAPP, você entende e concorda com os seguintes pontos:</Text>
              <UnorderedList spacing={3}>
                <ListItem>
                  <strong>Propósito da Ferramenta:</strong> O SERVIAPP é um guia de contatos criado com o único propósito de facilitar a conexão e a ajuda mútua entre os membros da nossa comunidade cristã.
                </ListItem>
                <ListItem>
                  <strong>Publicidade dos Dados:</strong> As informações que você cadastra (Nome/Razão Social, Serviço, Categoria, Contatos, etc.) ficarão visíveis para os outros membros da comunidade que acessarem o aplicativo.
                </ListItem>
                <ListItem>
                  <strong>Sua Responsabilidade:</strong> Você é inteiramente responsável pela veracidade, exatidão e legalidade das informações que publica. Garanta que você tem o direito de compartilhar todos os dados e imagens fornecidas.
                </ListItem>
                <ListItem>
                  <strong>Isenção de Responsabilidade:</strong> O SERVIAPP e seus administradores atuam apenas como uma plataforma para exibir os contatos. Não nos responsabilizamos pela qualidade dos serviços prestados, pelas negociações entre as partes, nem pela veracidade das informações cadastradas por terceiros. A responsabilidade por qualquer transação ou serviço contratado é exclusivamente das partes envolvidas.
                </ListItem>
              </UnorderedList>
              <Text pt={4}>Ao marcar a caixa de aceite, você confirma que leu, compreendeu e concorda com todos os termos acima.</Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" color="gray.900" onClick={onClose}>
              Entendi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default CadastroForm;