# Ambiente de EXEMPLO para projetos em NODE.JS
Este projeto foi criado para motivos acadêmicos para minha aprendizagem pessoal
utilizando [node.js](https://nodejs.org/en) e [Express.js](https://expressjs.com/pt-br/). 

# Instalação de dependencias

## Projetos
Este projeto tem como dependencia um outro projeto meu [node-horizontal-api](https://github.com/ismaelalvesgit/node-horizontal-api)

## Linguagem
È necessario que o [node.js](https://nodejs.org/en) já esteja instalado em sua máquina

## Consumers
A utilização dos consumer´s deste projeto e feitar por [CLI](https://www.hostinger.com.br/tutoriais/o-que-e-cli) segue
abaixo a lista de commdandos e suas funcionalidades

Name                        | Description                                                   | execute
----------------------------|---------------------------------------------------------------|------------------
list                        | Listagem de todos os possiveis consumer´s                     | npm run dev list
async-create-product        | Execução do consumer de criação de produtos                   | npm run dev async-create-product
async-create-category       | Execução do consumer de criação de categorias                 | npm run dev async-create-category
healthcheck                 | Execução do healthcheck do serviço                            | npm run dev healthcheck
all                         | Execução de todos os consumer´s cadastrados                   | npm run dev all

## Helm
Deixei configurado o [helm](https://helm.sh/) para que sejá possivel trabalhar com [kubernetes](https://kubernetes.io/pt-br/).

### 1) Helm DEPLOY types
Name       | Description                                                   
-----------|---------------------------------------------------------------
SINGLE     | O deploy será realizado por `kind: Deployment` utilizando o comando `npm run dev all`
DEPLOYMENT | O deploy será realizado por `kind: Deployment` utilizando o comando `npm run dev <name consumer>`

### 2) Helm Values
```yml
replicaCount: 1 # Number of pod´s running

image:
  repository: ismaelalvesdoc/node-horizontal-job # Repository name
  tag: latest # Version Tag
  pullPolicy: Always # Policy of download image

deploy:
  type: SINGLE # SINGLE | DEPLOYMENT

env: # Enviroment´s of service (Not encript)
  APM_SERVER_URL: "http://localhost:8200" # Name of enviroment and Value of envriroment 

secret: # Enviroment´s of service (Encript)
  DB_PASSWORD: "admin" # Name of enviroment and Value of envriroment 

jobs:
  - name: create-product # Job name
    namespace: # namespace
    command: async-create-product # Command to execute

resources: # Resources of pod´s
  requests: # Provisined
    memory: "700Mi" 
    cpu: 400m
  limits: # Limit of scale vertical
    memory: "1Gi"
    cpu: 800m

autoscaling: # Auto Scaling (Horizontal)
  enabled: true # Auto Scaling enable 
  minReplicas: 1 # Minimal replica count
  maxReplicas: 10 # Maximal replica count
  metrics: # Target´s of auto scaling
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
        
```

## Contato
Desenvolvido por: [Ismael Alves](https://github.com/ismaelalvesgit) 🤓🤓🤓

* Email: [cearaismael1997@gmail.com](mailto:cearaismael1997@gmail.com) 
* Github: [github.com/ismaelalvesgit](https://github.com/ismaelalvesgit)
* Linkedin: [linkedin.com/in/ismael-alves-6945531a0/](https://www.linkedin.com/in/ismael-alves-6945531a0/)

## Customização de Configurações do projeto
Verifique [Configurações e Referencias](https://dotnet.microsoft.com/pt-br/apps/aspnet).