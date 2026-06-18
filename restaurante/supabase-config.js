// MenuClick + Supabase
// PASSO IMPORTANTE:
// 1) Crie seu projeto no Supabase.
// 2) Copie a Project URL e a Publishable/anon key.
// 3) Cole abaixo e troque enabled para true.
//
// NUNCA coloque a service_role/secret key aqui. Ela é secreta e não pode ficar no navegador.

window.MENUCLICK_SUPABASE = {
  enabled: false,

  // Exemplo: https://abcdefghijk.supabase.co
  url: 'COLE_AQUI_A_PROJECT_URL',

  // Use a chave pública: publishable key ou anon public key.
  // Exemplo novo: sb_publishable_xxxxxxxxx
  // Exemplo legado: eyJhbGciOi...
  publishableKey: 'COLE_AQUI_A_CHAVE_PUBLICA',

  // Não altere por enquanto.
  table: 'app_state',
  rowId: 'menuclick-main'
};
