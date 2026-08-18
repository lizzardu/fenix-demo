/* ============================================================================
   FÉNIX — módulo de ligação real à base de dados (Supabase)
   ============================================================================
   Este ficheiro é o "próximo passo" a seguir ao protótipo em main.js (que
   usa dados fictícios em memória). Substitui, função a função, as chamadas
   simuladas por chamadas reais à base de dados.

   Requisitos para este ficheiro funcionar:
   1. Incluir na página, ANTES deste ficheiro:
        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
        <script src="../assets/js/supabase-config.js"></script>
        <script src="../assets/js/supabase-client.js"></script>
   2. Ter criado supabase-config.js a partir do exemplo (ver esse ficheiro).
   3. Ter corrido database/schema.sql no seu projeto Supabase.

   Todas as funções devolvem Promises (usar com "await" dentro de uma
   função "async", tal como nos exemplos no fundo deste ficheiro).
   ========================================================================= */

const sb = window.supabase.createClient(
  window.FENIX_CONFIG.SUPABASE_URL,
  window.FENIX_CONFIG.SUPABASE_ANON_KEY
);

const fenixApi = {

  /* ---------------------------------------------------------------------
     AUTENTICAÇÃO
     --------------------------------------------------------------------- */
  async login(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    await sb.auth.signOut();
  },

  async utilizadorAtual() {
    const { data } = await sb.auth.getUser();
    if (!data.user) return null;
    const { data: perfil, error } = await sb.from("perfis").select("*").eq("id", data.user.id).single();
    if (error) {
      console.error("Erro ao carregar perfil:", error.message, error);
    }
    return { user: data.user, perfil };
  },

  /* ---------------------------------------------------------------------
     DOENTES
     --------------------------------------------------------------------- */
  async listarDoentes() {
    const { data, error } = await sb.from("doentes").select("*").order("criado_em", { ascending: false });
    if (error) throw error;
    return data;
  },

  async obterDoente(doenteId) {
    const { data, error } = await sb.from("doentes").select("*").eq("id", doenteId).single();
    if (error) throw error;
    return data;
  },

  async obterDoentePorProcesso(processo) {
    const { data, error } = await sb.from("doentes").select("*").eq("processo", processo).single();
    if (error) throw error;
    return data;
  },

  async atualizarDoenteContexto(doenteId, campos) {
    const { data, error } = await sb.from("doentes").update(campos).eq("id", doenteId).select().single();
    if (error) throw error;
    return data;
  },

  /**
   * Cria o registo do doente e o convite de ativação de conta.
   * NOTA IMPORTANTE: esta função cria o CONVITE (linha em contas_acesso)
   * mas não envia SMS/email — isso requer uma Supabase Edge Function
   * ligada a um serviço de envio (ex. Twilio para SMS, Resend para
   * email), porque exige chaves secretas que nunca devem estar no
   * browser. Ver o guia para o desenho dessa function.
   */
  async criarDoenteEConta({ nome, processo, dataNascimento, dataAlta, equipa, titularTipo, nomeFamiliar, telemovel, email, canal }) {
    const { data: doente, error: erroDoente } = await sb
      .from("doentes")
      .insert({ nome, processo, data_nascimento: dataNascimento, data_alta: dataAlta, equipa })
      .select()
      .single();
    if (erroDoente) throw erroDoente;

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraEm = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { error: erroConta } = await sb.from("contas_acesso").insert({
      doente_id: doente.id, titular_tipo: titularTipo, nome_familiar: nomeFamiliar,
      telemovel, email, canal_ativacao: canal, codigo_ativacao: codigo, codigo_expira_em: expiraEm
    });
    if (erroConta) throw erroConta;

    return { doente, codigo }; // "codigo" só é devolvido aqui para demonstração local;
                                 // numa Edge Function real, nunca voltaria ao browser.
  },

  /* ---------------------------------------------------------------------
     FORMULÁRIO DE ALTA
     --------------------------------------------------------------------- */
  async guardarFormularioAlta(doenteId, dados, dataAlta, contactoTipo) {
    const { data: userData } = await sb.auth.getUser();
    const { data, error } = await sb.from("formularios_alta").insert({
      doente_id: doenteId, dados, data_alta: dataAlta, contacto_tipo: contactoTipo,
      criado_por: userData.user ? userData.user.id : null
    }).select().single();
    if (error) throw error;
    return data;
  },

  async obterUltimoFormularioAlta(doenteId) {
    const { data, error } = await sb
      .from("formularios_alta").select("*")
      .eq("doente_id", doenteId).order("criado_em", { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return data;
  },

  /* ---------------------------------------------------------------------
     PROMs
     --------------------------------------------------------------------- */
  async submeterProm(doenteId, instrumento, respostas, scores) {
    const { data, error } = await sb.from("proms_respostas").insert({
      doente_id: doenteId, instrumento, respostas, scores
    }).select().single();
    if (error) throw error;
    return data;
  },

  async listarPromsDoente(doenteId, instrumento) {
    let query = sb.from("proms_respostas").select("*").eq("doente_id", doenteId).order("data_resposta");
    if (instrumento) query = query.eq("instrumento", instrumento);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /* ---------------------------------------------------------------------
     JORNADA / METAS
     --------------------------------------------------------------------- */
  async listarMetas(doenteId) {
    const { data, error } = await sb.from("metas").select("*").eq("doente_id", doenteId).order("criado_em");
    if (error) throw error;
    return data;
  },

  async adicionarMeta(doenteId, meta) {
    const { data, error } = await sb.from("metas").insert({ doente_id: doenteId, ...meta }).select().single();
    if (error) throw error;
    return data;
  },

  async atualizarMeta(metaId, campos) {
    campos.atualizado_em = new Date().toISOString();
    const { data, error } = await sb.from("metas").update(campos).eq("id", metaId).select().single();
    if (error) throw error;
    return data;
  },

  async removerMeta(metaId) {
    const { error } = await sb.from("metas").delete().eq("id", metaId);
    if (error) throw error;
  },

  /** Marca a meta como concluída e, se houver foto, faz upload para o Storage. */
  async marcarMetaConquistada(metaId, ficheiroFoto) {
    let fotoUrl = null;
    if (ficheiroFoto) {
      const caminho = `${metaId}-${Date.now()}-${ficheiroFoto.name}`;
      const { error: erroUpload } = await sb.storage.from("fotos-metas").upload(caminho, ficheiroFoto);
      if (erroUpload) throw erroUpload;
      const { data: urlData } = sb.storage.from("fotos-metas").getPublicUrl(caminho);
      fotoUrl = urlData.publicUrl;
    }
    return this.atualizarMeta(metaId, { estado: "done", ...(fotoUrl ? { foto_url: fotoUrl } : {}) });
  },

  /* ---------------------------------------------------------------------
     PLANO DE TRATAMENTO — exercícios, registos e dieta
     --------------------------------------------------------------------- */
  async listarExercicios(doenteId) {
    const { data, error } = await sb.from("plano_exercicios").select("*, plano_registos(*)").eq("doente_id", doenteId);
    if (error) throw error;
    return data;
  },

  async prescreverExercicio(doenteId, exercicio) {
    const { data, error } = await sb.from("plano_exercicios").insert({ doente_id: doenteId, ...exercicio }).select().single();
    if (error) throw error;
    return data;
  },

  async atualizarExercicio(exercicioId, campos) {
    const { data, error } = await sb.from("plano_exercicios").update(campos).eq("id", exercicioId).select().single();
    if (error) throw error;
    return data;
  },

  async removerExercicio(exercicioId) {
    const { error } = await sb.from("plano_exercicios").delete().eq("id", exercicioId);
    if (error) throw error;
  },

  async registarExecucaoExercicio(exercicioId, doenteId, esforco, nota) {
    const { data, error } = await sb.from("plano_registos").insert({
      exercicio_id: exercicioId, doente_id: doenteId, esforco, nota
    }).select().single();
    if (error) throw error;
    return data;
  },

  /* ---------------------------------------------------------------------
     DÚVIDAS
     --------------------------------------------------------------------- */
  async listarDuvidas(doenteId) {
    let query = sb.from("duvidas").select("*, doentes(nome)").order("criado_em", { ascending: false });
    if (doenteId) query = query.eq("doente_id", doenteId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async submeterDuvida(doenteId, categoria, pergunta) {
    const { data, error } = await sb.from("duvidas").insert({ doente_id: doenteId, categoria, pergunta }).select().single();
    if (error) throw error;
    return data;
  },

  async responderDuvida(duvidaId, resposta, respondidoPor) {
    const { data, error } = await sb.from("duvidas").update({
      estado: "respondida", resposta, respondido_por: respondidoPor, data_resposta: new Date().toISOString().slice(0, 10)
    }).eq("id", duvidaId).select().single();
    if (error) throw error;
    return data;
  }
};

/* ============================================================================
   EXEMPLO DE USO (dentro de uma página, depois de incluir este ficheiro):

   <script>
     async function carregar() {
       const { perfil } = await fenixApi.utilizadorAtual();
       const metas = await fenixApi.listarMetas(perfil.doente_id);
       console.log(metas);
     }
     carregar();
   </script>
   ========================================================================= */
