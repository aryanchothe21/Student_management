# Student Management DevOps Lab

A small Node.js student CRUD application with an in-memory data store, Docker image, and Jenkins pipeline. It uses only Node.js built-in modules, so there are no npm dependencies to install.

> **Demo limitation:** student data is kept in memory and resets when the app restarts or the container is replaced. This keeps the practical focused on Node.js, Docker, and Jenkins rather than database setup.

## 1. Run locally

Install Node.js 18 or newer, open PowerShell in this project folder, and run:

```powershell
node --version
npm start
```

Open [http://localhost:3000](http://localhost:3000). Add, edit, and delete students. In another PowerShell window, run the tests:

```powershell
npm test
```

The JSON API is:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/students` | List students |
| POST | `/api/students` | Add a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |

## 2. Build and run with Docker

Install and start Docker Desktop, then from the project folder run:

```powershell
docker build -t student-management:1.0 .
docker run --name student-management -p 3000:3000 student-management:1.0
```

Open [http://localhost:3000](http://localhost:3000). Stop the container with `Ctrl+C` in the terminal running it. To remove the stopped container before running again:

```powershell
docker rm student-management
```

`-p 3000:3000` maps port 3000 on your computer to port 3000 in the container.

## 3. Push the project to GitHub

Create an empty GitHub repository (for example, `student-management-devops`) without initializing it with a README. In PowerShell, from this project folder, run:

```powershell
git init
git add .
git commit -m "Add student management DevOps demo"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/student-management-devops.git
git push -u origin main
```

Replace `<YOUR-USERNAME>` with your GitHub username. GitHub may ask you to authenticate in a browser or with a configured credential manager; do not put a password or token in the remote URL.

## 4. Run the Jenkins pipeline

The `Jenkinsfile` checks out the source, runs `npm test`, builds a Docker image tagged with the Jenkins build number, and deploys it as a container named `student-management`. Each successful deployment replaces the previous container.

1. Use a Windows Jenkins agent with Node.js 18+ and Docker CLI installed, and permission to access the Docker daemon. For a classroom demo, Jenkins and Docker can run on the same machine if the agent is configured appropriately.
2. In Jenkins, choose **New Item → Pipeline**.
3. Under **Pipeline**, choose **Pipeline script from SCM**, select **Git**, enter your GitHub repository URL, choose the `main` branch, and set **Script Path** to `Jenkinsfile`.
4. Commit and push the `Jenkinsfile` to GitHub, then select **Build Now**. Open the build and its **Console Output** to show the test, image build, and deployment results.

After a successful build, open [http://localhost:3000](http://localhost:3000) on the machine running Docker. The Jenkins account must be able to run Docker commands. Port 3000 must be available; if another process or container is already using it, stop that service or change the host port mapping in the Jenkinsfile.

### Optional: build automatically after a GitHub push

Configure a GitHub webhook pointing to `http://<JENKINS-HOST>/github-webhook/` and enable the GitHub push trigger on the Jenkins pipeline job. Jenkins must be reachable by GitHub, and the GitHub plugin/webhook integration must be configured. For a local-only lab, press **Build Now** instead.
