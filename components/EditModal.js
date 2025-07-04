// components/EditModal.js

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input, VStack, useToast
} from '@chakra-ui/react';

function EditModal({ isOpen, onClose, servico, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Quando o serviço a ser editado muda, atualiza o estado do formulário
    if (servico) {
      setFormData({
        nome: servico.nome || '',
        servico: servico.servico || '',
        telefone: servico.telefone || '',
        email: servico.email || '',
      });
    }
  }, [servico]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!servico) return;
    setIsSaving(true);
    try {
      const servicoRef = doc(db, 'servicos', servico.id);
      await updateDoc(servicoRef, {
        ...formData // Salva os campos atualizados
      });
      onUpdate({ ...servico, ...formData }); // Atualiza o estado na página principal
      toast({ title: "Serviço atualizado!", status: "success", duration: 3000 });
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast({ title: "Erro ao atualizar.", description: error.message, status: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Editar Serviço</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Nome ou Razão Social</FormLabel>
              <Input name="nome" value={formData.nome} onChange={handleChange} bg="white" color="gray.800" />
            </FormControl>
            <FormControl>
              <FormLabel>Serviço Específico</FormLabel>
              <Input name="servico" value={formData.servico} onChange={handleChange} bg="white" color="gray.800" />
            </FormControl>
            <FormControl>
              <FormLabel>Telefone / WhatsApp</FormLabel>
              <Input name="telefone" value={formData.telefone} onChange={handleChange} bg="white" color="gray.800" />
            </FormControl>
            <FormControl>
              <FormLabel>E-mail (opcional)</FormLabel>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} bg="white" color="gray.800" />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
          <Button colorScheme="brand" color="gray.900" onClick={handleSave} isLoading={isSaving}>
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditModal;