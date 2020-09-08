# Deployment

[TOC]

# Note

1. You will need to deploy both your backend & frontend to Vercel.

2. There are several steps, please patiently go through each of them.

# Background

## Rationale

Deploy deploy deploy 🚀! While having our _Presto_ working locally is fun and all, there's no point if you can't show it off to everyone else 😎!

## Context

Normally, we have to run both our frontend & backend on terminal. Vercel however, can handle them for us! All we need to do is to configure our HTTP requests in frontend to go to our `deployed URL`, instead of our `localhost URL`.

## Getting Started

- Make sure you are in Presto repository.

# Task

An image guide is available for some of the instructions below. You can toggle their visibility by clicking on the respective text - for example:

<details close>
<summary>Click this line of text to toggle image visibility</summary>

![0.0](assets/0.0.vercel-welcome.png)

</details>

Make sure to also read the tips given by Vercel as you progress. **Don't just blindly follow the instructions given**, as there will be inputs that you will need to modify accordingly for your needs.

## 0. Create Accounts

1. **A private github account:** Vercel requires you to link your repositories to deploy. If you do not currently have an account, you should create one by following the link: https://github.com/signup

2. **A Vercel account:** Vercel offers us a serverless method to deploy our backend repository. The setup is completely free and does not require any payment methods for sign-up. Create an account and select **Continue with GitHub** so that your accounts can be linked: https://vercel.com/signup.

Why do all of this?

<details close>
<summary>Visual explanation of what we're trying to do</summary>
We're attempting to link our code to Vercel. To do this, we will be using a Github account as an intermediary.

![0.0](assets/0.1.github.explained.png)

</details>

## 1. Duplicate your repository to GitHub

1. In a separate window, log in to your GitHub account and select **New repository**.
   <details close>
   <summary>Top Left > Dropdown > New Repository</summary>

   ![image](assets/1.1.new-github-repo.png)

   </details>

2. Name your repository, e.g. "`presto-deploy`", and make sure to select **Private**. Then hit **Create Repository**.
   <details close>
   <summary>Create Repository Form - example details</summary>

   ![image](assets/1.2.new-repo-form.png)

   </details>

3. Just in case you missed it, please ensure the Github repo is **private**.
4. You should be automatically navigated to your created repository. Back on your terminal, use the following code to update your GitHub repository.

```
# Replace <SSH_URL> with your Github repository's SSH URL.
# The SSH URL can be found in the empty Github repo you just created.
# E.g. git@github.com:USERNAME/presto-deploy.git
$ git remote add deploy <SSH_URL>
$ git push deploy
```

After running the command, your GitHub repository should then be populated with the code from your backend.

**NOTE**: **Whenever you want to update your Github repository (hence Vercel as well)**, run `git push deploy` after changes have been added and committed. If you only run `git push` this will send your changes to Gitlab, not Github.

Getting a "`git@github.com: Permission denied (publickey)` or similar access rights error? You'll need to add your SSH-Key to Github! Just like we did for Gitlab in [`git-intro`](https://nw-syd-gitlab.cseunsw.tech/COMP6080/24T3/students/z1234567/git-intro). See instructions below, and then attempt to push again.

- Generate a new SSH Key (optional): https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent
- Add SSH key to Github: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account

## 2. Deploy Server using Vercel

_[Vercel](https://en.wikipedia.org/wiki/Vercel) is a cloud platform as a service company. Vercel architecture is built around [composability](https://en.wikipedia.org/wiki/Composability)._

1. **In your backend working directory**, you will see `vercel` in `package.json`. It will be installed once you first run `npm install`.
2. **In your backend working directory**, you will find a file called `vercel.json`. This essentially configures our Vercel deployment to redirect all routes to the `server.js` file.

   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "api/index.js"
       }
     ]
   }
   ```

3. Add and commit all changes and push them up to the repository:
   ```shell
   $ git push deploy
   ```
   If you forget to add, commit and push deploy, you may get `404 not_found` errors later on.
4. On the Vercel homepage, log into Vercel and then select the `Add New...` button and `Project` selection.
   <details close>
   <summary>Top Left > Add New > Dropdown > Project </summary>

   ![image](assets/2.2.add-new-vercel-project.png)

   </details>

5. Select `Import` on the repository that you created in GitHub.
   <details close>
   <summary>Select Github as the Provider</summary>

   ![image](assets/2.3.connect-vercel-with-github.png)

   </details>
   <details close>
   <summary>Import Git Repository > Import </summary>

   ![image](assets/2.4.import-github.png)

   </details>

   Can't see your github repo? Follow the `Adjust GitHub App Permissions →` link and instructions.

6. Select `Deploy` to deploy your repository and wait shortly for your repository to be built. Make sure to choose the correct directory for deployment, e.g. `backend` or `frontend`.
   <details close>
   <summary> Configure Project > Deploy </summary>

   ![image](assets/2.5.deploy-presto.png)

   </details>

   If successful, you should see a "Congratulations" and on your `Dashboard` see your deployment with a green "Ready" Status.

   First, click on `Inspect Deployment` at the bottom of the page. You should end up on the `Deployment Details` page.
   If the build log mentions `npm ERR! code 1` go back to your project and click on the `Settings` tab. Then scroll down and change the Node version to 16. Afterwards, go back to the `Deployments` tab and click on the ellipsis button of your latest deployment. Then click `Redeploy`.

7. Make your deployed url contain your zID. Go to `Project Settings` > `Domains` > `Edit`, and modify your domain name to include your zID, e.g. `z1234444-presto-be-deploy.vercel.app`.
   <details close>
   <summary> Homepage > Project Menu > Settings </summary>

   ![image](assets/2.7.project-settings.png)

   </details>
   <details close>
   <summary> Project Settings > Domain > Edit </summary>

   ![image](assets/2.8.edit-domain-name.png)

   </details>

8. Congratulations! You've now deployed the backend onto the web...somewhat. If you navigate to your deployed url + `/docs`, you should see the backend in action!

   However, as soon as you try to access routes that manipulate your data store, you'll start running into server errors.

   `Failed PUT '/store' request using API Client`


   Why is this the case? Well, Vercel is a [serverless](https://vercel.com/docs/functions/serverless-functions) deployment option that will only respond when a request is made. Any state variables, including local files e.g. `database.json`, will not be preserved. This means that if we'd implemented persistence - we'd lose it! What's a more robust solution? Instead of reading and writing to a file in our folder, let's read and write our data from an online database.

## 3. Setup Deployed Database

For the project we've been persisting data by writing to a json file, e.g. `database.json`. This however will not work anymore as we can't write to files on Vercel! What we will do instead is **store everything as a key-value pair** in Vercel's online database. So in the case of your backend data storage might look like:

```typescript
{ "teams": ["Real Madrid", "FC Bayern Munich", "Manchester City"] }
```

To set this up, follow these steps:

1. On your deployment page, navigate to the `Storage` tab.
   <details close>
   <summary>Top Bar > Storage </summary>

   ![image](assets/3.1.storage-tab.png)

   </details>

2. Select `Create New Database` and select the `KV` option. You can use any database name, e.g. `Presto Database`, but make sure the `Primary Region` is `Washington, D.C., USA iad1`. **DO NOT SELECT PRIMARY REGION AS SYDNEY** as this will lead to longer round trip times for network requests between your deployment and your database.
   <details close>
   <summary>Create KV Database Form - example details </summary>

   ![image](assets/3.3.database-form.png)

   </details>

3. Afterwards select `Create` and navigate to the database.
4. Navigate to the "`.env.local`" tab. Select show secret and copy the `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
   <details close>
   <summary> All Databases >  KV Database > .env.local </summary>

   ![image](assets/3.4.env.local.tab.png)

   </details>

5. Copy the `KV_REST_API_URL` and `KV_REST_API_TOKEN` inside the `.env` file in your backend directory. You can see them by clicking on the `Show Secret` button.
   Make sure to copy the right token, otherwise, you may get an error later on such as `NOPERM this user has no permissions to run the 'hset' command`.

## 4. Use Deployed Database

The backend has been configured to use either a deployed database or a local database. For deployment, you will need to update the environment variables on vercel to use Vercel KV.

## 5. Deploy your frontend repo

Unlike the backend, it's easy to deploy your frontend. You can simply perform the similar approach as above for frontend deployment. ![image](assets/2.3.connect-vercel-with-github.png)

## Testing and Submitting your DEPLOYED_URL

1. Open [progress.csv](./progress.csv) and modify the `DEPLOYED_URL` to your newly deployed site, e.g. https://z1234444-anything-you-want.vercel.app.

   **A reminder that the `DEPLOYED_URL` must contain your zID exactly once.** You may need to go to Settings > Domains > and edit your deployed url to include your zID.

## Common Issues

  <details close>
  <summary> 1. Vercel is not deploying the code you expect </summary>

- Remember to `git add`, `git commit` and `git push deploy`. This will ensure that Github and hence Vercel receive your updated code.
- After you've pushed your code to GitHub, ensure the commit hash on GitHub matches the one on Vercel.
  ![image](assets/5.6.push.code.home.png)
  ![image](assets/5.7.push.code.github.png)
  ![image](assets/5.8.push.code.deployment.tab.png)

- You can also check if Vercel has the correct files, by clicking on Your project > Source. Ensure that each file is as expected. Check for example if the `DEPLOYED_URL` was updated.
![image](assets/5.4.debug-source.png)
</details>

  <details close>
  <summary> 2. Incorrect format for deployed URL </summary>

- Ensure the URL begins with `http` or `https`. Also check that it **doesn't** end with `/`.
</details>

  <details close>
  <summary> 3. You've changed branches at some point </summary>

- Go to Settings > Git. Scroll down to Production Branch and change the name of the branch.
- Additionally if you go to the Deployments tab, you may see that it says Preview, like in the image below. For the latest deployment, click on the ellipse icon (three horizontal dots) on the very right and click 'Promote to production'.
![image](assets/5.9.deploy.preview.png)
</details>

  <details close>
  <summary> 4. You're getting a 404 error </summary>
  - You have very likely forgotten to push `vercel.json`! Follow the steps in section 1 of Common Issues. 
  </details>

## Debugging tips

  <summary> 1. Check the logs </summary>

- Your project > Deployment > Click on the latest deployment > Log
- Instead of having `server.ts` output to a terminal, it gets output here.
- Any `console.log` statements in your server or function implementations, will also show here.
  ![image](assets/5.2.debug-log.png)
  ![image](assets/5.3.debug-log-console.png)

  </details>

  <details close>
  <summary> 2. General tips & Additional resources </summary>

- Debugging can require running `git push deploy` frequently. Whenever that occurs, it will redeploy your project. Keep in mind that Vercel only allows 100 deployments a day.
- If deployment is failing during setup, read the error message by going to Your project > Deployment > Click on the latest deployment > Read the deployment details.
- [Vercel Error Codes](https://vercel.com/docs/errors)
- [Vercel KV Error Codes](https://vercel.com/docs/storage/vercel-kv/vercel-kv-error-codes)
</details>

# Submission

- Use `git` to `add`, `commit`, and `push` your changes on your master branch. This time, you don't use `git push deploy` as that only updates Vercel and Github, not Gitlab. Your GitLab pipeline should also pass.
- Check that your code has been uploaded to your Gitlab repository on this website (you may need to refresh the page).

**If you have pushed your latest changes to master on Gitlab no further action is required! At the due date and time, we automatically collect your work from what's on your master branch on Gitlab.**
