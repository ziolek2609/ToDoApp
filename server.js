const Joi = require('joi');
const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Task = require('./models/task');
const User = require('./models/user');


mongoose.connect('mongodb://localhost:27017/todoapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Datebase connected")
}).catch(() => {
    console.log("Connecting to database failed...")
})

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const mustacheExpressInstance = mustacheExpress();
mustacheExpressInstance.cache = null;
app.engine('mustache', mustacheExpressInstance);
app.set('view ewngine', 'mustache');
app.set('views', __dirname + '/views');

// ZMIENNE DO WYŚWIETLANIA BŁĘDÓW
let er = '';
let logEr = '';
let regEr = '';



// // INVALID PAGE
// app.get('/*', (req, res) => {
//     res.send("INVALID PAGE")
// })


// LOGIN 
app.get('/', (req, res) => {
    res.render('login.mustache', { logEr: logEr })
})

// REGISTER
app.get('/register', (req, res) => {
    logEr = '';
    res.render('register.mustache', { regEr: regEr })
})

app.post('/register', (req, res) => {

    const { error } = validateUser(req.body.login, req.body.password);
    if (error) {
        regEr = `Error: ${error.details[0].message}`
        res.redirect("/register");
    } else {
        let newUser = new User({ login: req.body.login, password: req.body.password });
        newUser.save()
            .then(result => {
                logEr = '';
                regEr = '';
                res.redirect('/')
            });
    }
})



//SPRAWDZENIE CZY JEST KONTO I OTRZYMANIE LISTY
app.post('/todo', async function(req, res) {
    let login = req.body.login;
    let password = req.body.password;
    var user = await User.findOne({ login: login, password: password });
    if (user === null) {
        logEr = 'Incorrect login or password';
        res.redirect('/');
    }
    if (user !== null) {
        er = '';
        User.find({ login: login, password: password }).then((result) => {
            console.log(result[0].tasks)
            res.render('index.mustache', { login: login, tasks: result[0].tasks, er: er });
        });
    }
});

//NOWY TASK
app.post('/newtask', async(req, res) => {
    const { error } = validateTask(req.body.name);
    if (error) {
        er = `Error: ${error.details[0].message}`
        logEr = '';
        User.find({ login: req.body.login }).then((result) => {
            console.log(result)
            res.render('index.mustache', { login: result[0].login, tasks: result[0].tasks, er: er })
        })
    } else {
        User.findOneAndUpdate({ login: req.body.login }, { $push: { tasks: req.body.name } }, { new: true, useFindAndModify: false }).then((result) => {
            console.log(result);
            res.render('index.mustache', { login: result.login, tasks: result.tasks, er: er });
        })

    }
})

//USUNIĘCIE TASKA
app.post('/deletetask', (req, res) => {
    User.findOneAndUpdate({ login: req.body.login }, { $pull: { tasks: req.body.name } }, { new: true, useFindAndModify: false }).then((result) => {
        console.log(result);
        er = '';
        res.render('index.mustache', { login: result.login, tasks: result.tasks, er: er });
    })
})


//WALIDACJA TASKA I UŻYTKOWANIKA
function validateTask(task) {
    const schema = Joi.string().min(3).required();

    return Joi.validate(task, schema);
}

function validateUser(login, password) {

    loginSchema = Joi.string().min(5).required();
    passwordSchema = Joi.string().min(5).required();

    return Joi.validate(login, loginSchema) && Joi.validate(password, passwordSchema);
}



const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
