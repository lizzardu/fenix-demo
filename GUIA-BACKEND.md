# Fénix — Guia: publicar no GitHub Pages e ligar a uma base de dados real

Este guia leva o protótipo **Fénix** de "site estático com dados fictícios" a
**site publicado, com base de dados real (Supabase) a guardar PROMs, dados de
alta, metas, exercícios e dúvidas**.

Está dividido em duas partes independentes:

- **Parte A** — publicar o site tal como está (grátis, ~10 minutos)
- **Parte B** — ligar a uma base de dados real (grátis para uma demonstração, ~1 hora)

Pode fazer só a Parte A se, para já, só quiser um link para mostrar o site.

---

## Parte A — Publicar no GitHub Pages

### A1. Criar conta no GitHub (se ainda não tiver)
Em [github.com](https://github.com), crie uma conta gratuita.

### A2. Criar um repositório novo
1. Clique em **New repository**
2. Nome sugerido: `fenix-uls-sao-jose`
3. Deixe "Public" selecionado (o GitHub Pages gratuito exige repositório público)
4. Não marque nenhuma opção de inicialização (README, .gitignore, licença) — vamos enviar os ficheiros que já existem
5. **Create repository**

### A3. Enviar os ficheiros do site
Duas formas, escolha a que lhe for mais fácil:

**Opção simples (sem instalar nada):** na página do repositório recém-criado,
clique em **"uploading an existing file"** e arraste **todo o conteúdo** da
pasta `fenix/` (não a pasta em si — o `index.html` deve ficar na raiz do
repositório). Confirme o commit.

**Opção com Git instalado no computador:**
```bash
cd fenix
git init
git add .
git commit -m "Primeira publicação do site Fénix"
git branch -M main
git remote add origin https://github.com/<o-seu-utilizador>/fenix-uls-sao-jose.git
git push -u origin main
```

### A4. Ativar o GitHub Pages
1. No repositório, vá a **Settings → Pages**
2. Em "Source", escolha o branch `main` e a pasta `/ (root)`
3. **Save**
4. Ao fim de 1–2 minutos, o site fica disponível em:
   `https://<o-seu-utilizador>.github.io/fenix-uls-sao-jose/`

**Está feito.** Já tem um link público para mostrar o protótipo — mas continua
sem guardar dados a sério. Para isso, siga a Parte B.

---

## Parte B — Ligar a uma base de dados real (Supabase)

### B1. Criar conta e projeto no Supabase
1. Em [supabase.com](https://supabase.com), crie uma conta gratuita (pode entrar
   diretamente com a conta do GitHub)
2. **New project**
3. Escolha um nome (ex. `fenix-uls-sao-jose`), uma password para a base de
   dados (guarde-a nas suas notas), e uma região — **escolha uma região da
   União Europeia** (ex. Frankfurt), para manter os dados em território
   europeu, relevante para RGPD mesmo em fase de testes
4. Aguarde 1–2 minutos enquanto o projeto é criado

### B2. Criar as tabelas da base de dados
1. No painel do projeto, vá a **SQL Editor** (barra lateral)
2. **New query**
3. Abra o ficheiro `database/schema.sql` (incluído neste projeto), copie todo
   o conteúdo e cole no editor
4. Clique em **Run**
5. Deve ver "Success. No rows returned" — isto significa que todas as tabelas,
   ligações e regras de acesso foram criadas. Pode confirmar em **Table Editor**
   na barra lateral: deve ver `doentes`, `perfis`, `metas`, `duvidas`, etc.

### B3. Criar o espaço de armazenamento para as fotos das metas
1. Vá a **Storage** na barra lateral
2. **New bucket** → nome: `fotos-metas` → pode deixar como bucket privado (as regras abaixo tratam do acesso)
3. **Create bucket**
4. Volte ao **SQL Editor** e corra este bloco adicional (não fica incluído no
   `schema.sql` principal porque só pode ser corrido depois de o bucket existir):
   ```sql
   update storage.buckets set public = true where id = 'fotos-metas';

   create policy "utilizadores autenticados podem enviar fotos de metas"
   on storage.objects for insert
   with check (bucket_id = 'fotos-metas' and auth.role() = 'authenticated');

   create policy "utilizadores autenticados podem ver fotos de metas"
   on storage.objects for select
   using (bucket_id = 'fotos-metas' and auth.role() = 'authenticated');
   ```
   Sem este passo, o envio de fotos falha com o erro "new row violates row-level
   security policy" — as tabelas e o armazenamento de ficheiros têm sistemas de
   regras separados no Supabase.

### B4. Obter as credenciais de ligação
1. Vá a **Project Settings → API**
2. Copie o **Project URL** (algo como `https://xxxxx.supabase.co`)
3. Copie a **anon public key** (uma chave longa) — **não copie a `service_role key`**, essa é secreta e nunca deve sair do servidor

### B5. Configurar o site com as suas credenciais
1. Na pasta `assets/js/`, copie o ficheiro `supabase-config.example.js` e
   renomeie a cópia para `supabase-config.js`
2. Abra `supabase-config.js` e substitua os dois valores pelos que copiou no
   passo anterior:
   ```js
   window.FENIX_CONFIG = {
     SUPABASE_URL: "https://xxxxx.supabase.co",
     SUPABASE_ANON_KEY: "a-sua-chave-longa-aqui"
   };
   ```
3. Guarde o ficheiro

### B6. Criar as duas primeiras contas de teste (uma de profissional, uma de doente)
1. No Supabase, vá a **Authentication → Users → Add user** e crie um utilizador
   com um email e password à sua escolha (ex. `profissional@teste.pt`)
2. Volte ao **Table Editor → perfis → Insert row**, e crie uma linha associada
   a esse utilizador com `papel = profissional` e `especialidade` preenchida
3. Repita para um segundo utilizador com `papel = doente` — mas antes precisa
   de ter pelo menos um doente na tabela `doentes` (crie uma linha de teste lá
   primeiro) para poder preencher o campo `doente_id` no perfil

*(Este passo manual serve só para testar. No fluxo normal do site, é a página
"Novo Doente" que cria estes registos automaticamente através do
`fenixApi.criarDoenteEConta(...)`.)*

### B7. Ligar as páginas HTML ao Supabase
Cada página que precisa de dados reais tem de incluir, antes do
`main.js`, estas três linhas:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../assets/js/supabase-config.js"></script>
<script src="../assets/js/supabase-client.js"></script>
```

E depois usar as funções de `fenixApi` (documentadas com exemplos dentro de
`assets/js/supabase-client.js`) em vez das funções de demonstração de
`main.js`. Por exemplo, em vez de:
```js
adicionarMetaPessoal(titulo, importante);   // demonstração, não persiste
```
passa a ser:
```js
await fenixApi.adicionarMeta(doenteId, { label: titulo, importante, origem: "doente" });
```

**Nota importante:** já preparei o esquema da base de dados e todas as
funções de ligação (`fenixApi`), mas ainda não substituí o código dentro de
cada uma das 14 páginas HTML — são pontos de partida prontos a usar, não uma
migração automática. Isso é o próximo passo lógico e faz mais sentido ser
feito página a página, testando cada funcionalidade à medida que é ligada,
para garantir que tudo continua a funcionar como espera. Posso continuar a
partir daqui consigo, se quiser.

### B8. Publicar as alterações
Depois de configurar `supabase-config.js` localmente, envie as alterações
para o GitHub (repita o A3) para que o site publicado passe a usar a base de
dados real.

---

## Perguntas frequentes

**Preciso de pagar alguma coisa?**
Não, para uma demonstração ou piloto pequeno. GitHub Pages é sempre gratuito
para repositórios públicos. O Supabase tem um nível gratuito com 500 MB de
base de dados e 50 mil utilizadores autenticados por mês — mais do que
suficiente aqui. Um projeto gratuito pausa ao fim de 7 dias sem atividade
(basta abrir o painel para o reativar).

**Isto já está pronto para dados reais de doentes?**
Não. Mesmo com base de dados real, isto continua a ser um protótipo:
- Não há revisão de segurança nem auditoria formal
- O envio de códigos de ativação por SMS/email não está implementado (precisa
  de uma Supabase Edge Function ligada a um serviço de envio — feito à parte)
- Não existe um acordo de tratamento de dados (DPA) formal com o Supabase
  para dados de saúde reais
- Não há integração com o SClínico/SPMS

Para dados reais de doentes, isto teria de passar por aprovação institucional
da ULS, avaliação de RGPD/segurança, e provavelmente alojamento em
infraestrutura própria ou aprovada pela SPMS — exatamente como já tínhamos
discutido no documento de arquitetura.

**E se eu quiser guardar as fotos das metas com mais privacidade?**
O bucket `fotos-metas` está configurado como público para leitura (qualquer
pessoa com o link exato da foto consegue vê-la, mas não há uma lista pública
de todas as fotos). Para maior privacidade, seria preciso mudar para URLs
assinadas temporárias em vez de URLs públicas — uma alteração pequena em
`marcarMetaConquistada()` que faço quando quiser avançar para essa parte.

---

## Avisos por email à equipa

Sempre que um doente coloca uma dúvida ou submete uma resposta a um
questionário, a equipa pode receber um email. O envio é feito por uma Supabase
Edge Function, chamada pela própria base de dados.

**Porque não é feito no browser.** O envio de email exige uma chave secreta do
fornecedor. Se essa chave estivesse na plataforma, qualquer pessoa que a
abrisse conseguiria lê-la e enviar email em nome da Unidade. Além disso, um
aviso disparado pelo browser não sairia se o doente fechasse a página logo a
seguir a submeter. Por isso o gatilho está na base de dados.

**O que o email leva.** Apenas a indicação de que há algo novo e uma ligação
para a plataforma. Não leva o nome do doente, o número de processo, o texto da
dúvida nem resultados. O email sai para fora dos sistemas da ULS, passa por um
fornecedor externo e fica em caixas de correio que a instituição não controla —
dados de saúde não devem viajar assim.

### Passos

1. **Conta no fornecedor de email.** Basta uma conta em resend.com.

   **Não é preciso uma conta separada** para os avisos à equipa e para os
   emails ao doente. A mesma conta envia de vários endereços, e permite criar
   várias API keys. O recomendado é **uma conta, duas chaves**: uma para os
   avisos à equipa, outra para os emails ao doente. Assim, se uma for
   comprometida ou tiver de ser trocada, revoga-se só essa e o outro circuito
   continua a funcionar. Duas contas separadas também funcionam, mas obrigam a
   verificar o domínio duas vezes, a gerir dois planos e a procurar em dois
   sítios quando algo falha — sem nenhuma vantagem em troca.

   Em Resend → API Keys → Create API Key, dê-lhe um nome que se perceba
   (ex. `fenix-avisos-equipa`). A chave só é mostrada uma vez.

   **Atenção ao remetente de testes.** Enquanto não verificar um domínio, o
   Resend só deixa enviar de `onboarding@resend.dev` **e só para o endereço
   com que se registou na conta**. Qualquer outro destinatário é recusado.
   Serve para um primeiro teste, mas para a Unidade receber mesmo os avisos
   é preciso verificar um domínio em Resend → Domains e usar um remetente
   desse domínio em `EMAIL_REMETENTE`.

2. **Correr a migração.** No SQL Editor do Supabase, corra
   `database/011_notificacoes_email.sql`.

3. **Publicar a Edge Function.** Com o Supabase CLI instalado:

   ```
   supabase login
   supabase link --project-ref <id-do-projeto>
   supabase functions deploy notificar-equipa
   ```

4. **Definir as variáveis da função**, no painel do Supabase em
   Edge Functions → notificar-equipa → Secrets:

   - `SEGREDO_WEBHOOK` — uma frase longa à sua escolha, inventada por si
   - `URL_PLATAFORMA` — ex. `https://lizzardu.github.io/fenix-demo`

   E, para a chave e o remetente, **depende de já existirem no projeto**:

   | Situação | O que definir |
   |---|---|
   | Ainda não há nenhum email a sair do projeto | `RESEND_API_KEY` e `EMAIL_REMETENTE` |
   | Já existem, usados pelos emails ao doente | `RESEND_API_KEY_EQUIPA` e `EMAIL_REMETENTE_EQUIPA` |

   **Porquê dois nomes.** Os segredos das Edge Functions são partilhados por
   todo o projeto, e não por função: o que estiver em `RESEND_API_KEY` é visto
   por todas as funções. Se os emails ao doente já usam esse nome, esta função
   apanharia a mesma chave e — pior — o mesmo remetente, e a equipa passaria a
   receber avisos com o endereço que o doente vê.

   Por isso a função procura primeiro `RESEND_API_KEY_EQUIPA` e
   `EMAIL_REMETENTE_EQUIPA`, e só cai nos nomes partilhados se esses não
   existirem. Sem fazer nada, reutiliza o que já lá está; definindo os nomes
   com `_EQUIPA`, os dois circuitos ficam independentes e cada chave pode ser
   revogada sem afetar o outro.

   (`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são preenchidas
   automaticamente pelo Supabase.)

5. **Dizer à base de dados onde está a função.** No SQL Editor, substituindo os
   três valores — o segredo tem de ser exatamente o mesmo do passo 4:

   ```sql
   insert into integracoes_config (chave, valor) values
     ('url_notificar_equipa', 'https://<id-do-projeto>.supabase.co/functions/v1/notificar-equipa'),
     ('segredo_webhook',      '<o mesmo segredo do passo 4>'),
     ('chave_anon',           '<a chave publicável, a mesma de supabase-config.js>')
   on conflict (chave) do update set valor = excluded.valor;
   ```

   A `chave_anon` é obrigatória: o Supabase recusa qualquer chamada a uma Edge
   Function que não traga cabeçalho `Authorization`, e rejeita-a no gateway
   antes de o código da função correr. Não é um segredo — é a mesma chave
   publicável que já está no site. Quem autoriza de facto é o
   `segredo_webhook`.

   Se instalou os avisos antes de setembro de 2026, corra também
   `database/012_corrige_chamada_edge_function.sql`: a primeira versão do
   gatilho não enviava esse cabeçalho e as chamadas eram recusadas em
   silêncio.

6. **Indicar quem recebe.** Na plataforma, em Definições → Avisos por email,
   acrescente o endereço da Unidade e escolha que avisos quer ligados.

### Enquanto não estiver configurado

Nada rebenta. Os gatilhos verificam se `integracoes_config` está preenchida e,
se não estiver, não fazem nada. As dúvidas e as respostas continuam a ser
gravadas normalmente. A secção nas Definições diz o que falta.

Um aviso que falhe nunca impede a gravação: o gatilho apanha o erro e deixa-o
no log do Postgres como *warning*.
