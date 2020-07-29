module.exports = app => {
    app.post('/signup', app.src.api.user.save);
    app.post('/signin', app.src.api.auth.signin);

    app.route('/tasks')
        .all(app.src.config.passport.authenticate())
        .get(app.src.api.task.getTasks)
        .post(app.src.api.task.save);

    app.route('/tasks/:id')
        .all(app.src.config.passport.authenticate())
        .delete(app.src.api.task.remove);

    app.route('/tasks/:id/toggle')
        .all(app.src.config.passport.authenticate())
        .put(app.src.api.task.toggleTask)
}
