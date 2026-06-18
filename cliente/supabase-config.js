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
  url: https://fnlnqrwmnsxrxlxsybta.supabase.co,

  // Use a chave pública: publishable key ou anon public key.
  // Exemplo novo: sb_publishable_xxxxxxxxx
  // Exemplo legado: eyJhbGciOi...
  publishableKey: sb_publishable_RrYJpzfvm9eXzdcTmMPFhQ_Xgrwa6R4,

  // Não altere por enquanto.
  table: 'app_state',
  rowId: 'menuclick-main'
};
