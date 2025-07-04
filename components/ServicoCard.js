// components/ServicoCard.js
import { Box, Image, Heading, Text, VStack, HStack, Tag, Icon, Divider, Checkbox, Button, ButtonGroup } from '@chakra-ui/react';
import { FaMapMarkerAlt, FaBriefcase, FaPhone, FaEnvelope, FaEdit, FaTrash } from "react-icons/fa";
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

function ServicoCard({ onDelete, ...prestador }) {
  const { id, nome, servico, cidade, estado, logoUrl, telefone, email, categoria, userId, isSelected, onSelect } = prestador;
  const { user, isAdmin } = useAuth();
  
  const canManage = (user && user.uid === userId) || isAdmin;
  const imagemExibida = logoUrl || 'https://i.imgur.com/8lC3A4z.png';

  return (
    <Box
      borderWidth="2px" borderRadius="lg" overflow="hidden" boxShadow="lg" bg="gray.700"
      borderColor={isSelected ? "brand.500" : "gray.600"}
      transition="all 0.3s" _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl' }}
      position="relative" display="flex" flexDirection="column" height="100%"
    >
      <Checkbox isChecked={isSelected} onChange={() => onSelect(id)} position="absolute" top={3} right={3} colorScheme="brand" size="lg" bg="gray.800" borderRadius="md" p={1} />
      <Image src={imagemExibida} alt={`Logo de ${nome}`} h="200px" w="100%" objectFit="cover" />
      <VStack p={5} align="start" spacing={3} flex="1">
        <Tag size="md" variant="solid" colorScheme="brand" color="gray.900" borderRadius="full">{categoria || 'Serviço'}</Tag>
        <Heading as="h3" size="md" noOfLines={1} title={nome} color="whiteAlpha.900">{nome}</Heading>
        <VStack align="start" spacing={2} fontSize="sm" w="100%" color="gray.300">
          <HStack><Icon as={FaBriefcase} color="brand.500" /><Text noOfLines={2} title={servico}>{servico}</Text></HStack>
          <HStack><Icon as={FaMapMarkerAlt} color="brand.500" /><Text>{cidade} - {estado}</Text></HStack>
        </VStack>
        <Box flex="1"></Box>
        <Divider my={3} borderColor="gray.600" />
        <VStack align="start" spacing={2} fontSize="sm" w="100%" color="whiteAlpha.900">
          <Heading as="h4" size="xs" color="brand.500">Contato:</Heading>
          <HStack><Icon as={FaPhone} /><Text>{telefone}</Text></HStack>
          {email && <HStack><Icon as={FaEnvelope} /><Text>{email}</Text></HStack>}
        </VStack>
        {canManage && (
          <ButtonGroup size="xs" width="full" pt={3}>
            <Link href={`/editar/${id}`} passHref>
              <Button as="a" leftIcon={<FaEdit />} flex="1" colorScheme="yellow" color="gray.900">Editar</Button>
            </Link>
            <Button leftIcon={<FaTrash />} colorScheme="red" flex="1" onClick={() => onDelete(id, nome)}>Apagar</Button>
          </ButtonGroup>
        )}
      </VStack>
    </Box>
  );
}
export default ServicoCard;
