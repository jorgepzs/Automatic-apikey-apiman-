export default () => ({
  http: {
    apis: {
      keycloak: {
        baseUrl: process.env.KEYGENERATOR_KEYCLOAK_API_ENDPOINT,
        grantType: process.env.KEYGENERATOR_KEYCLOAK_GRANT_TYPE,
        clientId: process.env.KEYGENERATOR_KEYCLOAK_CLIENT_ID,
        clientSecret: process.env.KEYGENERATOR_KEYCLOAK_CREDENTIALS_SECRET,
        username: process.env.KEYGENERATOR_KEYCLOAK_USERNAME,
        password: process.env.KEYGENERATOR_KEYCLOAK_PASSWORD,
      },
      apiman: {
        baseUrl: process.env.KEYGENERATOR_APIMAN_API_ENDPOINT,
      },
      jira: {
        baseUrl: process.env.KEYGENERATOR_JIRA_API_ENDPOINT,
        username: process.env.KEYGENERATOR_JIRA_USERNAME,
        password: process.env.KEYGENERATOR_JIRA_PASSWORD,
        epicKey: process.env.KEYGENERATOR_EPIC_KEY,
      },
    },
  },
});
