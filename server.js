'use strict';
  
const Defacto = require('@starbase/defacto');
const theRules = require('@starbase/therules');

function Server(port, options) {

  const {server, app} = Defacto(port, options);

  const api = (endpoint, options={"rules":[], "kit":{}}) => {

    app.use(endpoint, (req, res) => {

      let rules = options.rules || [];
      let body = req.body || {};
      let kit = options.kit || {};

      theRules(rules, body, kit).then(result=>{

        res.json(result);

      }).catch(err => {

        res.status(err.code||400).json({
          "code":err.code||400,
          "message":err.message||err.toString()||"ERROR!"
        });

      });

    });

  };

  return {"server":server, "app":app, "api":api};

}

module.exports = Server;
