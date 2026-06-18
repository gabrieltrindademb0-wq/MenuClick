MenuClick - Apps separados

Estrutura criada para funcionar como 3 sites/apps independentes:

1) cliente/index.html
   App público do cliente. Não mostra links para painéis administrativos.

2) restaurante/index.html
   Painel exclusivo para donos de restaurantes. Não aparece dentro do app do cliente.

3) criador/index.html
   Painel exclusivo dos criadores/admin geral. Não aparece dentro do app do cliente nem no painel da loja.

Como testar no computador:
- Abra cada pasta separadamente e clique no index.html correspondente.

Como publicar no GitHub Pages:
Opção A - Um repositório com 3 pastas:
- /cliente
- /restaurante
- /criador

Exemplos de links:
- seusite.github.io/MenuClick/cliente/
- seusite.github.io/MenuClick/restaurante/
- seusite.github.io/MenuClick/criador/

Opção B - 3 repositórios/sites separados:
- menuclick-cliente
- menuclick-restaurante
- menuclick-criador

Importante:
Hoje os dados ainda são de protótipo/localStorage. Se você hospedar em domínios separados, os dados não sincronizam automaticamente entre cliente, restaurante e criador. Para virar sistema real separado, conecte os 3 apps no mesmo backend: Google Sheets + Apps Script, Firebase, Supabase ou outro banco online.
