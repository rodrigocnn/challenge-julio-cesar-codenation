const axios = require('axios')
const fs = require('fs')
const sha1 = require('sha1')
const FormData = require('form-data');
require('dotenv/config');
const TOKEN =  process.env.TOKEN

function getData(){
    axios.get(`https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${TOKEN}`)
    .then(function(response){
        saveData(response.data) // Salva Dados no Disco
    })   
}

function saveData(data){
    fs.writeFile(__dirname + '/answer.json', JSON.stringify(data), err=>{
        console.log(err || 'Arquivo JSON Salvo com Sucesso')
    })
}

function openTextEncode(){
    const path = (__dirname + '/answer.json')
    fs.readFile(path, 'utf-8', (err, content)=>{
    const data = JSON.parse(content);
    const textEncode = data.cifrado.toLowerCase()
        decodeText(textEncode, data.numero_casas)
    })    
}

function decodeText(text, number){
  let textDecode =  text.replace(/[a-z0-9\.]/g, function(x){
    let matchesnumber = x.match(/\d+/g);
    let shift = (26 - number) % 26;
         return  (x === '.' || matchesnumber != null) ? x : String.fromCharCode((x.charCodeAt(0) - 97 + shift) % 26 + 97)
       
  })

    updateDecrifed(textDecode)
}


function updateDecrifed(textDecode){
    const path = (__dirname + '/answer.json')
    fs.readFile(path, 'utf8', function(err, data) {  
        if (err) throw err;
        const content = JSON.parse(data)
        content.decifrado = textDecode
        content.resumo_criptografico = sha1(textDecode)
        saveData(content)
        sendData()
    })

}

function sendData(){

    const filePath = (__dirname + '/answer.json')
    const URL = 'https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=77fb416b3aaec6c5c191f3779e38e59f5653335e'
    let form = new FormData();
    const config = {headers:  form.getHeaders() }
    form.append('answer', fs.createReadStream(filePath), { filename: 'answer.json'});

    axios.post(URL, form, config)
        .then((resp) => {
            console.log('O arquivo answer.json foi enviado com sucesso!', resp.data.score)
        }).catch(err => {
            console.log('O arquivo answer.json NÃO foi enviado , Erro', err.response.data.message)
        })    

}


// [x] Realizar requisição e salvar arquivo chamado  answer.json
// [x] Decifrar o texto e atualizar arquivo JSON no campo decifrado
// [x] Gerar um resumo criptográfico do texto decifrado usando o algoritmo sha1 e atualizar JSON
// [x] Submeter Via Post para Correção https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=SEU_TOKEN

getData()
openTextEncode()

