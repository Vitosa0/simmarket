const DEFAULT_CONFIG = {
  realmId: 0,
  pollSeconds: 180,
  scanEnabled: true,
  channels: {
    desktop: true,
    discordWebhookUrl: "",
    telegramBotToken: "",
    telegramChatId: ""
  },
  alerts: [
    {
      id: "water-q0-buy",
      label: "Agua Q0 compra",
      resourceId: 2,
      quality: 0,
      condition: "<=",
      targetPrice: 0.37,
      enabled: true,
      repeatWhileMatched: true
    },
    {
      id: "water-q0-sell",
      label: "Agua Q0 venta",
      resourceId: 2,
      quality: 0,
      condition: ">=",
      targetPrice: 0.405,
      enabled: true,
      repeatWhileMatched: true
    },
    {
      id: "transport-q0-buy",
      label: "Transporte Q0 compra",
      resourceId: 13,
      quality: 0,
      condition: "<=",
      targetPrice: 0.39,
      enabled: true,
      repeatWhileMatched: true
    },
    {
      id: "power-q0-buy",
      label: "Luz Q0 compra",
      resourceId: 1,
      quality: 0,
      condition: "<=",
      targetPrice: 0.27,
      enabled: true,
      repeatWhileMatched: true
    }
  ]
};

module.exports = {
  DEFAULT_CONFIG
};
