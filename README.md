# Parliament
A webapp tool for congressional debaters that aims to make sessions more efficient, reliable, and transparent.
## Getting Started
Currently, the main site [parlipro.tech](https://parlipro.tech) is usable only by one chamber at a time. If you would like your own version, follow the steps below:
1. Create a free account on [Render.com](https://render.com).
2. Create a new `web service` from the render dashboard.
3. When asked for `Source Code`, select `Public Git Repository` and enter the url to this repository, which is https://github.com/Agent-AA/Parliament. Most of the following settings except for name should be preset, but if not:
   **(a)** Choose a  `Name` that you like. Keep in mind that the url to your webapp will be in the format Name.render.com.
   **(b)** It's not necessary to `Create a Project` for this webapp, but you can if you want to for some reason.
   **(c)** `Language` should be `Node`.
   **(d)** `Branch` should be `main`.
   **(e)** Pick your `Region`.
   **(f)** `Root Directory` should be empty.
   **(g)** `Build Command` should be `npm install express`.
   **(h)** `Pre-Deploy` command should be empty.
   **(i)** `Start Command` should be `node server.js`.
   **(j)** `Auto-Deploy` should be `Yes`.
4. Your new webapp should automatically deploy and provide you with your URL.

Refer to the Wiki for docs and how to use Parliament.
