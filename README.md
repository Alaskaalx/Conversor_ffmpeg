Canivete Web - Edição de Mídia e Utilitários
Uma aplicação web local desenvolvida em Node.js, Express e Bootstrap 5 que atua como um "Canivete Suíço" para manipulação de arquivos. Atualmente, o sistema conta com um módulo de edição de vídeo (corte e conversão) que utiliza o poder do FFmpeg rodando no backend, oferecendo pré-visualização em tempo real diretamente no navegador.
Tecnologias Utilizadas
Backend: Node.js, Express, Multer (para upload temporário), Child Process.
Frontend: HTML5, Bootstrap 5, SweetAlert2.
Processamento de Mídia: FFmpeg.
Pré-requisitos e Configuração do Sistema
Para que o projeto funcione, o seu computador precisa ter duas ferramentas instaladas: o Node.js (para rodar o servidor) e o FFmpeg (para processar os vídeos).
1. Instalação do FFmpeg (Obrigatório)
O FFmpeg é o motor de processamento de áudio e vídeo. Ele não é instalado via Node, mas sim baixado e configurado no próprio Windows.
Baixar o FFmpeg:
Acesse o site oficial: https://ffmpeg.org/download.html
Para Windows, recomenda-se baixar os binários pré-compilados no repositório gyan.dev (ffmpeg-git-full.7z).
Configurar no Windows:
Extraia a pasta baixada para a raiz do seu disco (ex: C:\ffmpeg).
Pressione a tecla Windows, digite "Variáveis de ambiente" e abra as configurações do sistema.
Em "Variáveis do Sistema", procure pela variável Path, clique em Editar e depois em Novo.
Adicione o caminho da pasta bin do FFmpeg (ex: C:\ffmpeg\bin) e salve.
Validar:
Abra o Prompt de Comando (CMD) e digite ffmpeg -version. Se aparecerem os dados da versão, está tudo certo.
2. Instalação do Node.js
Se ainda não possuir o Node instalado:
Acesse https://nodejs.org/ e baixe a versão LTS (Long Term Support).
Instale normalmente (Next > Next > Finish).
Instalação e Execução do Projeto
Siga os passos abaixo no seu terminal (CMD ou PowerShell) dentro da pasta raiz do projeto:
1. Inicialize o gerenciador de pacotes do Node (caso seja a primeira vez):
npm init -y


2. Instale as bibliotecas necessárias para o servidor:
npm install express multer cors fluent-ffmpeg


3. Inicie o servidor:
node server.js


4. Acesse a aplicação:
Abra o seu navegador e acesse: http://localhost:3067
(Nota: O diretório de destino padrão para salvar os arquivos de vídeo gerados pode ser configurado diretamente na interface web).
Estrutura de Diretórios
server.js - Arquivo principal contendo a API e a configuração do servidor Express.
public/index.html - A interface de usuário (Frontend).
upload/ - Pasta temporária gerada automaticamente pelo Multer para processar os vídeos antes do corte.
package.json - Manifesto das dependências do Node.js.
