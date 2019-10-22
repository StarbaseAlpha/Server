'use strict';
  
const theRules = require('@starbase/therules');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

function Server(port=null,options={"staticPath":null,"jsonLimit":1024*1024*1,"maxAge":1000 * 10,"cors":null}) {

  if (!port || typeof port !== 'number') {
    let err = new Error('Missing port!');
    throw(err);
    return null;
  }

  const app = express();

  app.use(compression());
  app.use(helmet());

  if (options.cors && typeof options.cors === 'object') {
    app.use(cors(options.cors));
  }
  if (options.staticPath && typeof options.staticPath === 'string') {
    app.use(express.static(options.staticPath,{"maxAge":(options.maxAge||1000 * 10)}));
  }

  app.use(express.json({
    "limit":(options.jsonLimit || 1024 * 1024 * 1)
  }));

  app.use((err,req,res,next)=>{
    res.status(400).json({"code":400,"message":err.message||err.toString()});
  });

  const server = app.listen(port,(err)=>{
    if (err) {
      throw(err);
      return null;
    }
  });

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
