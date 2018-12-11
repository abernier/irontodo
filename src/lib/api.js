import defaultsDeep from 'lodash.defaultsdeep';

const errorMessages = [
  'Provide username and password',
  'Please make your password at least 7 characters long for secutiry purposes.',
  'The username already exists',
  'Something went wrong saving user to Database',
  'Something went wrong with automatic login after signup',
  'Something went wrong authenticating user',
  "sorry, we coun't find that account",
  'Something went wrong logging in',
  'Unauthorized',
  'sorry, you must be logged in to create a task'
];

function api(url, options={}) {
  return new Promise(async function (resolve, reject) {
    // Defaults
    defaultsDeep(options, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials: 'include' // see: https://stackoverflow.com/questions/34558264/fetch-api-with-cookie
    })

    // JSON.stringify if forgot
    if (options.headers['Content-Type'] === 'application/json' && typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body);
    }

    let response;
    let json;
    try {
      response = await fetch(`${url}`, options);
      //console.log('response', response);

      json = await response.json();

      //
      // Client errors
      //

      if (json && errorMessages.indexOf(json.message) !== -1) {
        return reject(new Error(`${json.message || response.statusText}`));
      }

      if (response.status > 400) {
        return reject(new Error(`${json.message || response.statusText}`));
      }
      
    } catch(er) {
      return reject(er);
    }

    resolve(json);
    
  });
  
}

export default api;