MENUCLICK + SUPABASE - PACOTE INICIANTE

Este pacote já vem preparado para conectar o MenuClick ao Supabase.
Ele mantém a estrutura separada:

cliente/index.html
restaurante/index.html
criador/index.html

O que foi alterado:
- Adicionado supabase-config.js em cada app.
- Adicionada biblioteca oficial supabase-js no HTML.
- data.js agora continua salvando no localStorage, mas também sincroniza com Supabase quando configurado.
- Adicionado supabase-schema.sql para criar a tabela app_state.

ARQUIVOS IMPORTANTES

1) supabase-schema.sql
Cole no SQL Editor do Supabase e clique em Run.

2) supabase-config.js
Edite dentro das 3 pastas:
- cliente/supabase-config.js
- restaurante/supabase-config.js
- criador/supabase-config.js

Troque:
enabled: false
para:
enabled: true

Cole sua Project URL e sua Publishable/anon public key.

NUNCA cole service_role ou secret key no app.

COMO FUNCIONA

No modo iniciante, todos os dados do MenuClick ficam na tabela app_state, dentro de uma coluna JSON chamada data.
Isso é fácil para começar porque você não precisa reprogramar o app inteiro agora.

Quando você altera produto no restaurante, muda status do pedido ou edita algo no ADM, o app salva:
1. no navegador, para funcionar rápido;
2. no Supabase, para outros painéis/celulares receberem depois.

A cada 20 segundos o app verifica se o banco mudou.
Se mudou, ele atualiza e recarrega a página.

ATENÇÃO DE SEGURANÇA

Este modo iniciante serve para teste/MVP.
Ele ainda não tem login real por restaurante.
Para produção final, o ideal é usar o modelo profissional com Auth + RLS + tabelas separadas.
Deixei um arquivo opcional chamado supabase-schema-profissional-futuro.sql para essa fase futura.
