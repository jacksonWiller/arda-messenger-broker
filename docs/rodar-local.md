Para rodar o projeto localmente usando o Serverless Offline, você precisa fazer alguns ajustes:

Primeiro, instale as dependências:

pnpm install

O erro indica que o handler não foi encontrado. Isso ocorre porque o caminho no arquivo serverless.ts precisa apontar para o arquivo .js gerado pelo webpack, não para o arquivo .ts. A configuração correta é:

export default {
handler: `.webpack/handler.js`
}

Agora você pode iniciar o servidor local:

pnpm start

O servidor irá rodar na porta 4000 conforme configurado no script start do package.json.

Para testar a função hello, você pode fazer uma requisição POST:

curl --location --request POST 'http://localhost:4000/hello' \
--header 'Content-Type: application/json' \
--data-raw '{
"name": "Seu Nome"
}'

O endpoint espera um payload JSON com a propriedade name conforme definido no schema.ts.

Alternativivamente, você pode testar localmente usando o comando:

pnpm sls invoke local -f hello --path src/functions/hello/mock.json
