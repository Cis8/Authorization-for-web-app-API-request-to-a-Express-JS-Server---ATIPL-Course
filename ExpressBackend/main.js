const app = require('express')();
const cors = require('cors');
const PORT = 8080;
const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: 'https://dev-32340939.okta.com/oauth2/default'
});
const audience = 'api://default';

app
.use(cors())
.listen(
  PORT,
  () => console.log(`it's alive on http://localhost:${PORT}`)
);



const authenticationRequired = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/Bearer (.+)/);
  if (!match) {
    return res.status(401).send();
  }

  try {
    const accessToken = match[1];
    if (!accessToken) {
      return res.status(401, 'Not authorized').send();
    }
    console.log('Authorized: ' + accessToken);
    req.jwt = await oktaJwtVerifier.verifyAccessToken(accessToken, audience);
    next();
  } catch (err) {
    return res.status(401).send(err.message);
  }
};

app.get('/hello', authenticationRequired, (req, res) => {
  res.json({
    "HelloMesssage": 'HelloWorld'
  })
});

app.get('/whoami', authenticationRequired, (req, res) => {
  res.json(req.jwt?.claims);
});

//req is the incoming data from the client's request. res is the data we want to send it back
app.get('/tshirt', authenticationRequired, (req, res) => {
    res.json({
      "tshirt": '👕',
      "size": "large"
    })
    /*res.status(200).send({
        tshirt: '👕',
        size: 'large'
    })*/
});





//app.all('*', authenticationRequired); // Require authentication for all routes

