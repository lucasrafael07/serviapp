// components/CadastroForm.js
import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { CATEGORIAS_PRINCIPAIS } from '../config/appConfig';
import { 
  Button, FormControl, FormLabel, Input, Select, VStack, Heading, Checkbox, 
  Link as ChakraLink, Text
} from '@chakra-ui/react';
import CidadesEstadosData from '../data/estados-cidades.json';
import { useRouter } from 'next/router';

export default function CadastroForm({ initialData = null, isEditMode = false }) {
  const { user, fetchUserData } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '', categoria: '', servico: '', telefone: '', email: '', estado: '', cidade: ''
  });
  const [uploading, setUploading] = useState(false);
  const [cidades, setCidades] = useState([]);
  const [termsAccepted, setTermsAccepted] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        nome: initialData.nome || '', categoria: initialData.categoria || '', servico: initialData.servico || '',
        telefone: initialData.telefone || '', email: initialData.email || '', estado: initialData.estado || '',
        cidade: initialData.cidade || '',
      });
      if (initialData.estado) {
        const estadoEncontrado = CidadesEstadosData.estados.find(e => e.sigla === initialData.estado);
        if (estadoEncontrado) setCidades(estadoEncontrado.cidades);
      }
    } else if (!isEditMode && user) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [initialData, isEditMode, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'estado') {
      const estadoEncontrado = CidadesEstadosData.estados.find(est => est.sigla === value);
      setCidades(estadoEncontrado ? estadoEncontrado.cidades : []);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) { alert("Você precisa estar logado."); return; }
    if (!termsAccepted) { alert("Você precisa aceitar os Termos de Uso."); return; }
    
    setUploading(true);
    const fileInput = event.target.logo;
    let logoUrl = initialData?.logoUrl || null;

    try {
      if (fileInput.files[0]) {
        const file = fileInput.files[0];
        const storageRef = ref(storage, `logos/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        logoUrl = await getDownloadURL(storageRef);
      }
      
      const dataToSave = { ...formData, logoUrl };

      if (isEditMode) {
        const docRef = doc(db, "servicos", initialData.id);
        await updateDoc(docRef, dataToSave);
        alert("Anúncio atualizado com sucesso!");
        router.push('/consulta');
      } else {
        await addDoc(collection(db, "servicos"), { ...dataToSave, userId: user.uid, dataCadastro: new Date() });
        alert("Serviço cadastrado com sucesso!");
        await fetchUserData(user);
        router.push('/consulta');
      }
    } catch (e) {
      console.error("Erro:", e);
      alert("Ocorreu um erro ao salvar.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={4}>
      <Heading as="h3" size="lg">{isEditMode ? "Editar Anúncio" : "Cadastre seu Serviço"}</Heading>
      <FormControl isRequired><FormLabel>Nome ou Razão Social:</FormLabel><Input name="nome" value={formData.nome} onChange={handleInputChange} /></FormControl>
      <FormControl isRequired><FormLabel>Categoria do Estabelecimento ou Serviço:</FormLabel><Select name="categoria" value={formData.categoria} onChange={handleInputChange} placeholder="-- Selecione --">{CATEGORIAS_PRINCIPAIS.map(cat => (<option key={cat} value={cat} style={{ color: "black" }}>{cat}</option>))}</Select></FormControl>
      <FormControl isRequired><FormLabel>Serviço Específico:</FormLabel><Input name="servico" value={formData.servico} onChange={handleInputChange} placeholder="Ex: Eletricista Residencial" /></FormControl>
      <FormControl isRequired><FormLabel>Estado:</FormLabel><Select name="estado" value={formData.estado} onChange={handleInputChange} placeholder="-- Selecione um estado --">{CidadesEstadosData.estados.map(est => (<option key={est.sigla} value={est.sigla} style={{ color: "black" }}>{est.nome}</option>))}</Select></FormControl>
      <FormControl isRequired><FormLabel>Cidade:</FormLabel><Select name="cidade" value={formData.cidade} onChange={handleInputChange} placeholder={formData.estado ? "Selecione uma cidade" : "-- Escolha um estado --"} isDisabled={cidades.length === 0}>{cidades.map(cid => (<option key={cid} value={cid} style={{ color: "black" }}>{cid}</option>))}</Select></FormControl>
      <FormControl isRequired><FormLabel>Telefone / WhatsApp:</FormLabel><Input name="telefone" value={formData.telefone} onChange={handleInputChange} type="tel" /></FormControl>
      <FormControl isRequired><FormLabel>E-mail de Contato:</FormLabel><Input name="email" value={formData.email} onChange={handleInputChange} type="email" isReadOnly={!isEditMode && !!user.email} bg={!isEditMode && !!user.email ? "gray.600" : "white"} color={!isEditMode && !!user.email ? "white" : "gray.800"} /></FormControl>
      <FormControl><FormLabel>Logotipo ou sua Foto (opcional):</FormLabel><Input name="logo" type="file" accept="image/*" p={1.5} sx={{"::file-selector-button": { mr: 4, color: "black", bg: "brand.400", border: "none", borderRadius: "md" }}} /></FormControl>
      
      {!isEditMode && (
        <FormControl>
          <Checkbox isChecked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}>Li e aceito os Termos de Uso.</Checkbox>
        </FormControl>
      )}

      <Button type="submit" colorScheme="brand" size="lg" width="full" isLoading={uploading} loadingText="Salvando..." color="gray.900" isDisabled={!termsAccepted || uploading}>
        {isEditMode ? "Atualizar Cadastro" : "Salvar Cadastro"}
      </Button>
    </VStack>
  );
}
