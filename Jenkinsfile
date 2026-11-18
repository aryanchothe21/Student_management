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
                bat 'docker build -t student-management:${BUILD_NUMBER} .'
            }
        }
    }
}
