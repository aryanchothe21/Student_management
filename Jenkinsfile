pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Test') {
            steps {
                bat 'npm test'
            }
        }
        stage('Build Docker image') {
            steps {
                bat 'docker build -t student-management:%BUILD_NUMBER% .'
            }
        }
        stage('Deploy container') {
            steps {
                bat '''
                    docker rm -f student-management 2>NUL
                    docker run -d --name student-management -p 3000:3000 student-management:%BUILD_NUMBER%
                '''
            }
        }
    }
}
