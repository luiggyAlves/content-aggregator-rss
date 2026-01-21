import Parser from "rss-parser";
import promptModule from 'prompt-sync'

const prompt = promptModule({sigint:true})
const parser = new Parser()
// Lendo e analisando um feed RSS
const parseFeedsRss = async (urls, feedItems, chave, customItems)=>{
    // para cada url do vetor urls, fazer a requisição e o tratamento do conteúdo e armazenar como um objeto Promisse no vetor awaitableRequests
   const awaitableRequests = urls.map(url=>parser.parseURL(url))
   // aguardar a resolução de todas as promisses, que retornarão o contéudo dos urls em forma de objeto e armazenar o conteúdo no vetor responses
   const responses = await Promise.all(awaitableRequests)
   aggregate(responses, feedItems, chave) // função personalizada que combinará os resultados do feedRSS
   print(feedItems, customItems) // função personalizada
};

const aggregate = (responses, feedItems, chave) =>{
    // extrai apenas os itens de responses (objetos) e tranforma em um vetor
    for(let {items} of responses){
    // extrai o titulo e o link de cada item e o inclui no vetor feedItems caso o o titulo do item contenha a chave buscada
        for(let {title, link} of items){
            if(title.toLowerCase().includes(chave.toLowerCase())){
                feedItems.push({title, link})
            }
        }
    }
    return feedItems
};

const print = (feedItems, customItems)=>{
    // criar a lógica para permitir que o usuário adicione items customizados no feed
    const res = prompt('Add item: ')
    // divide a string de entrada, o que estiver antes da virgula vai para title, o que estiver depois vai para link
    const [title, link] = res.split(',')
    // caso as duas entradas sejam validas, um objeto com title e link respectivos será adicionado ao vetor custoItems
    if(![title,link].includes(undefined)){
        customItems.push({title,link})
    }

    console.clear()
    console.table(feedItems.concat(customItems))
    console.log(`Updated: ${(new Date()).toUTCString()}`)
}

// o feed RSS está em constante atualização, então nossa aplicação também deve estar, por isso, faremos uma requisição e retornaremos o novo conteúdo criado a cada 2 segundos (2000 ms) e informaremos a data e a hora da atualização, para sempre manter o leitor atualizado
let chave = prompt("Digite a chave buscada: ")
const customItems = []
setInterval(()=>{
    const urls = [
        'http://bonappetit.com/feed/recipes-rss-feed/rss',
        'https://nononsense.cooking/rss/feed.en-US.xml',
        'https://www.100daysofrealfood.com/feed/'
    ]
    const feedItems = []
    parseFeedsRss(urls, feedItems, chave, customItems)
},2000) // set interval recebe a função que será chamada, para ele mesmo chamar e não a chamada da função