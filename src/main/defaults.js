const REALM_OPTIONS = [
  { id: 0, key: "magnates", labelEs: "Magnates", labelEn: "Magnates" },
  { id: 1, key: "entrepreneurs", labelEs: "Emprendedores", labelEn: "Entrepreneurs" }
];

const DEFAULT_REALM_ID = 0;

const DEFAULT_CONFIG = {
  realmId: DEFAULT_REALM_ID,
  activeRealmId: DEFAULT_REALM_ID,
  pollSeconds: 300,
  scanEnabled: true,
  channels: {
    desktop: true,
    discordWebhookUrl: "",
    telegramBotToken: "",
    telegramChatId: ""
  },
  alerts: [],
  portfolio: [],
  realms: REALM_OPTIONS.reduce((acc, realm) => {
    acc[String(realm.id)] = {
      alerts: [],
      portfolio: []
    };
    return acc;
  }, {})
};

module.exports = {
  DEFAULT_CONFIG,
  DEFAULT_REALM_ID,
  REALM_OPTIONS
};
