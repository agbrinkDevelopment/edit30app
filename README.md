# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Deployment (GitHub Actions)

`.github/workflows/deploy.yml` builds every push and pull request to `main`, and deploys pushes to `main` to the Azure
Static Web App created by `edit30terraform`. `public/staticwebapp.config.json` makes deep links (react-router) fall back
to `index.html`; if you add a new top-level folder to `public/`, add it to that file's `exclude` list.

One-time setup, before the first push to `main` (Settings > Secrets and variables > Actions), or with the `gh` CLI:

```bash
cd ../edit30terraform
terraform output -raw static_web_app_deployment_token | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --repo agbrinkDevelopment/edit30app
gh variable set REACT_APP_API_URL --repo agbrinkDevelopment/edit30app --body "$(terraform output -raw frontend_api_url)"
```

`REACT_APP_API_URL` is baked into the JavaScript at build time, so the build fails if the variable is missing rather than
silently pointing at `localhost`. The workflow builds with `CI=false` because Create React App otherwise turns lint
warnings into build errors.
