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

let er = '';
let logEr = '';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const mustacheExpressInstance = mustacheExpress();
mustacheExpressInstance.cache = null;
app.engine('mustache', mustacheExpressInstance);
app.set('view ewngine', 'mustache');
app.set('views', __dirname + '/views');


app.get('/', (req, res) => {
    res.render('login.mustache', { logEr: logEr })
})

app.get('/todo', (req, res) => {
    logEr = '';
    Task.find({}).then((results) => res.render('index.mustache', { tasks: results, er: er }))
})

app.post('/todo', async(req, res) => {
    let login = req.body.login;
    let password = req.body.password;
    let user = await User.findOne({ login: login, password: password });
    if (user === null) {
        logEr = 'Incorrect login or password';
        res.redirect('/');
    }
    if (user !== null) {
        er = '';
        Task.find({}).then((results) => res.render('index.mustache', { tasks: results, er: er }));
    }
});

app.post('/newtask', (req, res) => {

    const { error } = validateTask(req.body.name);
    if (error) {
        er = `Error: ${error.details[0].message}`
        res.redirect("/todo");
    } else {
        let newTask = new Task({ name: req.body.name });
        newTask.save()
            .then(result => {
                er = '';
                res.redirect('/todo')
            });
    }
})

app.get('/task/:id/delete', (req, res) => {
    Task.findByIdAndRemove(req.params.id).then(() => res.redirect('/todo'))
})

function validateTask(task) {
    const schema = Joi.string().min(3).required();

    return Joi.validate(task, schema);
}



const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));