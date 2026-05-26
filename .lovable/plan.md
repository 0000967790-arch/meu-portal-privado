## Objetivo
Criar uma base de associados onde apenas você (admin) pode cadastrar quem terá acesso ao Clube de Benefícios. Quem não estiver na base não consegue entrar, mesmo tendo conta.

## Como vai funcionar

1. **Sistema de papéis (roles)**
   - Tabela `user_roles` com papéis `admin` e `member`.
   - Função segura `has_role()` para verificar permissões sem risco de recursão.
   - Você recebe o papel `admin` manualmente (via migration inicial usando seu e-mail).

2. **Tabela de associados (`associates`)**
   - Campos: `id`, `user_id` (vincula ao login quando a pessoa se cadastrar), `full_name`, `email`, `phone`, `card_number` (gerado automaticamente), `active`, `created_at`.
   - RLS:
     - Somente **admin** pode inserir, editar e excluir.
     - O próprio associado pode **ver apenas o seu registro**.

3. **Controle de acesso ao Clube de Benefícios**
   - A página `/beneficios` passa a verificar se o usuário logado está na tabela `associates` e está `active = true`.
   - Se não estiver: mostra tela "Você ainda não é associado" com botão de WhatsApp para cotação.
   - Se estiver: mostra o cartão com o nome, número do cartão (vindo do banco, não mais gerado por hash) e os parceiros.

4. **Painel de Administração (`/admin/associados`)**
   - Rota protegida (só acessível para `admin`).
   - Lista todos os associados.
   - Formulário para **adicionar novo associado** (nome, e-mail, telefone) — o número do cartão é gerado automaticamente.
   - Botões para **ativar/desativar** e **excluir** associados.
   - Link no header aparece apenas quando o usuário logado é admin.

5. **Fluxo do associado**
   - Você cadastra a pessoa pelo painel admin (com o e-mail dela).
   - A pessoa se cadastra no site usando o mesmo e-mail.
   - Um trigger no banco vincula automaticamente o `user_id` ao registro em `associates` ao detectar o e-mail.
   - Ela faz login e o Clube libera o acesso.

## Detalhes técnicos
- Migration cria: enum `app_role`, tabela `user_roles`, tabela `associates`, função `has_role`, função+trigger `link_associate_on_signup`, função `generate_card_number`, políticas RLS.
- Server functions (`createServerFn` com `requireSupabaseAuth`) para todas as operações de admin (criar, listar, ativar, excluir) — nunca expor service role no cliente.
- Hook `useIsAdmin()` no frontend para mostrar/ocultar link do painel.
- Para promover você a admin: após você se cadastrar pela primeira vez, eu rodo um insert manual em `user_roles` com seu `user_id`.

## O que preciso de você antes de implementar
- Qual o **seu e-mail** que receberá papel de admin?
- Quer que o **número do cartão** siga algum formato específico (ex.: `TT-00001`, `0000 0000 0000 0001`) ou sequencial simples?
