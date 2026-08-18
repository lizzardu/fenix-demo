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
2. **New bucket** → nome: `fotos-metas` → pode deixar como bucket privado
3. **Create bucket**

*(Isto não é feito por SQL de propósito — o Supabase trata o armazenamento de
ficheiros separadamente das tabelas.)*

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
O bucket `fotos-metas` foi criado como privado. Isso significa que, para as
fotos serem visíveis no site, é preciso gerar URLs assinadas temporárias em
vez de URLs públicas — é uma alteração pequena em `marcarMetaConquistada()`
que faço quando chegarmos a essa parte da ligação.
