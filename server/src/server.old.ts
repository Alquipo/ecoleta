import express, { request, response } from 'express';

const app = express();

app.use(express.json());

// /Rota: Endereço completo da requisição
// Recurso: qual entidade estamos acessando do sistemas

//GET: Buscar uma ou mais informações do back-end
//POST: Criar uma nova informação no back-end
//PUT: Atualizar uma informação existente no back-end
//DELETE: Deletar uma informação do back-end


//Request Params: Parametros que vem na propria rota que identificam um recurso
//Query Params:Parametros que vem na propria rota geralmente opcionais para filtros e paginacao
//Request Body: Parametros para criação/atualização de informações

const users = [
    'Alquipo',
    'Lucas',
    'Davi',
    'Analia'
];

app.get('/users', (request, response)=>{
    const search = String(request.query.search);

    const filteredUsers = search ? users.filter(user => user.includes(search)) : users;

    return response.json(filteredUsers);
});

app.get('/users/:id', (request, response)=> { //: dois pontos serve para informar que irá receber um parametro
    const id = Number(request.params.id);

    const user = users[id];

    return response.json(user)
})

app.post('/users', (request, response) =>{
    const data = request.body;

   

    const user = {
        name: data.name,
        email: data.email
    };

    return response.json(user);
});


app.listen(3333)