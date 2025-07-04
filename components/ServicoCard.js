// components/ServicoCard.js

import { Box, Image, Heading, Text, VStack, HStack, Tag, Icon, Divider, Checkbox, Button } from '@chakra-ui/react';
import { FaMapMarkerAlt, FaBriefcase, FaPhone, FaEnvelope, FaEdit } from "react-icons/fa";

function ServicoCard({
  // ... (props existentes)
  id, onSelect, isSelected, nome, servico, cidade, estado, logoUrl, telefone, email, categoria,
  // NOVAS PROPS
  canEdit,
  onEditClick
}) {
  const imagemExibida = logoUrl || 'https://i.imgur.com/8lC3A4z.png';

  return (
    <Box
      // ... (estilos existentes)
    >
      <Checkbox
        // ... (props do checkbox)
      />
      
      <Image src={imagemExibida} alt={`Logo de ${nome}`} h="200px" w="100%" objectFit="cover" />
      <VStack p={5} align="start" spacing={3} flex="1">
        {/* ... (conteúdo do cartão) */}
      </VStack>

      {/* BOTÃO DE EDITAR */}
      {canEdit && (
        <Button
          position="absolute"
          bottom={3}
          right={3}
          size="sm"
          colorScheme="yellow"
          onClick={() => onEditClick()}
        >
          <Icon as={FaEdit} />
        </Button>
      )}
    </Box>
  );
}

export default ServicoCard;