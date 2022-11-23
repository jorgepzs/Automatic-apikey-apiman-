# Introduction 
The purpose of this project is to automate the process of generating the APIS key from the keycloak (APIMAN). It works as follows: a demand is triggered to generate the api key in a pre configured jira epic, the application gets the data passed in the generated task, goes to APIMAN and executes the user creation journey, generates an API key, returns this key as a comment of the task and finally changes the task status to closed.  

Translated with www.DeepL.com/Translator (free version)

# Getting Started
1.	run the command  Npm install 
2.	create an env file in the project root folder with the following environment variables:
KEYGENERATOR_KEYCLOAK_USERNAME
KEYGENERATOR_KEYCLOAK_PASSWORD
KEYGENERATOR_KEYCLOAK_API_ENDPOINT
KEYGENERATOR_KEYCLOAK_CLOAK_ID_CLIENT
KEYGENERATOR_KEYCLOAK_GRANT_TYPE
KEYGENERATOR_KEYCLOAK_CREDENTIALS_SECRET
KEYGENERATOR_APIMAN_API_ENDPOINT
KEYGENERATOR_JIRA_API_ENDPOINT
KEYGENERATOR_JIRA_USERNAME
KEYGENERATOR_JIRA_PASSWORD
KEYGENERATOR_EPIC_KEY

3. Run the commando npm run start 


