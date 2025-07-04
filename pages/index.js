// pages/index.js

// ... (imports existentes)
import { ADMIN_EMAILS } from '../config/adminConfig'; // <-- IMPORTA EMAILS DE ADMIN
import EditModal from '../components/EditModal'; // <-- IMPORTA O MODAL DE EDIÇÃO

// ... (Header, Footer)

export default function HomePage() {
  // ... (estados existentes)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // <-- ESTADO PARA ADMIN

  // Estados para o modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [servicoParaEditar, setServicoParaEditar] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Verifica se o email do usuário está na lista de administradores
        setIsAdmin(ADMIN_EMAILS.includes(currentUser.email));
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // ... (useEffect para fetchServicos)

  // Função para abrir o modal
  const handleEditClick = (servico) => {
    setServicoParaEditar(servico);
    setIsEditModalOpen(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setServicoParaEditar(null);
  };

  // Função para atualizar a lista localmente após a edição
  const handleUpdateServico = (servicoAtualizado) => {
      setListaDeServicos(prev =>
          prev.map(s => s.id === servicoAtualizado.id ? servicoAtualizado : s)
      );
  };

  // ... (outras funções: handleLogout, servicosFiltrados, etc.)

  if (loading || !user) {
    // ... (tela de carregamento)
  }

  return (
    <> {/* Adicionado Fragment para o Modal */}
      <Box bg="gray.900" color="whiteAlpha.900">
        {/* ... (todo o JSX da página) */}
        
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
          {servicosFiltrados.map(prestador => {
            // Lógica para determinar se o usuário pode editar este cartão
            const canEdit = isAdmin || (user && user.uid === prestador.userId);

            return (
              <ServicoCard
                key={prestador.id}
                // ... (props existentes)
                canEdit={canEdit}
                onEditClick={() => handleEditClick(prestador)}
              />
            );
          })}
        </SimpleGrid>
        
        {/* ... (resto do JSX da página) */}
      </Box>

      {/* MODAL DE EDIÇÃO */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        servico={servicoParaEditar}
        onUpdate={handleUpdateServico}
      />
    </>
  );
}