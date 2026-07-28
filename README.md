# 🌦️ ClimArS

> Uma plataforma de análise, visualização e predição voltada à relação entre clima, saúde respiratória e dados públicos no Brasil.

O projeto Muda-Clima foi desenvolvido no contexto de pesquisa da FURG e reúne dados de saúde, clima e informação geográfica para apoiar a compreensão de padrões relacionados a internações por pneumonia e outros indicadores respiratórios. A proposta é transformar dados públicos em uma experiência interativa, com gráficos, previsões e conteúdo educativo.

## ✨ O que o projeto faz

- Explora dados públicos relacionados a clima e saúde;
- Apresenta visualizações interativas em dashboard;
- Realiza previsões com modelos de machine learning baseados em XGBoost;
- Oferece um chatbot para responder perguntas sobre o projeto;
- Disponibiliza materiais educativos, publicações e tutoriais.

## 🧠 Contexto do projeto

A iniciativa busca mostrar como fatores climáticos podem influenciar a saúde respiratória e contribuir para uma análise mais ampla do impacto do ambiente sobre a população. O sistema combina tecnologias web, aprendizado de máquina e dados abertos para tornar essa análise mais acessível.

## 🛠️ Tecnologias principais

- Node.js + Express para o backend;
- PostgreSQL para armazenamento e consulta de dados;
- HTML, CSS e JavaScript para a interface web;
- Chart.js para gráficos;
- ONNX Runtime para execução dos modelos de previsão;
- Chatbot integrado à aplicação.

## 📁 Estrutura principal

- backend/: servidor, rotas e lógica de API;
- frontend/: páginas, estilos, gráficos e interface do usuário;
- modelos_XGboost_onnx_todas_cidades_pneumonia/: modelos de previsão em formato ONNX;
- materiais-educativos/: conteúdos complementares do projeto.

## ▶️ Como executar localmente

 Acesse no navegador:
   ```text
   https://climars.furg.br/
   ```

## 🔗 Páginas principais

- Home: página inicial do projeto;
- Dashboard: visualização e entrada de dados para previsões;
- Gráficos: exploração de dados e filtros;
- Predição: execução de modelos de machine learning.

## 📌 Observações

Este projeto depende de dados e modelos locais para funcionar corretamente. Para uma experiência completa, é importante ter o ambiente configurado com o banco de dados e os arquivos de modelo disponíveis.

Desenvolvido com foco em ciência de dados, saúde pública e visualização de informações ambientais.
