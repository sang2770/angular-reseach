export const files = {
  'index.js': {
    file: {
      contents: `
    import express from 'express';
    const app = express();
    const port = 3111;

    app.get('/', (req, res) => {
      res.send('Welcome to a WebContainers app! 🥳');
    });

    app.listen(port, () => {
      console.log(\`App is live at http://localhost:\${port}\`);
    });
      `,
    },
  },
  'package.json': {
    file: {
      contents: `
    {
      "name": "web-container",
      "type": "module",
      "version": "1.0.0",
      "main": "index.js",
      "scripts": {
        "start": "nodemon --watch './' index.js"
      },
      "dependencies": {
        "express": "latest",
        "nodemon": "latest"
      }
    }
    `,
    },
  },
};
