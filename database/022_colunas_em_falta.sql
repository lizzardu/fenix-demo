-- ============================================================================
-- FÉNIX — Três colunas que o site usa e que nenhuma migração criava
-- Migração 022 · executar no SQL Editor do Supabase
--
-- (O número 021 fica vago de propósito: é o da adaptação pediátrica, que
--  pertence à plataforma Lumi e não a esta. Esta migração é a mesma nas duas,
--  e por isso tem o mesmo número nas duas.)
-- ============================================================================
--
-- O QUE ISTO CORRIGE
--
-- O Formulário de Alta escreve três campos na tabela "doentes" — o email de
-- contacto, o género e o gestor de caso:
--
--     area-profissional/formulario-alta.html, linhas 1494-1496
--       if (email)      contexto.email          = email;
--       if (generoEl)   contexto.genero         = ...;
--       if (gestorCaso) contexto.gestor_caso_id = gestorCaso;
--
-- e a área do doente lê o gestor de caso para o mostrar em primeiro lugar na
-- lista da equipa (area-doente/dashboard.html). Nenhuma das três colunas
-- estava em migração nenhuma: nem no schema.sql, nem da 006 à 020.
--
-- PORQUE É QUE ISTO NUNCA DEU PROBLEMA
--
-- Porque na base de dados de produção as colunas existem. Foram acrescentadas
-- à mão, no painel do Supabase, e ninguém as escreveu num ficheiro. O código
-- e a base de dados ficaram certos; o que ficou errado foi o registo de como
-- se chega de uma à outra.
--
-- PORQUE É QUE ISSO IMPORTA
--
-- Porque a próxima pessoa que instalar isto de raiz — noutro hospital, num
-- ambiente de testes, ou a seguir a uma restauração — fica com uma base de
-- dados sem as três colunas e sem nada que lho diga. E a forma como isso se
-- manifesta é das piores: a equipa preenche as nove secções da avaliação de
-- alta, carrega em guardar, e só então rebenta, com um erro do PostgREST a
-- dizer que a coluna não existe. O trabalho todo perdido no último clique.
--
-- Foi encontrado ao instalar a plataforma pediátrica num projeto Supabase
-- novo, que é exatamente o cenário descrito acima.
--
-- É SEGURO CORRER AQUI?
--
-- Sim. Usa "add column if not exists": numa base de dados onde as colunas já
-- existam não altera nada — nem o tipo, nem os dados. O que acrescenta é o
-- que faltava: a definição em ficheiro, os comentários que explicam para que
-- serve cada uma, e o índice do gestor de caso. Correr duas vezes também não
-- faz mal.
--
-- No fim diz-lhe, em texto, se encontrou as colunas já criadas ou se teve de
-- as criar.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Diagnóstico antes de mexer
-- ---------------------------------------------------------------------------
do $$
declare
  faltam text[] := '{}';
  c text;
begin
  foreach c in array array['email','genero','gestor_caso_id'] loop
    if not exists (
      select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'doentes' and column_name = c
    ) then
      faltam := faltam || c;
    end if;
  end loop;

  if array_length(faltam, 1) is null then
    raise notice 'As três colunas já existiam. Esta migração não vai alterar dados — só acrescenta os comentários e o índice.';
  else
    raise notice 'Em falta, e a criar agora: %', array_to_string(faltam, ', ');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. As colunas
-- ---------------------------------------------------------------------------
alter table doentes
  add column if not exists email           text,
  add column if not exists genero          text,
  add column if not exists gestor_caso_id  uuid references perfis(id);

comment on column doentes.email is
  'Email de contacto do doente, recolhido no Formulário de Alta. Distinto do email da conta de acesso, que vive em contas_acesso e em auth.users: este é para contacto clínico, aquele é para autenticação.';
comment on column doentes.genero is
  'Texto livre com o que foi escolhido no formulário (Feminino, Masculino, Outro). Deliberadamente sem restrição de valores: a lista pode mudar sem obrigar a uma migração.';
comment on column doentes.gestor_caso_id is
  'O profissional responsável por este doente. Aponta para perfis(id). É este nome que o doente vê em primeiro lugar, marcado com estrela, na lista da sua equipa.';

-- O índice serve a pergunta "quais são os meus doentes", que é a que um
-- gestor de caso faz todos os dias.
create index if not exists doentes_gestor_caso_idx on doentes (gestor_caso_id);


-- ============================================================================
-- VERIFICAÇÃO — devem aparecer três linhas
-- ============================================================================
select column_name   as coluna,
       data_type     as tipo,
       is_nullable   as admite_nulo
  from information_schema.columns
 where table_schema = 'public'
   and table_name   = 'doentes'
   and column_name in ('email','genero','gestor_caso_id')
 order by column_name;
