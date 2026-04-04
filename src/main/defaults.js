const DEFAULT_CONFIG = {
  realmId: 0,
  pollSeconds: 300,
  scanEnabled: true,
  channels: {
    desktop: true,
    discordWebhookUrl: "",
    telegramBotToken: "",
    telegramChatId: ""
  },
  alerts: []
};

module.exports = {
  DEFAULT_CONFIG
};
