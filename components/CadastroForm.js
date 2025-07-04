// components/CadastroForm.js

import { useState, useEffect } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from '../firebase/config'; // <-- IMPORTE 'auth'
import { useAuthState } from 'react-firebase-hooks/auth'; // <-- Hook para pegar o usuário
import { CATEGORIAS_PRINCIPAIS } from '../config/appConfig';
// ... (resto dos imports)

function CadastroForm() {
  const [user] = useAuthState(auth); // <-- Pega o usuário logado
  const [uploading, setUploading] = useState(false);
  // ... (resto dos estados)

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!termsAccepted) {
      alert("Você precisa aceitar os Termos de Uso para se cadastrar.");
      return;
    }
    if (!user) { // <-- Verifica se o usuário está logado
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
        // ... (outros campos do formulário)
        nome: form.nome.value,
        categoria: form.categoria.value,
        servico: form.servico.value,
        telefone: form.telefone.value,
        email: form.email.value,
        estado: form.estado.value,
        cidade: form.cidade.value,
        logoUrl: logoUrl,
        dataCadastro: new Date(),
        userId: user.uid // <-- ADICIONE O ID DO USUÁRIO AQUI
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

  // ... (resto do componente JSX)
  return (
    // ...
  );
}

export default CadastroForm;